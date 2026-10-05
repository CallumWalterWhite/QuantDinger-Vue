<template>
  <div>
    <a-alert class="market-warning" type="warning" show-icon :message="$t('events.market.limitations')" />
    <a-alert v-if="syncEnabled === false" class="market-warning" type="info" show-icon :message="$t('events.market.disabled')" />
    <div class="market-controls">
      <a-select v-model="market" :aria-label="$t('events.market.scope')" @change="reload">
        <a-select-option value="all">{{ $t('events.market.all') }}</a-select-option>
        <a-select-option value="US">{{ $t('events.market.US') }}</a-select-option>
        <a-select-option value="UK">{{ $t('events.market.UK') }}</a-select-option>
      </a-select>
      <a-select v-model="days" :aria-label="$t('events.market.horizon')" @change="reload">
        <a-select-option v-for="n in [7, 30, 90]" :key="n" :value="n">{{ $t('events.market.days', { days: n }) }}</a-select-option>
      </a-select>
      <a-input-search v-model="searchText" :max-length="100" :placeholder="$t('events.market.search')" :aria-label="$t('events.market.search')" @search="search" />
      <a-button :loading="loading" @click="load">{{ $t('events.market.reload') }}</a-button>
    </div>
    <a-alert v-if="failed" class="market-warning" type="error" show-icon :message="$t('events.loadFailed')" />
    <div v-for="item in coverage" :key="item.market" class="market-coverage">
      <strong>{{ $t('events.market.' + item.market) }}:</strong>
      <a-tag :color="item.status === 'ready' ? 'blue' : 'orange'">{{ $t(coverageKey(item.status)) }}</a-tag>
      <span>{{ $t('events.market.counts', { known: item.known_in_window, listings: item.listing_count, excluded: item.excluded_count, unmapped: item.unmapped_count }) }}</span>
      <div>{{ $t('events.col.updatedAt') }}: {{ item.last_success_at || '-' }}</div>
      <div v-if="item.window_end && !item.window_complete">{{ $t('events.market.window', { date: item.window_end }) }}</div>
    </div>
    <a-table
      :columns="columns"
      :data-source="rows"
      :loading="loading"
      :pagination="pagination"
      :row-key="rowKey"
      :scroll="{ x: 950 }"
      size="middle"
      @change="changePage"
    >
      <template slot="market" slot-scope="value">{{ $t('events.market.' + value) }}</template>
      <template slot="certainty" slot-scope="value">{{ $t(dateStatusKey(value)) }}</template>
      <template slot="source" slot-scope="value">{{ value === 'yahoo' ? $t('events.market.provider') : value }}</template>
    </a-table>
    <a-empty v-if="!loading && !failed && !rows.length" :description="$t('events.market.empty')" />
  </div>
</template>

<script>
import { getMarketCalendar } from '@/api/events'
import { marketEventKey, coverageKey, dateStatusKey } from './eventCalendarFormat.mjs'

export default {
  name: 'MarketCalendar',
  data () {
    return { market: 'all', days: 30, searchText: '', query: '', page: 1, pageSize: 50, total: 0, rows: [], coverage: [], syncEnabled: null, loading: false, failed: false, requestId: 0 }
  },
  computed: {
    columns () {
      return [
        { title: this.$t('events.col.symbol'), dataIndex: 'symbol' },
        { title: this.$t('events.market.company'), dataIndex: 'name' },
        { title: this.$t('events.market.scope'), dataIndex: 'market', scopedSlots: { customRender: 'market' } },
        { title: this.$t('events.market.exchange'), dataIndex: 'exchange' },
        { title: this.$t('events.col.date'), dataIndex: 'event_date' },
        { title: this.$t('events.market.certainty'), dataIndex: 'date_status', scopedSlots: { customRender: 'certainty' } },
        { title: this.$t('events.col.source'), dataIndex: 'source', scopedSlots: { customRender: 'source' } }
      ]
    },
    pagination () {
      return { current: this.page, pageSize: this.pageSize, total: this.total, showSizeChanger: false }
    }
  },
  mounted () { this.load() },
  activated () { if (!this.loading) this.load() },
  beforeDestroy () { this.requestId++ },
  methods: {
    coverageKey,
    dateStatusKey,
    rowKey: marketEventKey,
    reload () { this.page = 1; return this.load() },
    search () { this.query = this.searchText.trim().slice(0, 100); return this.reload() },
    changePage (pagination) { this.page = pagination.current; return this.load() },
    async load () {
      const requestId = ++this.requestId
      this.loading = true
      this.failed = false
      this.rows = []
      this.coverage = []
      this.total = 0
      try {
        const response = await getMarketCalendar({ market: this.market, days: this.days, q: this.query, page: this.page, page_size: this.pageSize })
        if (requestId !== this.requestId) return
        if (!response || response.code !== 1 || !response.data || !Array.isArray(response.data.items)) throw new Error('invalid_calendar_response')
        this.rows = response.data.items
        this.total = response.data.total
        this.coverage = Array.isArray(response.data.coverage) ? response.data.coverage : []
        this.syncEnabled = response.data.sync_enabled
      } catch (error) {
        if (requestId === this.requestId) this.failed = true
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.market-warning { margin-bottom: 12px; }
.market-controls { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.market-controls .ant-select { min-width: 130px; }
.market-controls .ant-input-search { flex: 1 1 180px; max-width: 360px; }
.market-coverage { margin-bottom: 12px; font-size: 12px; overflow-wrap: anywhere; color: var(--qd-text, #1f2937); }
.market-coverage .ant-tag { margin-left: 8px; }
</style>
