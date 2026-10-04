// tests/unit/indicatorIdeEarningsBadge.test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const ide = fs.readFileSync('src/views/indicator-ide/index.vue', 'utf8')

test('watchlist options show an earnings badge for US stocks', () => {
  assert.match(ide, /import \{ getUpcomingEvents \} from '@\/api\/events'/)
  assert.match(ide, /earningsBadgeFor\(w\)/)
  assert.match(ide, /class="wl-earnings-tag"/)
  assert.match(ide, /upcomingBySymbol/)
})

test('upcoming earnings load failures are silent', () => {
  const method = ide.slice(ide.indexOf('async loadUpcomingEarnings'), ide.indexOf('async loadUpcomingEarnings') + 600)
  assert.match(method, /catch/)
  assert.doesNotMatch(method, /\$message\.error/)
})
