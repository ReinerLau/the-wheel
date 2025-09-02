import request from "../utils/request";

export function fetchList(params) {
  return request({
    url: "/role/v1/list",
    method: "get",
    params,
  });
}

export function createRole(data) {
  return request({
    url: "/role/v1/create",
    method: "post",
    data,
  });
}

export function deleteRole(id) {
  return request({
    url: `/role/v1/delete/${id}`,
    method: "delete",
  });
}

export function updateRole(data) {
  return request({
    url: `/role/v1/update/${data.id}`,
    method: "put",
    data,
  });
}

export function getOneRole(id) {
  return request({
    url: `/role/v1/getOne/${id}`,
    method: "get",
  });
}
