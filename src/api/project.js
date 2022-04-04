import request from '@/utils/request'

export function getProjects(params) {
  return request({
    url: '/state/projects',
    method: 'get',
    params
  })
}

export function addProject(data) {
  return request({
    url: '/state/projects',
    method: 'post',
    data
  })
}

export function updateProject(id, data) {
  return request({
    url: `/state/project?id=${id}`,
    method: 'put',
    data
  })
}

export function deleteProject(id) {
  return request({
    url: `/state/project?id=${id}`,
    method: 'delete'
  })
}
