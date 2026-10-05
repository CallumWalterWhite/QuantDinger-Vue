import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import translations from '../../src/locales/lang/research-ingestion.js'

function harness (overrides = {}) {
  const source = fs.readFileSync(new URL('../../src/views/settings/ResearchIngestionPanel.vue', import.meta.url), 'utf8')
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '').replace('export default', 'component =')
  const context = {
    getResearchOverview: async () => ({ code: 1, data: { markets: [] } }),
    getResearchListings: async () => ({ code: 1, data: { items: [], total: 0 } }),
    getResearchJob: async () => ({ code: 1, data: { counts: {} } }),
    syncResearch: async () => ({ code: 1 }), retryResearch: async () => ({ code: 1 }),
    scheduleResearch: async () => ({ code: 1 }), setTimeout: () => 1, clearTimeout: () => {}, ...overrides
  }
  vm.runInNewContext(script, context)
  const options = context.component
  const state = { ...options.data(), $t: key => key }
  Object.entries(options.methods).forEach(([key, method]) => { state[key] = method.bind(state) })
  Object.entries(options.computed).forEach(([key, fn]) => Object.defineProperty(state, key, { get: fn.bind(state) }))
  return { state, options }
}

test('ambiguous submission reuses its request ID until confirmed', async () => {
  const calls = []
  const { state } = harness({ syncResearch: async data => {
    calls.push(data)
    if (calls.length === 1) throw new Error('network')
    return { code: 1 }
  } })
  await state.start(false)
  await state.start(false)
  assert.equal(calls[0].request_id, calls[1].request_id)
  assert.equal(calls[0].incremental, true)
  await state.start(false)
  assert.notEqual(calls[1].request_id, calls[2].request_id)
})

test('market changes ignore old coverage and reset pagination', async () => {
  const pending = []
  const { state } = harness({ getResearchListings: () => new Promise(resolve => pending.push(resolve)) })
  state.page = 4
  const first = state.load()
  state.market = 'UK'
  const second = state.selectionChanged()
  await Promise.resolve()
  pending[1]({ code: 1, data: { items: [{ symbol: 'UK' }], total: 1 } })
  await second
  pending[0]({ code: 1, data: { items: [{ symbol: 'US' }], total: 1 } })
  await first
  assert.equal(state.rows[0].symbol, 'UK')
  assert.equal(state.page, 1)
})

test('reading status never changes schedules', async () => {
  let mutations = 0
  const { state } = harness({ scheduleResearch: async () => { mutations++; return { code: 1 } } })
  await state.load()
  assert.equal(mutations, 0)
  await state.saveSchedule(true)
  assert.equal(mutations, 1)
})

test('a successful reload clears an earlier read error', async () => {
  let fail = true
  const { state } = harness({ getResearchOverview: async () => {
    if (fail) throw new Error('unavailable')
    return { code: 1, data: { markets: [] } }
  } })
  await state.load()
  assert.ok(state.error)
  fail = false
  await state.load()
  assert.equal(state.error, '')
})

test('teardown cancels timers and late responses', async () => {
  let resolve
  const { state, options } = harness({ getResearchListings: () => new Promise(done => { resolve = done }) })
  const load = state.load()
  options.beforeDestroy.call(state)
  resolve({ code: 1, data: { items: [{ symbol: 'old' }] } })
  await load
  assert.equal(state.rows.length, 0)
  assert.equal(state.timer, null)
})

test('every new key is translated in all eleven locales', () => {
  const keys = Object.keys(translations['en-US'])
  assert.equal(Object.keys(translations).length, 11)
  for (const [lang, messages] of Object.entries(translations)) {
    assert.deepEqual(Object.keys(messages), keys)
    assert.ok(Object.values(messages).every(value => typeof value === 'string' && value.length > 0))
    if (lang !== 'en-US') assert.notEqual(messages['researchIngestion.limits'], translations['en-US']['researchIngestion.limits'])
  }
})
