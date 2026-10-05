import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import translations from '../../src/locales/lang/earnings-research.js'

function harness (overrides = {}) {
  const source = fs.readFileSync(new URL('../../src/views/event-calendar/EarningsResearch.vue', import.meta.url), 'utf8')
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '').replace('export default', 'component =')
  const context = { getEarningsResearchCoverage: async () => ({ code: 1, data: {} }),
    getEarningsResearchListings: async () => ({ code: 1, data: { items: [], total: 0 } }),
    startEarningsResearch: async () => ({ code: 1, data: { dispatched: true } }),
    getEarningsResearchEvidence: async () => ({ code: 1, data: {} }),
    getEarningsResearchJob: async () => ({ code: 1, data: { items: [], counts: {} } }),
    cancelEarningsResearch: async () => ({ code: 1 }),
    setTimeout: () => 1, clearTimeout: () => {}, EarningsResearchDetail: {}, ...overrides }
  vm.runInNewContext(script, context)
  const options = context.component
  const state = { ...options.data(), $t: key => key, $message: { error: () => {} } }
  for (const [key, method] of Object.entries(options.methods)) state[key] = method.bind(state)
  for (const [key, method] of Object.entries(options.computed)) Object.defineProperty(state, key, { get: method.bind(state) })
  return { state, options }
}

test('late market responses cannot replace current directory pages', async () => {
  const pending = []
  const { state } = harness({ getEarningsResearchListings: () => new Promise(resolve => pending.push(resolve)) })
  const first = state.load()
  state.market = 'UK'
  const second = state.selectionChanged()
  await Promise.resolve()
  pending[1]({ code: 1, data: { items: [{ listing_id: 9, event_date: null }], total: 6001 } })
  await second
  pending[0]({ code: 1, data: { items: [{ listing_id: 2 }], total: 1 } })
  await first
  assert.equal(state.rows[0].listing_id, 9)
  assert.equal(state.total, 6001)
  assert.equal(state.rows[0].event_date, null)
})

test('ambiguous dispatch reuses the same durable request', async () => {
  const calls = []
  const { state } = harness({ startEarningsResearch: async data => {
    calls.push(data)
    return { code: 1, data: { dispatched: calls.length > 1 } }
  } })
  await state.start()
  await state.start()
  assert.equal(calls[0].request_id, calls[1].request_id)
  assert.equal(state.pendingRequest, null)
})

test('teardown invalidates pending reads', async () => {
  let resolve
  const { state, options } = harness({ getEarningsResearchListings: () => new Promise(done => { resolve = done }) })
  const load = state.load()
  options.beforeDestroy.call(state)
  resolve({ code: 1, data: { items: [{ listing_id: 1 }], total: 1 } })
  await load
  assert.equal(state.rows.length, 0)
})

test('source counts stay independent and include unavailable evidence', () => {
  const { state } = harness()
  const counts = [{ kind: 'prices', status: 'ready', n: 2 }, { kind: 'prices', status: 'unavailable', n: 6000 },
    { kind: 'news', status: 'ready', n: 1 }]
  assert.equal(state.sourceSummary(counts, 'prices'), 'fundamentalSync.ready: 2 · earningsResearch.status.unavailable: 6000')
  assert.equal(state.sourceSummary(undefined, 'documents'), 'researchIngestion.unknown')
})

test('locale coverage and safe detail output', () => {
  assert.equal(Object.keys(translations).length, 11)
  const keys = Object.keys(translations['en-US'])
  for (const messages of Object.values(translations)) {
    assert.deepEqual(Object.keys(messages), keys)
    assert.ok(Object.values(messages).every(value => typeof value === 'string' && value.length))
  }
  const detail = fs.readFileSync(new URL('../../src/views/event-calendar/EarningsResearchDetail.vue', import.meta.url), 'utf8')
  assert.ok(!detail.includes('v-html'))
  assert.match(detail, /noopener noreferrer/)
  assert.match(detail, /events\.disclaimer/)
  assert.match(detail, /Number\.isFinite\(value\)/)
  const register = fs.readFileSync(new URL('../../src/locales/index.js', import.meta.url), 'utf8')
  assert.equal((register.match(/\.\.\.\(earningsResearchMessages/g) || []).length, 3)
})
