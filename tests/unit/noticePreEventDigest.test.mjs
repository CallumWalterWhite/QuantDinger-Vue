// tests/unit/noticePreEventDigest.test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import { noticeMessageHtml, noticeTypeLabel } from '../../src/utils/noticeFormat.js'

const bell = fs.readFileSync('src/components/NoticeIcon/NoticeIcon.vue', 'utf8')

test('digest text never runs generated HTML', () => {
  const html = noticeMessageHtml({ signal_type: 'pre_event_digest', message: '<img src=x onerror=alert(1)>\nResearch', payload: {} })
  assert.doesNotMatch(html, /<img/)
  assert.match(html, /&lt;img/)
})

test('pre-event digest has a localized type label and falls back in english', () => {
  assert.equal(noticeTypeLabel('pre_event_digest', null), 'Earnings Digest')
  assert.equal(noticeTypeLabel('ai_monitor', null), 'AI Monitor')
})

test('bell gives digests their own icon, color and a link to the calendar', () => {
  assert.match(bell, /pre_event_digest: 'calendar'/)
  assert.match(bell, /pre_event_digest: '#08979c'/)
  assert.match(bell, /notice\.viewDigests/)
  assert.match(bell, /goToEventCalendar/)
  assert.match(bell, /\/event-calendar/)
})

test('existing notice types are unchanged', () => {
  assert.match(bell, /ai_monitor: 'robot'/)
  assert.match(bell, /price_alert: 'bell'/)
  assert.match(bell, /\['ai_monitor', 'price_alert', 'signal', 'trade'\]\.includes/)
})
