<template>
  <el-scrollbar class="h-full">
    <el-card>
      <!-- 用药提醒开关设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">用药提醒开关</div>
          <div class="label-description">开启后，系统将在设定的时间提醒您按时用药</div>
        </div>
        <div class="setting-control">
          <el-switch
            v-model="settingsForm.enabled"
            size="large"
            active-text="开启"
            inactive-text="关闭"
          />
        </div>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 药物管理设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">药物管理</div>
          <div class="label-description">添加和管理您的药物信息，包括药物名称、规格和用法</div>
        </div>
        <div class="setting-control">
          <el-button type="primary" :icon="Plus" @click="showMedicationManagementDialog">
            药物管理
          </el-button>
        </div>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 用药时间设置 -->
      <div class="setting-item">
        <div class="setting-label">
          <div class="label-title">用药时间</div>
          <div class="label-description">设置具体的用药时间和日期，系统将在指定时间提醒您用药</div>
        </div>
        <div class="setting-control">
          <el-button
            type="primary"
            :icon="Clock"
            :disabled="medications.length === 0"
            @click="showAddTimeDialog"
          >
            添加用药时间
          </el-button>
        </div>
      </div>

      <!-- 用药时间列表 -->
      <div v-if="settingsForm.medicationTimes.length > 0" class="time-list">
        <div class="list-header">
          <span class="header-title">用药时间安排</span>
        </div>
        <div class="time-items">
          <div v-for="time in settingsForm.medicationTimes" :key="time.id" class="time-item">
            <div class="time-info">
              <div class="medication-name">{{ getMedicationName(time.medicationId) }}</div>
              <div class="time-datetime">{{ formatMedicationTime(time) }}</div>
              <div v-if="time.type === 'repeat'" class="repeat-info">
                <el-tag size="small" type="info">{{ getRepeatDescription(time) }}</el-tag>
              </div>
            </div>
            <div class="time-actions">
              <el-switch v-model="time.enabled" size="small" @change="debouncedSaveSettings" />
              <el-button
                size="small"
                type="danger"
                :icon="Delete"
                @click="removeMedicationTime(time.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 药物管理弹窗 -->
    <el-dialog
      v-model="medicationManagementDialogVisible"
      title="药物管理"
      width="800px"
      :before-close="handleCloseMedicationManagementDialog"
    >
      <div class="medication-management">
        <div class="management-header">
          <el-button type="primary" :icon="Plus" @click="showAddMedicationDialog">
            添加药物
          </el-button>
        </div>

        <div v-if="medications.length === 0" class="empty-state">
          <div class="empty-text">暂无药物信息</div>
          <div class="empty-description">点击"添加药物"按钮添加您的药物</div>
        </div>

        <div v-else class="medication-table">
          <el-table :data="medications" style="width: 100%">
            <el-table-column prop="name" label="药物名称" width="150" />
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="usage" label="用法" min-width="200" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button size="small" type="primary" @click="showEditMedicationDialog(scope.row)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="removeMedication(scope.row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseMedicationManagementDialog">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加药物对话框 -->
    <el-dialog
      v-model="addMedicationDialogVisible"
      title="添加药物"
      width="500px"
      :before-close="handleCloseAddMedicationDialog"
    >
      <el-form
        ref="medicationFormRef"
        :model="medicationForm"
        :rules="medicationRules"
        label-width="100px"
      >
        <el-form-item label="药物名称" prop="name">
          <el-input
            v-model="medicationForm.name"
            placeholder="请输入药物名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input
            v-model="medicationForm.specification"
            placeholder="例如：5mg/片"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="用法" prop="usage">
          <el-input
            v-model="medicationForm.usage"
            type="textarea"
            :rows="3"
            placeholder="例如：饭后服用，每次1片"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAddMedicationDialog">取消</el-button>
          <el-button type="primary" @click="handleAddMedication">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑药物对话框 -->
    <el-dialog
      v-model="editMedicationDialogVisible"
      title="编辑药物"
      width="500px"
      :before-close="handleCloseEditMedicationDialog"
    >
      <el-form
        ref="editMedicationFormRef"
        :model="editMedicationForm"
        :rules="medicationRules"
        label-width="80px"
      >
        <el-form-item label="药物名称" prop="name">
          <el-input
            v-model="editMedicationForm.name"
            placeholder="请输入药物名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input
            v-model="editMedicationForm.specification"
            placeholder="例如：5mg/片"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="用法" prop="usage">
          <el-input
            v-model="editMedicationForm.usage"
            type="textarea"
            :rows="3"
            placeholder="例如：饭后服用，每次1片"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseEditMedicationDialog">取消</el-button>
          <el-button type="primary" @click="handleEditMedication">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加用药时间对话框 -->
    <el-dialog
      v-model="addTimeDialogVisible"
      title="添加用药时间"
      width="600px"
      :before-close="handleCloseAddTimeDialog"
    >
      <el-form ref="timeFormRef" :model="timeForm" :rules="timeRules" label-width="100px">
        <el-form-item label="选择药物" prop="medicationId">
          <el-select v-model="timeForm.medicationId" placeholder="请选择药物" class="w-full">
            <el-option
              v-for="medication in medications"
              :key="medication.id"
              :label="medication.name"
              :value="medication.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="用药方式" prop="type">
          <el-radio-group v-model="timeForm.type">
            <el-radio value="once">单次用药</el-radio>
            <el-radio value="repeat">重复用药</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="timeForm.type === 'once' ? '用药时间' : '用药时间'" prop="datetime">
          <el-date-picker
            v-if="timeForm.type === 'once'"
            v-model="timeForm.datetime"
            type="datetime"
            placeholder="请选择用药日期和时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="w-full"
          />
          <el-time-picker
            v-else
            v-model="timeForm.datetime"
            placeholder="请选择用药时间"
            format="HH:mm"
            value-format="HH:mm:ss"
            class="w-full"
          />
        </el-form-item>

        <!-- 重复配置 -->
        <template v-if="timeForm.type === 'repeat'">
          <el-form-item label="重复频率" prop="repeatConfig.frequency">
            <el-select
              v-model="timeForm.repeatConfig.frequency"
              placeholder="请选择重复频率"
              class="w-full"
            >
              <el-option label="每天" value="daily" />
              <el-option label="每周" value="weekly" />
              <el-option label="每月" value="monthly" />
            </el-select>
          </el-form-item>

          <el-form-item label="重复间隔" prop="repeatConfig.interval">
            <el-input-number
              v-model="timeForm.repeatConfig.interval"
              :min="1"
              :max="365"
              class="w-full"
            />
            <span class="ml-2 text-sm text-gray-500">
              {{
                timeForm.repeatConfig.frequency === 'daily'
                  ? '天'
                  : timeForm.repeatConfig.frequency === 'weekly'
                    ? '周'
                    : '月'
              }}
            </span>
          </el-form-item>

          <!-- 每周重复的星期几选择 -->
          <el-form-item v-if="timeForm.repeatConfig.frequency === 'weekly'" label="重复星期">
            <el-checkbox-group v-model="timeForm.repeatConfig.weekDays">
              <el-checkbox :value="1">周一</el-checkbox>
              <el-checkbox :value="2">周二</el-checkbox>
              <el-checkbox :value="3">周三</el-checkbox>
              <el-checkbox :value="4">周四</el-checkbox>
              <el-checkbox :value="5">周五</el-checkbox>
              <el-checkbox :value="6">周六</el-checkbox>
              <el-checkbox :value="0">周日</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- 每月重复的日期选择 -->
          <el-form-item v-if="timeForm.repeatConfig.frequency === 'monthly'" label="每月日期">
            <el-input-number
              v-model="timeForm.repeatConfig.monthDay"
              :min="1"
              :max="31"
              class="w-32"
            />
            <span class="ml-2 text-sm text-gray-500">日</span>
          </el-form-item>

          <el-form-item label="结束日期">
            <el-date-picker
              v-model="timeForm.repeatConfig.endDate"
              type="date"
              placeholder="请选择结束日期（可选）"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAddTimeDialog">取消</el-button>
          <el-button type="primary" @click="handleAddTime">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Clock } from '@element-plus/icons-vue'
import { debounce } from 'lodash'
import {
  getMedicationSettings,
  saveMedicationSettings,
  getMedicationOptions,
  addMedication,
  updateMedication,
  deleteMedication
} from '@/api/settings'
import type {
  MedicationSettings,
  Medication,
  MedicationTime,
  MedicationType,
  RepeatFrequency
} from '@/types/settings'
import type { FormInstance, FormRules } from 'element-plus'

/**
 * 默认设置值
 */
const defaultSettings: MedicationSettings = {
  enabled: false,
  medicationTimes: []
}

const settingsForm = reactive<MedicationSettings>({ ...defaultSettings })
const isInitialized = ref(false)

/**
 * 药物列表
 */
const medications = ref<Medication[]>([])

// 药物管理弹窗
const medicationManagementDialogVisible = ref(false)

// 添加药物对话框
const addMedicationDialogVisible = ref(false)
const medicationFormRef = ref<FormInstance>()
const medicationForm = reactive({
  name: '',
  specification: '',
  usage: ''
})

// 编辑药物对话框
const editMedicationDialogVisible = ref(false)
const editMedicationFormRef = ref<FormInstance>()
const editMedicationForm = reactive({
  id: '',
  name: '',
  specification: '',
  usage: ''
})

// 药物表单验证规则
const medicationRules: FormRules = {
  name: [
    { required: true, message: '请输入药物名称', trigger: 'blur' },
    { min: 2, max: 50, message: '药物名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  specification: [
    { required: true, message: '请输入药物规格', trigger: 'blur' },
    { max: 30, message: '规格长度不能超过 30 个字符', trigger: 'blur' }
  ],
  usage: [
    { required: true, message: '请输入用法说明', trigger: 'blur' },
    { max: 100, message: '用法说明长度不能超过 100 个字符', trigger: 'blur' }
  ]
}

// 添加用药时间对话框
const addTimeDialogVisible = ref(false)
const timeFormRef = ref<FormInstance>()
const timeForm = reactive({
  medicationId: '',
  type: 'once' as MedicationType,
  datetime: '',
  repeatConfig: {
    frequency: 'daily' as RepeatFrequency,
    interval: 1,
    endDate: '',
    weekDays: [] as number[],
    monthDay: 1
  }
})

// 用药时间表单验证规则
const timeRules: FormRules = {
  medicationId: [{ required: true, message: '请选择药物', trigger: 'change' }],
  type: [{ required: true, message: '请选择用药方式', trigger: 'change' }],
  datetime: [{ required: true, message: '请选择用药时间', trigger: 'change' }],
  'repeatConfig.frequency': [{ required: true, message: '请选择重复频率', trigger: 'change' }],
  'repeatConfig.interval': [
    { required: true, message: '请输入重复间隔', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '重复间隔必须在1-365之间', trigger: 'blur' }
  ]
}

/**
 * 加载现有设置
 */
const loadSettings = async () => {
  const [settingsResponse, medicationsResponse] = await Promise.all([
    getMedicationSettings(),
    getMedicationOptions()
  ])

  // 分别设置设置数据和药物数据
  const settings = settingsResponse.data

  // 兼容旧数据：为没有type字段的用药时间添加默认type
  if (settings.medicationTimes) {
    settings.medicationTimes = settings.medicationTimes.map(
      (time: Partial<MedicationTime>) =>
        ({
          ...time,
          type: time.type || 'once' // 默认为单次用药
        }) as MedicationTime
    )
  }

  Object.assign(settingsForm, settings)
  medications.value = medicationsResponse.data

  // 等待所有响应式更新完成后再激活监听器
  await nextTick()
  isInitialized.value = true
}

/**
 * 保存设置
 */
const saveSettings = async () => {
  await saveMedicationSettings({ ...settingsForm })
  ElMessage.success('设置保存成功')
}

// 创建防抖保存函数
const debouncedSaveSettings = debounce(saveSettings, 500)

/**
 * 监听表单变化，自动保存
 */
watch(
  () => settingsForm,
  () => {
    if (isInitialized.value) {
      debouncedSaveSettings()
    }
  },
  { deep: true }
)

/**
 * 显示药物管理弹窗
 */
const showMedicationManagementDialog = () => {
  medicationManagementDialogVisible.value = true
}

/**
 * 关闭药物管理弹窗
 */
const handleCloseMedicationManagementDialog = () => {
  medicationManagementDialogVisible.value = false
}

/**
 * 显示添加药物对话框
 */
const showAddMedicationDialog = () => {
  addMedicationDialogVisible.value = true
}

/**
 * 关闭添加药物对话框
 */
const handleCloseAddMedicationDialog = () => {
  medicationFormRef.value?.resetFields()
  Object.assign(medicationForm, {
    name: '',
    specification: '',
    usage: ''
  })
  addMedicationDialogVisible.value = false
}

/**
 * 添加药物
 */
const handleAddMedication = async () => {
  if (!medicationFormRef.value) return

  const valid = await medicationFormRef.value.validate().catch(() => false)
  if (!valid) return

  // 调用 API 添加自定义药物
  const response = await addMedication({
    name: medicationForm.name,
    specification: medicationForm.specification,
    usage: medicationForm.usage
  })

  // 将新药物添加到本地列表
  medications.value.push(response.data)
  ElMessage.success('药物添加成功')
  handleCloseAddMedicationDialog()
}

/**
 * 显示编辑药物对话框
 */
const showEditMedicationDialog = (medication: Medication) => {
  Object.assign(editMedicationForm, medication)
  editMedicationDialogVisible.value = true
}

/**
 * 关闭编辑药物对话框
 */
const handleCloseEditMedicationDialog = () => {
  editMedicationFormRef.value?.resetFields()
  Object.assign(editMedicationForm, {
    id: '',
    name: '',
    specification: '',
    usage: ''
  })
  editMedicationDialogVisible.value = false
}

/**
 * 编辑药物
 */
const handleEditMedication = async () => {
  if (!editMedicationFormRef.value) return

  const valid = await editMedicationFormRef.value.validate().catch(() => false)
  if (!valid) return

  // 调用 API 更新药物
  const response = await updateMedication({ ...editMedicationForm })

  // 更新本地药物列表
  const index = medications.value.findIndex((m) => m.id === editMedicationForm.id)
  if (index !== -1) {
    medications.value[index] = response.data
  }

  ElMessage.success('药物修改成功')
  handleCloseEditMedicationDialog()
}

/**
 * 删除药物
 */
const removeMedication = async (medicationId: string) => {
  await ElMessageBox.confirm('确定要删除这个药物吗？删除后相关的用药时间也会被清除。', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  // 调用 API 删除药物
  await deleteMedication(medicationId)

  // 删除本地药物
  medications.value = medications.value.filter((m) => m.id !== medicationId)
  // 删除相关的用药时间
  settingsForm.medicationTimes = settingsForm.medicationTimes.filter(
    (t) => t.medicationId !== medicationId
  )

  ElMessage.success('药物删除成功')
}

/**
 * 显示添加用药时间对话框
 */
const showAddTimeDialog = () => {
  addTimeDialogVisible.value = true
}

/**
 * 关闭添加用药时间对话框
 */
const handleCloseAddTimeDialog = () => {
  timeFormRef.value?.resetFields()
  Object.assign(timeForm, {
    medicationId: '',
    type: 'once' as MedicationType,
    datetime: '',
    repeatConfig: {
      frequency: 'daily' as RepeatFrequency,
      interval: 1,
      endDate: '',
      weekDays: [] as number[],
      monthDay: 1
    }
  })
  addTimeDialogVisible.value = false
}

/**
 * 添加用药时间
 */
const handleAddTime = async () => {
  if (!timeFormRef.value) return

  const valid = await timeFormRef.value.validate().catch(() => false)
  if (!valid) return

  // 验证重复配置
  if (timeForm.type === 'repeat') {
    if (
      timeForm.repeatConfig.frequency === 'weekly' &&
      timeForm.repeatConfig.weekDays.length === 0
    ) {
      ElMessage.error('请至少选择一个重复的星期')
      return
    }
  }

  const newTime: MedicationTime = {
    id: Date.now().toString(),
    medicationId: timeForm.medicationId,
    type: timeForm.type,
    datetime: timeForm.datetime,
    enabled: true
  }

  // 如果是重复用药，添加重复配置
  if (timeForm.type === 'repeat') {
    newTime.repeatConfig = { ...timeForm.repeatConfig }
    // 清理空的结束日期
    if (!newTime.repeatConfig.endDate) {
      delete newTime.repeatConfig.endDate
    }
  }

  settingsForm.medicationTimes.push(newTime)
  ElMessage.success('用药时间添加成功')
  handleCloseAddTimeDialog()
}

/**
 * 删除用药时间
 */
const removeMedicationTime = async (timeId: string) => {
  await ElMessageBox.confirm('确定要删除这个用药时间吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  settingsForm.medicationTimes = settingsForm.medicationTimes.filter((t) => t.id !== timeId)
  ElMessage.success('用药时间删除成功')
}

/**
 * 根据药物ID获取药物名称
 */
const getMedicationName = (medicationId: string): string => {
  const medication = medications.value.find((m) => m.id === medicationId)
  return medication?.name || '未知药物'
}

/**
 * 格式化日期时间
 */
const formatDateTime = (datetime: string): string => {
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 格式化用药时间显示
 */
const formatMedicationTime = (time: MedicationTime): string => {
  if (time.type === 'once') {
    return formatDateTime(time.datetime)
  } else {
    // 重复用药只显示时间
    const [hours, minutes] = time.datetime.split(':')
    return `${hours}:${minutes}`
  }
}

/**
 * 获取重复描述文本
 */
const getRepeatDescription = (time: MedicationTime): string => {
  if (!time.repeatConfig || time.type !== 'repeat') return ''

  const { frequency, interval, endDate, weekDays, monthDay } = time.repeatConfig

  let description = ''

  // 基础频率描述
  if (frequency === 'daily') {
    description = interval === 1 ? '每天' : `每${interval}天`
  } else if (frequency === 'weekly') {
    if (interval === 1) {
      if (weekDays && weekDays.length > 0) {
        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const selectedDays = weekDays.map((day) => dayNames[day]).join('、')
        description = `每周${selectedDays}`
      } else {
        description = '每周'
      }
    } else {
      description = `每${interval}周`
    }
  } else if (frequency === 'monthly') {
    if (interval === 1) {
      description = monthDay ? `每月${monthDay}日` : '每月'
    } else {
      description = `每${interval}月`
    }
  }

  // 添加结束日期描述
  if (endDate) {
    description += `，至${endDate}`
  }

  return description
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
.setting-item {
  @apply flex items-center justify-between gap-8 py-6;
}

.setting-label {
  @apply flex-1;
}

.label-title {
  @apply text-base font-medium text-gray-900 mb-2;
}

.label-description {
  @apply text-sm text-gray-500 leading-relaxed;
}

.setting-control {
  @apply flex-shrink-0;
}

.medication-list,
.time-list {
  @apply mt-6;
}

.list-header {
  @apply mb-4;
}

.header-title {
  @apply text-sm font-medium text-gray-700;
}

.medication-items,
.time-items {
  @apply space-y-3;
}

.medication-item,
.time-item {
  @apply flex items-center justify-between p-4 bg-gray-50 rounded-lg;
}

.medication-info,
.time-info {
  @apply flex-1;
}

.medication-name {
  @apply text-base font-medium text-gray-900 mb-1;
}

.medication-details {
  @apply text-sm text-gray-600 space-x-4;
}

.specification {
  @apply inline-block;
}

.usage {
  @apply inline-block;
}

.time-datetime {
  @apply text-sm text-gray-600 mb-1;
}

.repeat-info {
  @apply mt-1;
}

.medication-actions,
.time-actions {
  @apply flex items-center gap-2;
}

.dialog-footer {
  @apply flex justify-end gap-2;
}

.medication-management {
  @apply min-h-96;
}

.management-header {
  @apply mb-4;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16 text-gray-500;
}

.empty-text {
  @apply text-lg font-medium mb-2;
}

.empty-description {
  @apply text-sm;
}

.medication-table {
  @apply mt-4;
}
</style>
