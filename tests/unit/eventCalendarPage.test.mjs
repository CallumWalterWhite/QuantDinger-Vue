// tests/unit/eventCalendarPage.test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const page = fs.readFileSync('src/views/event-calendar/index.vue', 'utf8')
const card = fs.readFileSync('src/views/event-calendar/DigestSettingsCard.vue', 'utf8')
const router = fs.readFileSync('src/config/router.config.js', 'utf8')
const profile = fs.readFileSync('src/views/profile/index.vue', 'utf8')
const marketPage = fs.readFileSync('src/views/event-calendar/MarketCalendar.vue', 'utf8')

test('event calendar route is registered with a localized title', () => {
  assert.match(router, /path: '\/event-calendar'/)
  assert.match(router, /name: 'EventCalendar'/)
  assert.match(router, /menu\.dashboard\.eventCalendar/)
})

test('page shows upcoming and digest tabs with empty states and disclaimer', () => {
  assert.match(page, /getUpcomingEvents/)
  assert.match(page, /getEventDigests/)
  assert.match(page, /events\.tab\.upcoming/)
  assert.match(page, /events\.tab\.digests/)
  assert.match(page, /events\.emptyUpcoming/)
  assert.match(page, /events\.emptyDigests/)
  assert.match(page, /events\.disclaimer/)
  assert.match(page, /normalizeDigest/)
})

test('page is read-only and never places orders', () => {
  for (const src of [page, card]) {
    assert.doesNotMatch(src, /placeQuickOrder|place-order|\/api\/quick-trade/)
  }
})

test('settings card clamps lead days and shows the global switch banner', () => {
  assert.match(card, /saveDigestSettings/)
  assert.match(card, /clampLeadDays/)
  assert.match(card, /:max="7"/)
  assert.match(card, /events\.settings\.globalDisabled/)
})

test('profile notifications tab embeds the digest settings card', () => {
  assert.match(profile, /<digest-settings-card/)
  assert.match(profile, /import DigestSettingsCard from '@\/views\/event-calendar\/DigestSettingsCard'/)
})

test('no hardcoded english copy in templates', () => {
  for (const src of [page, card]) {
    const template = src.split('<script>')[0]
    assert.doesNotMatch(template, />\s*(Upcoming earnings|Digest history|Save|Bull case)\s*</)
  }
})

test('market tab offers bounded server search and explicit free coverage warnings', () => {
  assert.match(page, /<market-calendar/)
  assert.match(marketPage, /getMarketCalendar/)
  assert.match(marketPage, /events\.market\.limitations/)
  assert.match(marketPage, /events\.market\.disabled/)
  assert.match(marketPage, /:max-length="100"/)
  assert.match(marketPage, /requestId/)
  assert.match(marketPage, /page_size/)
  assert.doesNotMatch(marketPage, /v-html|placeQuickOrder|saveDigestSettings/)
})
