<template>
  <div class="p-4 h-full">
    <el-card class="mb-4 h-full overflow-y-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>巡检历史</h3>
        </div>
      </template>

      <div class="flex flex-col h-full">
        <el-form :inline="true" :model="queryParams" class="mb-4">
          <el-form-item label="机器人名称">
            <el-input v-model="queryParams.robotName" placeholder="请输入机器人名称" clearable />
          </el-form-item>
          <el-form-item label="任务时间">
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

        <el-table
          v-loading="loading"
          :data="taskList"
          border
          @expand-change="handleExpandChange"
          row-key="recordId"
          :expand-row-keys="expandRowKeys"
        >
          <el-table-column type="expand">
            <div class="p-4">
              <div v-if="expandLoading" class="flex justify-center items-center py-6">
                <el-icon class="is-loading mr-2"><Loading /></el-icon>
                <span>加载中...</span>
              </div>
              <div v-else-if="alertList.length > 0">
                <h4 class="mb-4">告警记录</h4>
                <el-timeline>
                  <el-timeline-item
                    v-for="(alert, index) in alertList"
                    :key="index"
                    :timestamp="dayjs(alert.createdTime).format('YYYY-MM-DD HH:mm:ss')"
                    type="warning"
                    placement="top"
                  >
                    <!-- 告警卡片 -->
                    <el-card>
                      <el-table :data="[alert]" border>
                        <el-table-column prop="message" label="告警内容"></el-table-column>
                        <el-table-column prop="robotCode" label="机器人编码"></el-table-column>
                        <el-table-column label="位置信息">
                          <el-button
                            type="primary"
                            link
                            @click="handleShowLocation(alert.robotLocation, alert.mapPath)"
                          >
                            查看位置
                          </el-button>
                        </el-table-column>
                        <el-table-column label="告警图片">
                          <el-image
                            v-if="alert.picPath"
                            :src="alert.picPath"
                            :preview-src-list="[alert.picPath]"
                            preview-teleported
                            fit="cover"
                            class="w-full max-w-20 object-cover"
                          />
                          <div v-else>/</div>
                        </el-table-column>
                      </el-table>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </div>
              <el-empty v-else description="暂无告警记录" />
            </div>
          </el-table-column>
          <el-table-column prop="taskName" label="任务名称" />
          <el-table-column prop="robotName" label="机器人名称" />
          <el-table-column label="巡检仓库">
            <template #default="{ row }">
              <el-tag v-for="(item, index) in row.warehouseName" :key="index" class="mr-2">
                {{ item }}
              </el-tag>
              <span v-if="!row.warehouseName || row.warehouseName.length === 0">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间">
            <template #default="{ row }">
              <span>{{
                row.startTime ? dayjs(row.startTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间">
            <template #default="{ row }">
              <span>{{
                row.endTime ? dayjs(row.endTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="温度范围">
            <template #default="{ row }">
              <template
                v-if="
                  row.temperature && (row.temperature.min !== null || row.temperature.max !== null)
                "
              >
                <el-tag type="success" class="mr-2">最小: {{ row.temperature.min ?? '-' }}℃</el-tag>
                <el-tag type="danger">最大: {{ row.temperature.max ?? '-' }}℃</el-tag>
              </template>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="湿度范围">
            <template #default="{ row }">
              <template
                v-if="row.humidity && (row.humidity.min !== null || row.humidity.max !== null)"
              >
                <el-tag type="success" class="mr-2">最小: {{ row.humidity.min ?? '-' }}%</el-tag>
                <el-tag type="danger">最大: {{ row.humidity.max ?? '-' }}%</el-tag>
              </template>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="alterCount" label="告警数量">
            <template #default="{ row }">
              <el-tag type="warning" v-if="row.alterCount > 0">{{ row.alterCount }}</el-tag>
              <span v-else>0</span>
            </template>
          </el-table-column>
          <el-table-column prop="scheduledStartTime" label="预计执行时间">
            <template #default="{ row }">
              <span>{{
                row.scheduledStartTime
                  ? dayjs(row.scheduledStartTime).format('YYYY-MM-DD HH:mm:ss')
                  : '-'
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="executionMessage" label="执行结果" />
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button
                v-if="row.videoUrl"
                type="primary"
                size="small"
                @click="handlePlayVideo(row)"
                link
              >
                播放视频
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="queryParams.page"
            v-model:page-size="queryParams.limit"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 视频对话框 -->
    <el-dialog v-model="videoDialog.visible" title="巡检视频" width="800px" destroy-on-close>
      <video v-if="videoDialog.url" controls muted autoplay style="width: 100%">
        <source :src="videoDialog.url" type="video/mp4" />
        您的浏览器不支持视频播放
      </video>
    </el-dialog>

    <!-- 位置信息对话框 -->
    <el-dialog v-model="locationDialog.visible" title="机器人位置信息" destroy-on-close>
      <div class="h-[600px]">
        <RobotPosition
          ref="robotPositionRef"
          :map="locationDialog.mapPath"
          :pos="locationDialog.position"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchPatrolHistoryList,
  fetchAlertHistoryListByTask,
  type TaskItem,
  type PatrolHistoryQuery,
  type AlertItem,
} from '@/api/patrolHistory'
import { Loading } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import RobotPosition from '@/views/monitor/components/RobotPosition.vue'

// 日期范围
const dateRange = ref()

// 查询参数
const queryParams = reactive<PatrolHistoryQuery>({
  page: 1,
  limit: 10,
  robotCode: '',
  robotName: '',
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
const taskList = ref<TaskItem[]>([])
const total = ref(0)

// 视频对话框
const videoDialog = reactive({
  visible: false,
  url: '',
})

// 位置信息对话框
const locationDialog = reactive({
  visible: false,
  position: null as { x: number; y: number; theta: number } | null,
  mapPath: '',
})

// RobotPosition 组件引用
const robotPositionRef = ref()

// 播放视频
const handlePlayVideo = (row: TaskItem) => {
  if (row.videoUrl) {
    videoDialog.url = row.videoUrl
    videoDialog.visible = true
  } else {
    ElMessage.warning('该任务没有视频记录')
  }
}

// 显示位置信息
const handleShowLocation = async (
  position: { x: number; y: number; theta: number },
  mapPath: string,
) => {
  locationDialog.position = position
  locationDialog.mapPath = mapPath
  locationDialog.visible = true

  // 等待对话框打开后初始化地图
  await nextTick()
  if (robotPositionRef.value) {
    robotPositionRef.value.initialize()
  }
}

// 展开行相关
const expandLoading = ref(false)
const alertList = ref<AlertItem[]>([])
const currentExpandedRow = ref<string | null>(null)
const expandRowKeys = ref<string[]>([])

// 处理展开行变化
const handleExpandChange = async (row: TaskItem, expandedRows: TaskItem[]) => {
  // 如果当前行已关闭，不需要获取数据
  if (expandedRows.length === 0 || !expandedRows.some((r) => r === row)) {
    currentExpandedRow.value = null
    expandRowKeys.value = []
    return
  }

  // 处理展开状态切换
  if (currentExpandedRow.value === row.recordId) {
    // 如果点击的是当前已展开的行，则关闭它
    expandRowKeys.value = []
    currentExpandedRow.value = null
    return
  }

  // 展开新行，并加载数据
  currentExpandedRow.value = row.recordId
  expandRowKeys.value = [row.recordId]
  alertList.value = []

  expandLoading.value = true
  try {
    const res = await fetchAlertHistoryListByTask(row.recordId)
    alertList.value = res.data
  } catch {
    ElMessage.error('获取告警历史失败')
  } finally {
    expandLoading.value = false
  }
}

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const response = await fetchPatrolHistoryList(queryParams)
    taskList.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取巡检历史失败')
  } finally {
    loading.value = false
  }
}

// 搜索按钮点击事件
const handleQuery = () => {
  queryParams.page = 1
  resetExpandState()
  getList()
}

// 重置按钮点击事件
const resetQuery = () => {
  queryParams.robotCode = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  dateRange.value = null
  queryParams.page = 1
  resetExpandState()
  getList()
}

// 每页条数变化
const handleSizeChange = (val: number) => {
  queryParams.limit = val
  resetExpandState()
  getList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  queryParams.page = val
  resetExpandState()
  getList()
}

// 重置展开状态
const resetExpandState = () => {
  expandRowKeys.value = []
  currentExpandedRow.value = null
  alertList.value = []
}

onMounted(() => {
  getList()
})
</script>
