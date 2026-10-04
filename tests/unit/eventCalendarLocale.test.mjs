// tests/unit/eventCalendarLocale.test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

import messages from '../../src/locales/lang/events.js'

const REQUIRED = [
  'menu.dashboard.eventCalendar', 'events.title', 'events.badge.inDays', 'events.disclaimer',
  'events.settings.globalDisabled', 'notice.type.preEventDigest', 'notice.viewDigests'
]

test('english bundle has every required key and the exact disclaimer', () => {
  for (const key of REQUIRED) assert.ok(messages['en-US'][key], `missing ${key}`)
  assert.equal(messages['en-US']['events.disclaimer'], 'Research reference only. Not investment advice.')
  assert.match(messages['en-US']['events.badge.inDays'], /\{days\}/)
})

test('every shipped locale has the same keys as english', () => {
  assert.equal(Object.keys(messages).length, 11)
  const keys = Object.keys(messages['en-US']).sort()
  for (const [code, bundle] of Object.entries(messages)) {
    assert.deepEqual(Object.keys(bundle).sort(), keys, `locale ${code} keys differ`)
    for (const key of keys) {
      assert.deepEqual((bundle[key].match(/\{\w+\}/g) || []).sort(),
        (messages['en-US'][key].match(/\{\w+\}/g) || []).sort(), `locale ${code} placeholder ${key}`)
    }
  }
})

test('events bundle is registered in the locale index', () => {
  const index = fs.readFileSync('src/locales/index.js', 'utf8')
  assert.match(index, /import eventsMessages from '\.\/lang\/events'/)
  assert.equal((index.match(/eventsMessages\[/g) || []).length, 3)
})
