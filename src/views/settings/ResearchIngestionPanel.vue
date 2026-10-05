<template>
  <section :class="['research-panel', { 'research-dark': dark }]">
    <h3>{{ $t('researchIngestion.title') }}</h3>
    <p>{{ $t('researchIngestion.scope') }}</p>
    <a-alert type="info" show-icon :message="$t('researchIngestion.limits')" />
    <div class="research-controls">
      <a-select v-model="market" :disabled="saving" :aria-label="$t('researchIngestion.market')" @change="selectionChanged">
        <a-select-option value="US">{{ $t('researchIngestion.US') }}</a-select-option>
        <a-select-option value="UK">{{ $t('researchIngestion.UK') }}</a-select-option>
      </a-select>
      <a-button type="primary" :loading="saving" :disabled="running" @click="start(false)">{{ $t('researchIngestion.sync') }}</a-button>
      <a-button :disabled="saving || running || !canRetry" @click="start(true)">{{ $t('fundamentalSync.retry') }}</a-button>
      <a-button :loading="loading" @click="load()">{{ $t('fundamentalSync.refresh') }}</a-button>
      <a-checkbox v-model="forceFull" :disabled="saving || running">{{ $t('fundamentalSync.forceFull') }}</a-checkbox>
      <label>{{ $t('fundamentalSync.daily') }} <a-switch :checked="scheduled" :disabled="saving" @change="saveSchedule" /></label>
    </div>
    <a-alert v-if="error" type="error" show-icon :message="$t(error)" />
    <div v-if="selected" class="research-summary">
      <div><strong>{{ $t('researchIngestion.directory') }}: {{ selected.listing_count }}</strong><br>
        <a-tag>{{ $t('events.market.status.' + (selected.calendar && selected.calendar.status || 'unavailable')) }}</a-tag><br>
        <span>{{ $t('researchIngestion.catalog') }}: {{ selected.calendar && selected.calendar.last_success_at || '—' }}</span><br>
        <span>{{ $t('researchIngestion.calendar') }}: {{ selected.calendar && selected.calendar.last_success_at || '—' }}</span><br>
        <span>{{ $t('researchIngestion.dated') }}: {{ selected.calendar && selected.calendar.known_in_window || 0 }}</span><br>
        <span>{{ $t('researchIngestion.unknown') }}: {{ Math.max(0, selected.listing_count - (selected.calendar && selected.calendar.known_in_window || 0)) }}</span>
      </div>
      <div><strong>{{ $t('researchIngestion.readiness') }}</strong>
        <div v-for="state in states" :key="state">{{ stateLabel(state) }}: {{ selected.financial_coverage[state] || 0 }}</div>
      </div>
      <div><strong>{{ $t('researchIngestion.financials') }}</strong><br>
        {{ $t('researchIngestion.' + selected.financial_frequency) }}<br>
        <span>{{ $t('researchIngestion.observed') }}</span><br>
        <span v-if="selected.schedule && selected.schedule.cooldown_until">{{ $t('researchIngestion.cooldown') }}: {{ selected.schedule.cooldown_until }}</span>
      </div>
    </div>
    <p v-if="selected && selected.calendar && !selected.calendar.window_complete">{{ $t('events.market.window', { date: selected.calendar.window_end || '—' }) }}</p>
    <div v-if="selected && selected.job" class="research-job">
      <strong>{{ $t('fundamentalSync.job') }} #{{ selected.job.id }} · {{ $t('fundamentalSync.status.' + (selected.job.status === 'expanding' ? 'running' : selected.job.status)) }}</strong>
      <a-progress :percent="progress" :status="running ? 'active' : selected.job.status === 'failed' ? 'exception' : 'normal'" />
      <span>{{ done }}/{{ selected.job.expected_count }} · {{ $t('fundamentalSync.failed') }} {{ counts.failed || 0 }} · {{ $t('researchIngestion.unavailable') }} {{ counts.unavailable || 0 }} · {{ $t('fundamentalSync.skipped') }} {{ counts.skipped || 0 }}</span>
    </div>
    <p>{{ $t('researchIngestion.acceptance') }}: {{ acceptanceLabels }}</p>
    <div class="research-controls">
      <a-input-search v-model="query" :placeholder="$t('researchIngestion.search')" :aria-label="$t('researchIngestion.search')" @search="selectionChanged" />
      <a-select v-model="stateFilter" :aria-label="$t('fundamentalSync.state')" @change="selectionChanged">
        <a-select-option value="">{{ $t('researchIngestion.all') }}</a-select-option>
        <a-select-option v-for="state in states" :key="state" :value="state">{{ stateLabel(state) }}</a-select-option>
      </a-select>
    </div>
    <a-table
      :columns="columns"
      :data-source="rows"
      row-key="listing_id"
      size="small"
      :loading="loading"
      :scroll="{ x: 1350 }"
      :pagination="{ current: page, pageSize: 50, total, showSizeChanger: false }"
      @change="pageChanged">
      <template slot="state" slot-scope="value"><a-tag>{{ stateLabel(value) }}</a-tag></template>
      <template slot="missing" slot-scope="values">{{ (values || []).map(field => $t('fundamentalField.' + field)).join(', ') || '—' }}</template>
      <template slot="date" slot-scope="value">{{ value || $t('researchIngestion.unknown') }}</template>
      <template slot="earnings" slot-scope="value, row">
        {{ value || $t('researchIngestion.unknown') }}
        <small v-if="value">{{ $t('events.market.date.' + (row.date_status || 'unknown')) }}</small>
      </template>
      <template slot="basis">{{ $t('researchIngestion.observed') }}</template>
      <template slot="failure" slot-scope="value">{{ value ? $t('researchIngestion.failure') + ' (' + value + ')' : '—' }}</template>
    </a-table>
    <p class="research-footnote">{{ $t('fundamentalSync.workerNotice') }} {{ $t('researchIngestion.refreshPolicy') }}</p>
  </section>
</template>

<script>
import { getResearchOverview, getResearchListings, getResearchJob, syncResearch, retryResearch, scheduleResearch } from '@/api/settings'

export default {
  name: 'ResearchIngestionPanel',
  props: { dark: { type: Boolean, default: false } },
  data () {
    return {
      market: 'US',
      states: ['ready', 'partial', 'stale', 'no_data', 'unsupported'],
      overview: [],
      rows: [],
      total: 0,
      page: 1,
      query: '',
      stateFilter: '',
      detail: null,
      loading: false,
      saving: false,
      forceFull: false,
      error: '',
      timer: null,
      version: 0,
      alive: true,
      pending: {}
    }
  },
  computed: {
    selected () { return this.overview.find(row => row.market === this.market) },
    running () { return Boolean(this.selected && this.selected.job && ['queued', 'expanding', 'running'].includes(this.selected.job.status)) },
    scheduled () { return Boolean(this.selected && this.selected.schedule && this.selected.schedule.enabled) },
    counts () { return this.detail ? this.detail.counts : {} },
    done () { return ['success', 'unavailable', 'failed', 'skipped'].reduce((sum, key) => sum + (this.counts[key] || 0), 0) },
    canRetry () { return !this.running && this.counts.failed > 0 },
    progress () { return this.selected && this.selected.job && this.selected.job.expected_count ? Math.floor(this.done * 100 / this.selected.job.expected_count) : 0 },
    acceptanceLabels () { return ((this.selected && this.selected.acceptance_fields) || []).map(field => this.$t('fundamentalField.' + field)).join(', ') },
    columns () {
      return [
        { title: this.$t('fundamentalSync.symbol'), dataIndex: 'symbol', width: 120 },
        { title: this.$t('researchIngestion.exchange'), dataIndex: 'exchange', width: 110 },
        { title: this.$t('fundamentalSync.state'), dataIndex: 'state', scopedSlots: { customRender: 'state' }, width: 170 },
        { title: this.$t('researchIngestion.earnings'), dataIndex: 'event_date', scopedSlots: { customRender: 'earnings' }, width: 130 },
        { title: this.$t('fundamentalSync.period'), dataIndex: 'period_end', scopedSlots: { customRender: 'date' }, width: 130 },
        { title: this.$t('researchIngestion.currency'), dataIndex: 'currency', width: 100 },
        { title: this.$t('fundamentalSync.missingFields'), dataIndex: 'missing', scopedSlots: { customRender: 'missing' }, width: 240 },
        { title: this.$t('fundamentalSync.available'), dataIndex: 'available_at', scopedSlots: { customRender: 'date' }, width: 130 },
        { title: this.$t('fundamentalSync.availabilityBasis'), scopedSlots: { customRender: 'basis' }, width: 220 },
        { title: this.$t('researchIngestion.failure'), dataIndex: 'refresh_error', scopedSlots: { customRender: 'failure' }, width: 220 }
      ]
    }
  },
  mounted () { this.load() },
  beforeDestroy () { this.alive = false; this.version++; this.stopPolling() },
  methods: {
    stateLabel (state) { return this.$t((state === 'unsupported' ? 'researchIngestion.' : 'fundamentalSync.') + state) },
    stopPolling () { if (this.timer) clearTimeout(this.timer); this.timer = null },
    selectionChanged () { this.page = 1; this.detail = null; return this.load() },
    pageChanged (pagination) { this.page = pagination.current; return this.load() },
    check (response) { if (!response || response.code !== 1) throw new Error('request_failed'); return response.data },
    async load (silent = false) {
      this.stopPolling()
      const version = ++this.version
      const market = this.market
      if (!silent) this.loading = true
      try {
        const [overview, listings] = await Promise.all([
          getResearchOverview(), getResearchListings({ market, page: this.page, page_size: 50, q: this.query, state: this.stateFilter })
        ])
        if (!this.alive || version !== this.version) return
        this.overview = this.check(overview).markets
        const data = this.check(listings)
        this.rows = data.items; this.total = data.total
        this.detail = null
        if (this.selected && this.selected.job) {
          const detail = await getResearchJob(this.selected.job.id, { page_size: 1 })
          if (!this.alive || version !== this.version) return
          this.detail = this.check(detail)
        }
        this.error = ''
      } catch (error) {
        if (this.alive && version === this.version) this.error = 'researchIngestion.failure'
      } finally {
        if (this.alive && version === this.version) {
          this.loading = false
          if (this.running) this.timer = setTimeout(() => this.load(true), 5000)
        }
      }
    },
    async start (retry) {
      if (this.saving) return
      const market = this.market
      const jobId = retry && this.selected && this.selected.job && this.selected.job.id
      const key = retry ? `${market}:retry:${jobId}` : `${market}:sync:${this.forceFull}`
      if (!this.pending[key]) this.pending[key] = `research:${Date.now()}:${Math.random().toString(36).slice(2)}`
      this.saving = true; this.error = ''
      try {
        const data = { market, request_id: this.pending[key], incremental: !this.forceFull }
        this.check(retry ? await retryResearch(jobId, data) : await syncResearch(data))
        delete this.pending[key]
        if (this.alive) await this.load()
      } catch (error) {
        if (this.alive) this.error = 'researchIngestion.failure'
      } finally { if (this.alive) this.saving = false }
    },
    async saveSchedule (enabled) {
      if (this.saving) return
      this.saving = true; this.error = ''
      try {
        this.check(await scheduleResearch({ market: this.market, enabled }))
        if (this.alive) await this.load()
      } catch (error) {
        if (this.alive) this.error = 'researchIngestion.failure'
      } finally { if (this.alive) this.saving = false }
    }
  }
}
</script>

<style scoped>
.research-panel { margin-top: 24px; padding: 24px; border: 1px solid #dbe4ee; border-radius: 12px; background: #fff; color: #24354a; }
.research-panel h3 { color: inherit; }
.research-controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin: 18px 0; }
.research-controls .ant-select { min-width: 180px; }
.research-controls .ant-input-search { max-width: 280px; }
.research-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; padding: 16px; background: #f3f6fa; border-radius: 8px; overflow-wrap: anywhere; }
.research-job { margin: 20px 0; }
.research-footnote { margin: 16px 0 0; font-size: 12px; }
.research-dark { background: #18222f; border-color: #364457; color: #e3eaf3; }
.research-dark .research-summary { background: #202e40; }
.research-dark ::v-deep .ant-checkbox-wrapper,
.research-dark ::v-deep .ant-progress-text { color: #e3eaf3; }
@media (max-width: 700px) { .research-panel { padding: 14px; } .research-summary { grid-template-columns: 1fr; } .research-controls > label { width: 100%; } }
</style>
