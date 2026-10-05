<template>
  <section>
    <h3>{{ bundle.listing.symbol }} · {{ bundle.listing.name }}</h3>
    <p>{{ $t('earningsResearch.cutoff') }}: {{ bundle.cutoff }} · {{ $t('researchIngestion.observed') }}</p>
    <p>{{ $t('events.disclaimer') }}</p>
    <h4>{{ $t('earningsResearch.gaps') }}</h4>
    <ul><li v-for="gap in bundle.gaps" :key="gap">{{ gapLabel(gap) }}</li></ul>
    <h4>{{ $t('researchIngestion.financials') }}</h4>
    <p>{{ $t('fundamentalSync.missingFields') }}: {{ (bundle.financial_coverage && bundle.financial_coverage.missing || []).map(field => $t('fundamentalField.' + field)).join(', ') }}</p>
    <a-table
      :columns="financialColumns"
      :data-source="bundle.financials"
      row-key="id"
      :pagination="false"
      size="small"
      :scroll="{ x: 800 }" />
    <h4>{{ $t('earningsResearch.prices') }}</h4>
    <p>{{ $t('earningsResearch.prices') }} ({{ bundle.price_features.currency || $t('researchIngestion.unknown') }}) · {{ $t('researchIngestion.observed') }}</p>
    <p v-for="(value, horizon) in bundle.price_features.returns_pct" :key="horizon">{{ $t('earningsResearch.return', { days: horizon }) }}: {{ Number.isFinite(value) ? value.toFixed(2) + '%' : $t('researchIngestion.unknown') }}</p>
    <div v-for="(source, kind) in bundle.sources" :key="kind">
      <h4>{{ $t('earningsResearch.' + kind) }}</h4>
      <p v-for="gap in source.gaps" :key="gap">{{ gapLabel(gap) }}</p>
      <ul>
        <li v-for="(item, index) in source.data.items || source.data.documents || source.data.leads || []" :key="index">
          <a v-if="safeUrl(item.url)" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.title || item.form || item.url }}</a>
          <p>{{ item.published_at }}</p><p>{{ item.summary || item.text }}</p>
          <ul v-if="item.links && item.links.length">
            <li v-for="(link, linkIndex) in item.links" :key="linkIndex"><a v-if="safeUrl(link.url)" :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.title || link.url }}</a></li>
          </ul>
        </li>
      </ul>
    </div>
    <div v-if="bundle.listing.market === 'UK'">
      <h4>{{ $t('earningsResearch.source') }}</h4>
      <a-input v-model="issuerUrl" :max-length="8192" :placeholder="$t('earningsResearch.source')" />
      <a-checkbox v-model="confirmed">{{ $t('earningsResearch.verify') }}</a-checkbox>
      <a-button :disabled="!confirmed || !safeUrl(issuerUrl)" :loading="saving" @click="saveSource">{{ $t('earningsResearch.saveSource') }}</a-button>
    </div>
  </section>
</template>

<script>
import { verifyEarningsIssuerSource } from '@/api/earningsResearch'

export default {
  name: 'EarningsResearchDetail',
  props: { bundle: { type: Object, required: true } },
  data () { return { issuerUrl: '', confirmed: false, saving: false } },
  computed: {
    financialColumns () {
      return [
        { title: this.$t('earningsResearch.period'), dataIndex: 'period_end' },
        { title: this.$t('researchIngestion.currency'), dataIndex: 'currency' },
        { title: this.$t('fundamentalField.revenue'), dataIndex: 'revenue' },
        { title: this.$t('fundamentalField.net_income'), dataIndex: 'net_income' },
        { title: this.$t('fundamentalField.free_cash_flow'), dataIndex: 'free_cash_flow' },
        { title: this.$t('fundamentalField.total_debt'), dataIndex: 'total_debt' },
        { title: this.$t('fundamentalField.shareholder_equity'), dataIndex: 'shareholder_equity' },
        { title: this.$t('fundamentalField.shares_outstanding'), dataIndex: 'shares_outstanding' }
      ]
    }
  },
  methods: {
    safeUrl (url) {
      try {
        const parsed = new URL(url)
        return parsed.protocol === 'https:' && !parsed.username && !parsed.password && (!parsed.port || parsed.port === '443')
      } catch (error) { return false }
    },
    gapLabel (gap) {
      const key = 'earningsResearch.gap.' + gap
      return this.$te(key) ? this.$t(key) : this.$t('earningsResearch.gapCode', { code: gap })
    },
    async saveSource () {
      this.saving = true
      try {
        const result = await verifyEarningsIssuerSource(this.bundle.listing.id, { issuer_url: this.issuerUrl, confirmed: this.confirmed })
        if (!result || result.code !== 1) throw new Error('unavailable')
        this.confirmed = false
        this.$message.success(this.$t('earningsResearch.saveSource'))
      } catch (error) { this.$message.error(this.$t('researchIngestion.failure')) } finally { this.saving = false }
    }
  }
}
</script>
