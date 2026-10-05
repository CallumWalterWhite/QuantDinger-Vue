import request from '@/utils/request'

const prefix = '/api/events/research'
export const getEarningsResearchCoverage = params => request({ url: prefix + '/coverage', method: 'get', params })
export const getEarningsResearchListings = params => request({ url: prefix + '/listings', method: 'get', params })
export const getEarningsResearchEvidence = id => request({ url: `${prefix}/listings/${id}/evidence`, method: 'get' })
export const startEarningsResearch = data => request({ url: prefix + '/jobs', method: 'post', data })
export const getEarningsResearchJob = (id, params) => request({ url: `${prefix}/jobs/${id}`, method: 'get', params })
export const cancelEarningsResearch = id => request({ url: `${prefix}/jobs/${id}/cancel`, method: 'post' })
export const verifyEarningsIssuerSource = (id, data) => request({ url: `${prefix}/listings/${id}/source`, method: 'put', data })
