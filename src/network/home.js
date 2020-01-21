import {request} from './request'

export function getMenuList() {
  return request({
    url: '/menus',
    method: 'get'
  })
}

export function getUserList(params) {
  return request({
    url: 'users',
    method: 'get',
    params
  })
}

export function userStateChange(userInfo) {
  return request({
    url: `users/${userInfo.id}/state/${userInfo.mg_state}`,
    method: 'put'
  })
}

export function addUser(data) {
  return request({
    url: 'users',
    method: 'post',
    data
  })
}

export function editUser(userId) {
  return request({
    url: `users/${userId}`,
    method: 'get',
  })
}

export function editUserInfo(data) {
  return request({
    url: `users/${data.id}`,
    method: 'put',
    data: {
      email: data.email,
      mobile: data.mobile
    }
  })
}

export function removeUserById(id) {
  return request({
    url: `users/${id}`,
    method: 'delete'
  })
} 