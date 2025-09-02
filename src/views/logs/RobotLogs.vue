<template>
  <BasicTable
    :initial-params="initialParams"
    :query-api="robotStatus.queryAll"
    :query-fields="queryFields"
    :table-fields="tableFields"
    :has-add="false"
  ></BasicTable>
</template>

<script setup lang="tsx">
import { robotStatus } from "../../api/robotStatus";
import BasicTable from "../../components/BasicTable";

const initialParams = {
  limit: 99999,
};

const queryFields = [
  {
    prop: "memo",
    title: "日志内容",
  },
];

const tableFields = [
  {
    prop: "robotid",
    title: "机器人id",
  },
  {
    prop: "memo",
    title: "日志内容",
  },
  {
    prop: "logTime",
    title: "时间",
  },
];
</script>
