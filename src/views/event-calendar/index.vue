<template>
  <div class="event-calendar-page qd-workspace-page qd-page-frame" :class="{ 'theme-dark': isDarkTheme }">
    <a-row :gutter="16">
      <a-col :xs="24" :lg="17">
        <a-card :title="$t('events.title')">
          <a-tabs v-model="activeTab">
            <a-tab-pane key="market" :tab="$t('events.market.title')">
              <market-calendar />
            </a-tab-pane>
            <a-tab-pane v-if="isAdmin" key="research" :tab="$t('earningsResearch.title')">
              <earnings-research />
            </a-tab-pane>
            <a-tab-pane key="upcoming" :tab="$t('events.tab.upcoming')">
              <a-table
                :columns="upcomingColumns"
                :data-source="upcoming"
                :loading="loadingUpcoming"
                :pagination="false"
                :scroll="{ x: 850 }"
                :row-key="row => row.symbol + row.event_date"
                size="middle"
              >
                <template slot="daysUntil" slot-scope="days">
                  <a-tag v-if="badge(days)" color="orange">{{ $t(badge(days).key, { days }) }}</a-tag>
                  <span v-else>{{ days }}</span>
                </template>
                <template slot="source" slot-scope="text, row">
                  <a-tag v-if="row.in_watchlist">{{ $t('events.source.watchlist') }}</a-tag>
                  <a-tag v-if="row.in_positions" color="blue">{{ $t('events.source.position') }}</a-tag>
                </template>
                <template slot="freshness" slot-scope="text, row">
                  <span>{{ text }}</span>
                  <a-tag v-if="row.stale" color="orange">{{ $t('events.stale') }}</a-tag>
                </template>
              </a-table>
              <a-empty v-if="!loadingUpcoming && !upcoming.length" :description="$t('events.emptyUpcoming')" />
            </a-tab-pane>

            <a-tab-pane key="digests" :tab="$t('events.tab.digests')">
              <a-spin :spinning="loadingDigests">
                <a-empty v-if="!loadingDigests && !digests.length" :description="$t('events.emptyDigests')" />
                <a-collapse v-else :bordered="false">
                  <a-collapse-panel v-for="item in digests" :key="item.symbol + item.event_date + item.created_at">
                    <template slot="header">
                      <strong>{{ item.symbol }}</strong>
                      <span class="digest-date">{{ item.event_date }}</span>
                      <a-tag :color="stanceColor(item.view.stance)">{{ $t('events.stance.' + item.view.stance) }}</a-tag>
                      <a-tag>{{ $t(actionKey(item.view.suggested_action)) }}</a-tag>
                      <span class="digest-headline">{{ item.view.headline }}</span>
                    </template>
                    <p>
                      {{ $t('events.digest.confidence') }}: {{ item.view.confidencePct }}% ·
                      {{ $t('events.digest.sentAt') }}: {{ item.created_at }}
                    </p>
                    <div v-for="section in sections" :key="section.field">
                      <template v-if="item.view[section.field].length">
                        <h4>{{ $t(section.label) }}</h4>
                        <ul><li v-for="(line, i) in item.view[section.field]" :key="i">{{ line }}</li></ul>
                      </template>
                    </div>
                    <p v-if="item.view.options_note">
                      <strong>{{ $t('events.digest.options') }}:</strong> {{ item.view.options_note }}
                    </p>
                    <p class="digest-disclaimer">{{ $t('events.disclaimer') }}</p>
                    <p v-if="item.channels && Object.keys(item.channels).length">
                      {{ $t('events.digest.delivery') }}:
                      <a-tag v-for="(state, channel) in item.channels" :key="channel">
                        {{ $t('events.channel.' + channel) }}: {{ $t('events.delivery.' + state) }}
                      </a-tag>
                    </p>
                  </a-collapse-panel>
                </a-collapse>
              </a-spin>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="7">
        <digest-settings-card />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { getEventDigests, getUpcomingEvents } from '@/api/events'
import DigestSettingsCard from './DigestSettingsCard'
import MarketCalendar from './MarketCalendar'
import EarningsResearch from './EarningsResearch'
import { actionKey, earningsBadge, normalizeDigest, stanceColor } from './eventCalendarFormat.mjs'

export default {
  name: 'EventCalendar',
  components: { DigestSettingsCard, MarketCalendar, EarningsResearch },
  data () {
    return {
      activeTab: 'market',
      upcoming: [],
      digests: [],
      loadingUpcoming: false,
      loadingDigests: false,
      sections: [
        { field: 'bull_case', label: 'events.digest.bullCase' },
        { field: 'bear_case', label: 'events.digest.bearCase' },
        { field: 'what_to_watch', label: 'events.digest.watch' },
        { field: 'risks', label: 'events.digest.risks' }
      ]
    }
  },
  computed: {
    isAdmin () {
      const user = this.$store.state.user
      const roles = [user.info && user.info.role, ...(Array.isArray(user.roles) ? user.roles : [user.roles])]
      return roles.some(role => role === 'admin' || (role && role.id === 'admin'))
    },
    isDarkTheme () {
      return ['dark', 'realdark'].includes(this.$store.state.app.theme)
    },
    upcomingColumns () {
      return [
        { title: this.$t('events.col.symbol'), dataIndex: 'symbol' },
        { title: this.$t('events.col.date'), dataIndex: 'event_date' },
        { title: this.$t('events.col.updatedAt'), dataIndex: 'fetched_at', scopedSlots: { customRender: 'freshness' } },
        { title: this.$t('events.col.daysUntil'), dataIndex: 'days_until', scopedSlots: { customRender: 'daysUntil' } },
        { title: this.$t('events.col.epsEstimate'), dataIndex: 'eps_estimate', customRender: v => (v == null ? '-' : v.toFixed(2)) },
        {
          title: this.$t('events.col.revenueEstimate'),
          dataIndex: 'revenue_estimate',
          customRender: v => (v == null ? '-' : Number(v).toLocaleString(this.$i18n.locale))
        },
        { title: this.$t('events.col.source'), key: 'source', scopedSlots: { customRender: 'source' } }
      ]
    }
  },
  mounted () {
    this.activeTab = this.allowedTab(this.$route.query.tab)
    this.loadUpcoming()
    this.loadDigests()
  },
  watch: {
    '$route.query.tab' (tab) {
      this.activeTab = this.allowedTab(tab)
    }
  },
  activated () {
    this.loadUpcoming()
    this.loadDigests()
  },
  methods: {
    allowedTab (tab) { return ['market', 'upcoming', 'digests', ...(this.isAdmin ? ['research'] : [])].includes(tab) ? tab : 'market' },
    stanceColor,
    actionKey,
    badge: earningsBadge,
    async loadUpcoming () {
      if (this.loadingUpcoming) return
      this.loadingUpcoming = true
      try {
        const res = await getUpcomingEvents(30)
        this.upcoming = res && res.code === 1 && Array.isArray(res.data) ? res.data : []
      } catch (e) {
        this.$message.error(this.$t('events.loadFailed'))
      } finally {
        this.loadingUpcoming = false
      }
    },
    async loadDigests () {
      if (this.loadingDigests) return
      this.loadingDigests = true
      try {
        const res = await getEventDigests(50)
        const rows = res && res.code === 1 && Array.isArray(res.data) ? res.data : []
        this.digests = rows.map(row => ({ ...row, view: normalizeDigest(row.digest) }))
      } catch (e) {
        this.$message.error(this.$t('events.loadFailed'))
      } finally {
        this.loadingDigests = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.event-calendar-page { padding: 16px; }
.event-calendar-page ::v-deep .ant-collapse,
.event-calendar-page ::v-deep .ant-collapse-content {
  background: var(--qd-surface);
  color: var(--qd-text);
  border-color: var(--qd-border);
}
.event-calendar-page ::v-deep .ant-collapse-header,
.event-calendar-page ::v-deep .ant-collapse-content h4,
.event-calendar-page ::v-deep .ant-collapse-content p,
.event-calendar-page ::v-deep .ant-collapse-content li {
  color: var(--qd-text);
}
.event-calendar-page ::v-deep .ant-collapse-header { overflow-wrap: anywhere; }
.event-calendar-page ::v-deep .ant-collapse-item { border-color: var(--qd-border); }
.digest-date { margin: 0 8px; opacity: 0.75; }
.digest-headline { margin-left: 8px; }
.digest-disclaimer { margin-top: 12px; font-size: 12px; opacity: 0.65; }
</style>
