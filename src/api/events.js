// src/api/events.js
import request from '@/utils/request'

const eventsApi = {
  Upcoming: '/api/events/upcoming',
  Digests: '/api/events/digests',
  DigestSettings: '/api/events/digest-settings',
  MarketCalendar: '/api/events/market-calendar'
}

export function getUpcomingEvents (days = 30) {
  return request({ url: eventsApi.Upcoming, method: 'get', params: { days } })
}

export function getMarketCalendar (params) {
  return request({ url: eventsApi.MarketCalendar, method: 'get', params })
}

export function getEventDigests (limit = 50) {
  return request({ url: eventsApi.Digests, method: 'get', params: { limit } })
}

export function getDigestSettings () {
  return request({ url: eventsApi.DigestSettings, method: 'get' })
}

export function saveDigestSettings (data) {
  return request({ url: eventsApi.DigestSettings, method: 'put', data })
}
