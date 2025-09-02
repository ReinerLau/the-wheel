<template>
  <div>
    <TimelineContainer
      :initial-params="initialParams"
      :query-api="fetchList"
      :query-fields="queryFields"
      :timeline-fields="timelineFields"
    ></TimelineContainer>
  </div>
</template>
<script setup lang="tsx">
import { fetchList } from "../../api/dynamicLog";
import TimelineContainer from "./components/TimelineContainer";

const initialParams = {
  page: 1,
  limit: 10,
};

const queryFields = [
  {
    prop: "userName",
    title: "用户名",
  },

  {
    prop: "createTime",
    title: "操作时间",
    slot: (params) => (
      <el-date-picker
        v-model={params.value.time}
        type="datetimerange"
        value-format="YYYY-MM-DD HH:mm:ss"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
      />
    ),
  },
];

const timelineFields = ["createTime", "userName", "description"];
</script>
