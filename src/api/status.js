import request from '@/utils/request'

export function getStatuses(params) {
  return request({
    url: '/state/statuses',
    method: 'get',
    params
  })
}

export function addStatuses(data) {
  return request({
    url: '/state/statuses',
    method: 'post',
    data
  })
}

export function updateStatus(id, data) {
  return request({
    url: `/state/status?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteStatus(id) {
  return request({
    url: `/state/status?id=${id}`,
    method: 'delete'
  })
}
