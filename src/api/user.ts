import request from "../utils/request";

export function login(data) {
  return request({
    url: "/admin/v1/login",
    method: "post",
    data,
  });
}

export function logout() {
  return request({
    url: "/admin/v1/logout",
    method: "post",
  });
}

export function setPasswd(data) {
  return request({
    url: "/admin/v1/setPasswd",
    method: "post",
    data,
  });
}

export function getInfo(token) {
  return request({
    url: "/admin/v1/info",
    method: "get",
    params: { token },
  });
}

export function fetchList(params) {
  return request({
    url: "/admin/v1/list",
    method: "get",
    params: params,
  });
}

export function createUser(data) {
  return request({
    url: "/admin/v1/register",
    method: "post",
    data: data,
  });
}

export function deleteUser(id) {
  return request({
    url: `/admin/v1/delete/${id}`,
    method: "post",
  });
}

export function updateUser(data) {
  return request({
    url: `/admin/v1/update/${data.id}`,
    method: "post",
    data: data,
  });
}

export function getRolesByUser(id) {
  return request({
    url: `/admin/v1/role/${id}`,
    method: "get",
  });
}

export function assignRole(params) {
  return request({
    url: "/admin/v1/role/update",
    method: "post",
    params,
  });
}
