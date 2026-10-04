// tests/unit/eventCalendarFormat.test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import {
  actionKey,
  clampLeadDays,
  earningsBadge,
  indexUpcomingBySymbol,
  normalizeDigest,
  stanceColor
} from '../../src/views/event-calendar/eventCalendarFormat.mjs'

test('stance colors fall back for unknown stances', () => {
  assert.equal(stanceColor('bullish'), 'green')
  assert.equal(stanceColor('bearish'), 'red')
  assert.equal(stanceColor('neutral'), 'blue')
  assert.equal(stanceColor('moon'), 'default')
  assert.equal(stanceColor(undefined), 'default')
})

test('action keys only allow known actions', () => {
  assert.equal(actionKey('consider_buying'), 'events.action.consider_buying')
  assert.equal(actionKey('YOLO'), 'events.action.watch')
})

test('earnings badge uses today for zero and hides outside 0..14', () => {
  assert.deepEqual(earningsBadge(0), { key: 'events.badge.today', days: 0 })
  assert.deepEqual(earningsBadge(5), { key: 'events.badge.inDays', days: 5 })
  assert.equal(earningsBadge(15), null)
  assert.equal(earningsBadge(-1), null)
  assert.equal(earningsBadge(null), null)
  assert.equal(earningsBadge(NaN), null)
  assert.equal(earningsBadge(1.5), null)
})

test('normalizeDigest tolerates missing and malformed fields', () => {
  const d = normalizeDigest({ headline: 'H', confidence: 0.62, bull_case: 'not a list' })
  assert.equal(d.headline, 'H')
  assert.equal(d.confidencePct, 62)
  assert.deepEqual(d.bull_case, [])
  assert.deepEqual(d.risks, [])
  assert.equal(d.stance, 'unclear')
  assert.equal(d.suggested_action, 'watch')
  assert.equal(normalizeDigest(null).headline, '')
})

test('lead days are clamped integers', () => {
  assert.equal(clampLeadDays(9), 7)
  assert.equal(clampLeadDays(-2), 0)
  assert.equal(clampLeadDays('x'), 3)
  assert.equal(clampLeadDays(2.7), 2)
})

test('upcoming index keeps the nearest event per symbol', () => {
  assert.deepEqual(indexUpcomingBySymbol([
    { symbol: 'googl', days_until: 20 },
    { symbol: 'GOOGL', days_until: 3 },
    { symbol: 'AAPL', days_until: 9 }
  ]), { GOOGL: 3, AAPL: 9 })
  assert.deepEqual(indexUpcomingBySymbol(null), {})
  assert.deepEqual(indexUpcomingBySymbol([null, { symbol: 'X', days_until: NaN }, { symbol: 'Y', days_until: 2, event_type: 'split' }]), {})
})

test('events API module targets the backend routes', () => {
  const api = fs.readFileSync('src/api/events.js', 'utf8')
  assert.match(api, /\/api\/events\/upcoming/)
  assert.match(api, /\/api\/events\/digests/)
  assert.match(api, /\/api\/events\/digest-settings/)
  assert.match(api, /method: 'put'/)
})
