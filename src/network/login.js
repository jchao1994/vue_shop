import {request} from './request'

export function loginData(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}