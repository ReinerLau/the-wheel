<template>
  <div class="p-4">
    <el-card class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>告警历史</h3>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="mb-4">
        <el-form-item label="机器人编码">
          <el-input v-model="queryParams.robotCode" placeholder="请输入机器人编码" clearable />
        </el-form-item>
        <el-form-item label="告警时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="alertList" border style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="robotCode" label="机器人编码" />
        <el-table-column prop="message" label="告警内容" />
        <el-table-column label="机器人位置">
          <template #default="{ row }">
            <template v-if="row.robotLocation">
              <el-tag type="info" class="mr-2">x: {{ row.robotLocation.x }}</el-tag>
              <el-tag type="info" class="mr-2">y: {{ row.robotLocation.y }}</el-tag>
              <el-tag type="info">θ: {{ row.robotLocation.theta }}</el-tag>
            </template>
            <el-tag v-else type="info">暂无位置信息</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="告警时间" width="180" />
        <el-table-column label="告警图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.picPath"
              :src="row.picPath"
              :preview-src-list="[row.picPath]"
              preview-teleported
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="mt-4"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.limit"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { fetchAlertHistoryList } from '@/api/alertHistory'
import { ElMessage } from 'element-plus'

// 定义类型
interface AlertItem {
  robotCode: string
  deviceId: string
  robotLocation: {
    x: number
    y: number
    theta: number
  }
  createdTime: string
  picPath: string
  message: string
}

// 日期范围
const dateRange = ref()

// 查询参数
const queryParams = reactive({
  page: 1,
  limit: 10,
  robotCode: '',
  startTime: '',
  endTime: '',
})

// 监听日期范围变化
watch(dateRange, (val) => {
  if (val) {
    queryParams.startTime = val[0]
    queryParams.endTime = val[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
})

const loading = ref(false)
const alertList = ref<AlertItem[]>([])
const total = ref(0)

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const response = await fetchAlertHistoryList(queryParams)
    alertList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取告警历史失败')
  } finally {
    loading.value = false
  }
}

// 搜索按钮点击事件
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置按钮点击事件
const resetQuery = () => {
  queryParams.robotCode = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  dateRange.value = null
  queryParams.page = 1
  getList()
}

// 每页条数变化
const handleSizeChange = (val: number) => {
  queryParams.limit = val
  getList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  queryParams.page = val
  getList()
}

onMounted(() => {
  getList()
})
</script>
