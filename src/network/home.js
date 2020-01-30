import {request} from './request'

export function getMenuList() {
  return request({
    url: '/menus',
    method: 'get'
  })
}



// 获取Users页面数据
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

export function setRoleData() {
  return request({
    url: 'roles',
    method: 'get'
  })
}

export function saveRoleInfo(id, rid) {
  return request({
    url: `users/${id}/role`,
    method: 'put',
    data: {
      rid
    }
  })
}


// 获取Rights页面数据
export function getRightsListData(type='list') {
  return request({
    url: `rights/${type}`,
    method: 'get'
  })
}


// 获取Roles页面数据
export function getRolesListData() {
  return request({
    url: 'roles',
    method: 'get'
  })
}

export function removeRightById(roleId, rightId) {
  return request({
    url: `roles/${roleId}/rights/${rightId}`,
    method: 'delete'
  })
}

export function getSetRightsData(type='tree') {
  return request({
    url: `rights/${type}`,
    method: 'get'
  })
}

export function allotRights(roleId, rids) {
  return request({
    url: `roles/${roleId}/rights`,
    method: 'post',
    data: {
      rids
    }
  })
}

export function addRole(data) {
  return request({
    url: 'roles',
    method: 'post',
    data
  })
}

export function showEditRole(id) {
  return request({
    url: `roles/${id}`,
    method: 'get'
  })
}

export function editRole(role) {
  return request({
    url: `roles/${role.roleId}`,
    method: 'put',
    data: {
      roleName: role.roleName,
      roleDesc: role.roleDesc
    }
  })
}

export function removeRoleById(id) {
  return request({
    url: `roles/${id}`,
    method: 'delete'
  })
}


// 获取Categories页面数据
export function getCateListData(params) {
  return request({
    url: 'categories',
    method: 'get',
    params
  })
}

export function addCate(data) {
  return request({
    url: 'categories',
    method: 'post',
    data
  })
}

export function showEditCateData(id) {
  return request({
    url: `categories/${id}`,
    method: 'get'
  })
}

export function editCate(id, cat_name) {
  return request({
    url: `categories/${id}`,
    method: 'put',
    data: {
      cat_name
    }
  })
}

export function removeCateById(id) {
  return request({
    url: `categories/${id}`,
    method: 'delete'
  })
}


// 获取Params页面数据
export function getParamsListData(id, sel) {
  return request({
    url: `categories/${id}/attributes`,
    method: 'get',
    params: {
      sel
    }
  })
}

export function addParams(id, attr_name, attr_sel) {
  return request({
    url: `categories/${id}/attributes`,
    method: 'post',
    data: {
      attr_name,
      attr_sel
    }
  })
}

export function showEditParamsData(id, attr_id, attr_sel) {
  return request({
    url: `categories/${id}/attributes/${attr_id}`,
    method: 'get',
    params: {
      attr_sel
    }
  })
}

export function editParams(id, attr_id, attr_name, attr_sel, attr_vals) {
  return request({
    url: `categories/${id}/attributes/${attr_id}`,
    method: 'put',
    data: {
      attr_name,
      attr_sel,
      attr_vals
    }
  })
}

export function removeParamsById(id, attr_id) {
  return request({
    url: `categories/${id}/attributes/${attr_id}`,
    method: 'delete'
  })
}