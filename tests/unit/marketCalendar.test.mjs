import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { marketEventKey, coverageKey, dateStatusKey } from '../../src/views/event-calendar/eventCalendarFormat.mjs'

const source = fs.readFileSync('src/views/event-calendar/MarketCalendar.vue', 'utf8')
const script = source.split('<script>')[1].split('</script>')[0].replace(/^import .*$/gm, '').replace('export default', 'return')

function instance (request) {
  // Exercise real Vue option methods without mounting a DOM or replacing their logic.
  const options = new Function('getMarketCalendar', 'marketEventKey', 'coverageKey', 'dateStatusKey', script)(request, marketEventKey, coverageKey, dateStatusKey)
  const vm = options.data()
  for (const [name, method] of Object.entries(options.methods)) vm[name] = method.bind(vm)
  return vm
}

function reply (symbol) {
  return { code: 1, data: { items: [{ symbol }], total: 1, coverage: [], sync_enabled: false } }
}

test('listing-qualified keys and unknown status fallbacks are safe', () => {
  const row = { market: 'US', exchange: 'NMS', symbol: 'ABC', event_type: 'earnings', event_date: '2026-10-08' }
  assert.notEqual(marketEventKey(row), marketEventKey({ ...row, exchange: 'NYQ' }))
  assert.equal(coverageKey('bad'), 'events.market.status.unavailable')
  assert.equal(dateStatusKey('bad'), 'events.market.date.unknown')
})

test('server requests have explicit pagination and bounded submitted search', async () => {
  let params
  const vm = instance(async value => { params = value; return reply('TSCO.L') })
  vm.page = 5
  vm.market = 'UK'
  vm.searchText = '  ' + 'a'.repeat(120) + '  '
  await vm.search()
  assert.equal(params.page, 1)
  assert.equal(params.q.length, 100)
  assert.equal(params.market, 'UK')
  assert.equal(params.page_size, 50)
  assert.equal(vm.syncEnabled, false)
  assert.equal(vm.rows[0].symbol, 'TSCO.L')
})

test('out-of-order filter responses never overwrite the selected market', async () => {
  const pending = []
  const vm = instance(() => new Promise(resolve => pending.push(resolve)))
  const first = vm.load()
  vm.market = 'UK'
  const second = vm.reload()
  pending[1](reply('TSCO.L'))
  await second
  pending[0](reply('TSLA'))
  await first
  assert.equal(vm.rows[0].symbol, 'TSCO.L')
  assert.equal(vm.loading, false)
})

test('failed requests clear old rows and do not pretend to be empty coverage', async () => {
  const vm = instance(async () => { throw new Error('offline') })
  vm.rows = [{ symbol: 'TSLA' }]
  await vm.load()
  assert.deepEqual(vm.rows, [])
  assert.equal(vm.failed, true)
  assert.equal(vm.loading, false)
})
