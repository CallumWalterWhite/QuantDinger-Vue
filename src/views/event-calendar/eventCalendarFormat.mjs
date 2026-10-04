// src/views/event-calendar/eventCalendarFormat.mjs
const STANCE_COLORS = { bullish: 'green', bearish: 'red', neutral: 'blue' }
const STANCES = ['bullish', 'bearish', 'neutral', 'unclear']
const ACTIONS = ['consider_buying', 'consider_trimming', 'watch', 'no_action']
const BADGE_MAX_DAYS = 14

export function stanceColor (stance) {
  return STANCE_COLORS[stance] || 'default'
}

export function actionKey (action) {
  return `events.action.${ACTIONS.includes(action) ? action : 'watch'}`
}

export function earningsBadge (daysUntil) {
  if (!Number.isInteger(daysUntil) || daysUntil < 0 || daysUntil > BADGE_MAX_DAYS) return null
  return { key: daysUntil === 0 ? 'events.badge.today' : 'events.badge.inDays', days: daysUntil }
}

function stringList (value) {
  return Array.isArray(value) ? value.map(v => String(v)).filter(Boolean) : []
}

export function normalizeDigest (digest) {
  const d = digest && typeof digest === 'object' ? digest : {}
  const confidence = Number(d.confidence)
  return {
    headline: String(d.headline || ''),
    stance: STANCES.includes(d.stance) ? d.stance : 'unclear',
    confidencePct: Number.isFinite(confidence) ? Math.round(Math.min(1, Math.max(0, confidence)) * 100) : 0,
    bull_case: stringList(d.bull_case),
    bear_case: stringList(d.bear_case),
    what_to_watch: stringList(d.what_to_watch),
    risks: stringList(d.risks),
    options_note: String(d.options_note || ''),
    suggested_action: ACTIONS.includes(d.suggested_action) ? d.suggested_action : 'watch'
  }
}

export function clampLeadDays (value) {
  const n = Math.trunc(Number(value))
  if (!Number.isFinite(n)) return 3
  return Math.min(7, Math.max(0, n))
}

export function indexUpcomingBySymbol (rows) {
  const out = {}
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || (row.event_type && row.event_type !== 'earnings')) continue
    const symbol = String(row.symbol || '').trim().toUpperCase()
    if (!symbol || !Number.isInteger(row.days_until) || row.days_until < 0) continue
    if (!(symbol in out) || row.days_until < out[symbol]) out[symbol] = row.days_until
  }
  return out
}
