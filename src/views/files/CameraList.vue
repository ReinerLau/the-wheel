<template>
  <BasicTable
    :initial-params="initialParams"
    :form-rules="formRules"
    :query-api="cameraArchives.queryAll"
    :create-api="cameraArchives.create"
    :update-api="cameraArchives.update"
    :delete-api="cameraArchives.delete"
    :query-fields="queryFields"
    :table-fields="tableFields"
    :form-fields="formFields"
  ></BasicTable>
</template>

<script setup lang="tsx">
import { cameraArchives } from "../../api/cameraArchives";
import BasicTable from "../../components/BasicTable";

const initialParams = {
  name: "",
  limit: 99999,
};

const formRules = {
  name: [{ required: true, message: "请输入名称" }],
  rtsp: [{ required: true, message: "拉流地址" }],
};

const queryFields = [
  {
    prop: "name",
    title: "摄像头名称",
  },
];

const tableFields = [
  {
    title: "摄像头名称",
    prop: "name",
  },
  {
    title: "账号",
    prop: "user",
  },
  {
    title: "密码",
    prop: "password",
  },
  {
    title: "关联机器人",
    prop: "rid",
  },
  {
    title: "操作",
    action: true,
  },
];

const formFields = [
  {
    prop: "name",
    title: "摄像头名称",
  },
  {
    prop: "user",
    title: "账号",
  },
  {
    prop: "password",
    title: "密码",
  },
  {
    prop: "rtsp",
    title: "拉流地址",
  },
];
</script>
