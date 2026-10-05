<template>
  <section>
    <p>{{ $t('earningsResearch.scope') }}</p>
    <a-alert :message="$t('earningsResearch.aiDisabled')" type="info" show-icon />
    <p v-if="error" role="alert">{{ $t('researchIngestion.failure') }}</p>
    <p>{{ $t('researchIngestion.directory') }}: {{ summary.directory_total || 0 }} · {{ $t('earningsResearch.candidates') }}: {{ summary.candidate_total || 0 }} · {{ $t('earningsResearch.events') }}: {{ summary.candidate_event_total || 0 }}</p>
    <p v-for="kind in ['prices', 'news', 'documents']" :key="kind">{{ $t('earningsResearch.' + kind) }}: {{ sourceSummary(summary.source_counts, kind) }}</p>
    <div class="research-controls">
      <a-select v-model="market" :disabled="!!pendingRequest" :aria-label="$t('researchIngestion.market')" @change="selectionChanged">
        <a-select-option value="all">{{ $t('events.market.all') }}</a-select-option>
        <a-select-option value="US">{{ $t('researchIngestion.US') }}</a-select-option>
        <a-select-option value="UK">{{ $t('researchIngestion.UK') }}</a-select-option>
      </a-select>
      <a-select v-model="days" :disabled="!!pendingRequest" :aria-label="$t('events.market.horizon')" @change="selectionChanged">
        <a-select-option v-for="value in [7, 30, 90]" :key="value" :value="value">{{ $t('events.market.days', { days: value }) }}</a-select-option>
      </a-select>
      <a-select v-model="mode" :aria-label="$t('earningsResearch.directory')" @change="selectionChanged">
        <a-select-option value="directory">{{ $t('earningsResearch.directory') }}</a-select-option>
        <a-select-option value="candidates">{{ $t('earningsResearch.candidates') }}</a-select-option>
      </a-select>
      <a-input-search v-model="query" :max-length="100" :placeholder="$t('researchIngestion.search')" @search="selectionChanged" />
      <a-select v-model="stateFilter" :aria-label="$t('fundamentalSync.state')" @change="selectionChanged">
        <a-select-option value="">{{ $t('researchIngestion.all') }}</a-select-option>
        <a-select-option v-for="state in ['ready', 'partial', 'stale', 'no_data', 'unsupported']" :key="state" :value="state">{{ stateLabel(state) }}</a-select-option>
      </a-select>
      <a-button @click="load">{{ $t('events.market.reload') }}</a-button>
      <a-button type="primary" :loading="starting" :disabled="!summary.evidence_enabled" @click="start">{{ $t('earningsResearch.prepare') }}</a-button>
    </div>
    <p v-if="!summary.evidence_enabled">{{ $t('earningsResearch.disabled') }}</p>
    <a-table
      :columns="columns"
      :data-source="rows"
      row-key="listing_id"
      :loading="loading"
      size="small"
      :scroll="{ x: 1000 }"
      :pagination="{ current: page, pageSize: 50, total, showSizeChanger: false }"
      @change="pageChanged">
      <template slot="symbol" slot-scope="value, row"><a @click="openEvidence(row)">{{ value }}</a></template>
      <template slot="date" slot-scope="value, row">{{ value || $t('researchIngestion.unknown') }}<br><small v-if="value">{{ $t('events.market.date.' + row.date_status) }}</small></template>
      <template slot="state" slot-scope="value">{{ stateLabel(value) }}</template>
      <template slot="work" slot-scope="value, row">
        <span v-if="row.waiting_for_financial_sync">{{ $t('earningsResearch.waiting') }}</span>
        <span v-else>{{ value ? stateLabel(value) : $t('researchIngestion.unknown') }}</span>
      </template>
    </a-table>
    <ul v-if="summary.jobs && summary.jobs.length">
      <li v-for="job in summary.jobs" :key="job.id">
        <a @click="openJob(job.id)">{{ $t('fundamentalSync.job') }} #{{ job.id }}</a> · {{ stateLabel(job.status) }} · {{ job.expected_count }}
        <a-button v-if="job.status === 'running'" size="small" @click="cancel(job.id)">{{ $t('earningsResearch.cancel') }}</a-button>
      </li>
    </ul>
    <a-modal :visible="!!selected" :title="$t('earningsResearch.detail')" :footer="null" width="85%" @cancel="closeEvidence">
      <a-spin :spinning="loadingDetail"><earnings-research-detail v-if="bundle" :bundle="bundle" /></a-spin>
    </a-modal>
    <a-modal :visible="!!jobId" :title="$t('fundamentalSync.job')" :footer="null" width="85%" @cancel="closeJob">
      <p v-if="jobData">{{ Object.entries(jobData.counts || {}).map(([state, count]) => stateLabel(state) + ': ' + count).join(' · ') }}</p>
      <p v-for="kind in ['prices', 'news', 'documents']" :key="kind">{{ $t('earningsResearch.' + kind) }}: {{ sourceSummary(jobData && jobData.source_counts, kind) }}</p>
      <a-table
        v-if="jobData"
        :columns="jobColumns"
        :data-source="jobData.items"
        row-key="id"
        :loading="loadingJob"
        :pagination="{ current: jobPage, pageSize: 50, total: jobData.total, showSizeChanger: false }"
        @change="jobPageChanged" />
    </a-modal>
  </section>
</template>

<script>
import { getEarningsResearchCoverage, getEarningsResearchListings, startEarningsResearch, getEarningsResearchEvidence, getEarningsResearchJob, cancelEarningsResearch } from '@/api/earningsResearch'
import EarningsResearchDetail from './EarningsResearchDetail.vue'

export default {
  name: 'EarningsResearch',
  components: { EarningsResearchDetail },
  data () {
    return {
      market: 'all',
      days: 30,
      mode: 'directory',
      query: '',
      stateFilter: '',
      page: 1,
      rows: [],
      total: 0,
      summary: {},
      loading: false,
      error: '',
      generation: 0,
      timer: null,
      destroyed: false,
      starting: false,
      pendingRequest: null,
      selected: null,
      bundle: null,
      detailGeneration: 0,
      loadingDetail: false,
      jobId: null,
      jobPage: 1,
      jobData: null,
      loadingJob: false,
      jobGeneration: 0
    }
  },
  computed: {
    columns () {
      return [
        { title: this.$t('events.col.symbol'), dataIndex: 'symbol', scopedSlots: { customRender: 'symbol' } },
        { title: this.$t('events.market.company'), dataIndex: 'name' },
        { title: this.$t('researchIngestion.exchange'), dataIndex: 'exchange' },
        { title: this.$t('researchIngestion.earnings'), dataIndex: 'event_date', scopedSlots: { customRender: 'date' } },
        { title: this.$t('fundamentalSync.state'), dataIndex: 'state', scopedSlots: { customRender: 'state' } },
        { title: this.$t('fundamentalSync.job'), dataIndex: 'work_status', scopedSlots: { customRender: 'work' } }
      ]
    },
    jobColumns () {
      return [
        { title: this.$t('events.col.symbol'), dataIndex: 'identity_json.symbol' },
        { title: this.$t('researchIngestion.earnings'), dataIndex: 'event_date' },
        { title: this.$t('fundamentalSync.state'), dataIndex: 'status', customRender: value => this.stateLabel(value) }
      ]
    }
  },
  mounted () { this.load() },
  beforeDestroy () { this.stop() },
  deactivated () { this.stop() },
  activated () { if (this.destroyed) { this.destroyed = false; this.load() } },
  methods: {
    sourceSummary (counts, kind) {
      return (counts || []).filter(row => row.kind === kind).map(row => this.stateLabel(row.status) + ': ' + row.n).join(' · ') || this.$t('researchIngestion.unknown')
    },
    stateLabel (state) {
      const known = ['ready', 'partial', 'stale', 'no_data', 'unsupported']
      if (known.includes(state)) return this.$t((state === 'unsupported' ? 'researchIngestion.' : 'fundamentalSync.') + state)
      return this.$t('earningsResearch.status.' + (['running', 'pending', 'complete', 'cancelled', 'superseded', 'unavailable', 'failed'].includes(state) ? state : 'pending'))
    },
    async selectionChanged () { this.page = 1; return this.load() },
    async pageChanged (pagination) { this.page = pagination.current; return this.load() },
    stop () {
      this.destroyed = true
      this.generation++
      this.detailGeneration++
      this.jobGeneration++
      clearTimeout(this.timer)
      this.timer = null
    },
    async load () {
      const generation = ++this.generation
      clearTimeout(this.timer)
      this.loading = true
      this.error = ''
      this.rows = []
      this.summary = {}
      this.total = 0
      const params = { market: this.market, days: this.days, mode: this.mode, q: this.query, state: this.stateFilter, page: this.page, page_size: 50 }
      try {
        const [coverage, listings] = await Promise.all([getEarningsResearchCoverage(params), getEarningsResearchListings(params)])
        if (this.destroyed || generation !== this.generation) return
        if (!coverage || coverage.code !== 1 || !listings || listings.code !== 1) throw new Error('unavailable')
        this.summary = coverage.data
        this.rows = listings.data.items || []
        this.total = listings.data.total || 0
        if ((this.summary.jobs || []).some(job => job.status === 'running')) this.timer = setTimeout(() => this.load(), 30000)
      } catch (error) {
        if (!this.destroyed && generation === this.generation) this.error = 'unavailable'
      } finally {
        if (generation === this.generation) this.loading = false
      }
    },
    async start () {
      if (this.starting) return
      this.starting = true
      this.pendingRequest = this.pendingRequest || {
        market: this.market,
        days: this.days,
        request_id: 'evidence:' + Date.now() + ':' + Math.random().toString(16).slice(2)
      }
      try {
        const result = await startEarningsResearch(this.pendingRequest)
        if (!result || result.code !== 1 || !result.data.dispatched) throw new Error('dispatch')
        this.pendingRequest = null
      } catch (error) { this.$message.error(this.$t('researchIngestion.failure')) } finally { this.starting = false }
      return this.load()
    },
    async openEvidence (row) {
      const generation = ++this.detailGeneration
      this.selected = row
      this.bundle = null
      this.loadingDetail = true
      try {
        const result = await getEarningsResearchEvidence(row.listing_id)
        if (!this.destroyed && generation === this.detailGeneration && result.code === 1) this.bundle = result.data
      } catch (error) { this.$message.error(this.$t('researchIngestion.failure')) } finally {
        if (generation === this.detailGeneration) this.loadingDetail = false
      }
    },
    closeEvidence () { this.detailGeneration++; this.selected = null; this.bundle = null },
    async openJob (id) { this.jobId = id; this.jobPage = 1; return this.loadJob() },
    async jobPageChanged (pagination) { this.jobPage = pagination.current; return this.loadJob() },
    async loadJob () {
      const generation = ++this.jobGeneration
      this.loadingJob = true
      this.jobData = null
      try {
        const result = await getEarningsResearchJob(this.jobId, { page: this.jobPage, page_size: 50 })
        if (!this.destroyed && generation === this.jobGeneration && result.code === 1) this.jobData = result.data
      } catch (error) { this.$message.error(this.$t('researchIngestion.failure')) } finally {
        if (generation === this.jobGeneration) this.loadingJob = false
      }
    },
    closeJob () { this.jobGeneration++; this.jobId = null; this.jobData = null },
    async cancel (id) {
      try { await cancelEarningsResearch(id); await this.load() } catch (error) { this.$message.error(this.$t('researchIngestion.failure')) }
    }
  }
}
</script>

<style scoped>
.research-controls { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
.research-controls .ant-select { min-width: 130px; }
.research-controls .ant-input-search { width: 220px; }
</style>
