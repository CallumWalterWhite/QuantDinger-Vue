import request from '@/utils/request'

export function getResearchOverview () {
  return request({ url: '/api/settings/research-ingestion/overview', method: 'get' })
}

export function getResearchListings (params) {
  return request({ url: '/api/settings/research-ingestion/listings', method: 'get', params })
}

export function getResearchJob (id, params) {
  return request({ url: `/api/settings/research-ingestion/jobs/${id}`, method: 'get', params })
}

export function syncResearch (data) {
  return request({ url: '/api/settings/research-ingestion/sync', method: 'post', data })
}

export function retryResearch (id, data) {
  return request({ url: `/api/settings/research-ingestion/jobs/${id}/retry`, method: 'post', data })
}

export function scheduleResearch (data) {
  return request({ url: '/api/settings/research-ingestion/schedule', method: 'put', data })
}

export function getSettingsSchema () {
  return request({
    url: '/api/settings/schema',
    method: 'get'
  })
}

export function getSettingsValues () {
  return request({
    url: '/api/settings/values',
    method: 'get'
  })
}

export function getPublicSettingsConfig () {
  return request({
    url: '/api/settings/public-config',
    method: 'get'
  })
}

export function saveSettings (data) {
  return request({
    url: '/api/settings/save',
    method: 'post',
    data
  })
}

export function testConnection (service, params = {}) {
  return request({
    url: '/api/settings/test-connection',
    method: 'post',
    data: { service, ...params }
  })
}

export function getOpenRouterBalance () {
  return request({
    url: '/api/settings/openrouter-balance',
    method: 'get'
  })
}

export function getMarketCatalogOverview () {
  return request({
    url: '/api/settings/market-catalog',
    method: 'get'
  })
}

export function syncMarketCatalog () {
  return request({
    url: '/api/settings/market-catalog/sync',
    method: 'post'
  })
}
