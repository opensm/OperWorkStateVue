import request from '@/utils/request'

export function getStates(params) {
  return request({
    url: '/state/workstates',
    method: 'get',
    params
  })
}

export function getGroupStates(params) {
  return request({
    url: '/state/groupstate',
    method: 'get',
    params
  })
}

export function addState(data) {
  return request({
    url: '/state/workstates',
    method: 'post',
    data
  })
}

export function updateState(id, data) {
  return request({
    url: `/state/workstate?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteState(id) {
  return request({
    url: `/state/workstate?id=${id}`,
    method: 'delete'
  })
}
