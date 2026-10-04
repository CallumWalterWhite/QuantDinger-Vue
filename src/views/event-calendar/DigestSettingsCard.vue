<template>
  <a-card :title="$t('events.settings.title')" size="small" class="digest-settings-card" :loading="loading">
    <a-alert
      v-if="!globalEnabled"
      type="info"
      show-icon
      :message="$t('events.settings.globalDisabled')"
      class="digest-settings-banner"
    />
    <a-form layout="vertical">
      <p>{{ $t('events.settings.channelsHint') }}</p>
      <a-form-item :label="$t('events.settings.enabled')">
        <a-switch v-model="enabled" />
      </a-form-item>
      <a-form-item :label="$t('events.settings.leadDays')" :extra="$t('events.settings.leadDaysHint')">
        <a-input-number v-model="leadDays" :min="0" :max="7" :precision="0" :disabled="!enabled" />
      </a-form-item>
      <a-button type="primary" :loading="saving" @click="save">{{ $t('events.settings.save') }}</a-button>
    </a-form>
  </a-card>
</template>

<script>
import { getDigestSettings, saveDigestSettings } from '@/api/events'
import { clampLeadDays } from './eventCalendarFormat.mjs'

export default {
  name: 'DigestSettingsCard',
  data () {
    return { loading: false, saving: false, enabled: true, leadDays: 3, globalEnabled: true }
  },
  mounted () {
    this.load()
  },
  methods: {
    apply (data) {
      this.enabled = data.enabled !== false
      this.leadDays = clampLeadDays(data.lead_days)
      this.globalEnabled = data.global_enabled !== false
    },
    async load () {
      this.loading = true
      try {
        const res = await getDigestSettings()
        if (res && res.code === 1) this.apply(res.data || {})
        else this.$message.error(this.$t('events.loadFailed'))
      } catch (e) {
        this.$message.error(this.$t('events.loadFailed'))
      } finally {
        this.loading = false
      }
    },
    async save () {
      this.saving = true
      try {
        const res = await saveDigestSettings({ enabled: this.enabled, lead_days: clampLeadDays(this.leadDays) })
        if (res && res.code === 1) {
          this.apply(res.data || {})
          this.$message.success(this.$t('events.settings.saved'))
        } else {
          this.$message.error(this.$t('events.loadFailed'))
        }
      } catch (e) {
        this.$message.error(this.$t('events.loadFailed'))
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.digest-settings-card { margin-top: 16px; }
.digest-settings-card ::v-deep .ant-card-body,
.digest-settings-card p { color: var(--qd-text, #1f2937); }
.digest-settings-card ::v-deep .ant-form-extra { color: var(--qd-text-secondary, #5f6b7a); }
.digest-settings-banner { margin-bottom: 12px; }
</style>
