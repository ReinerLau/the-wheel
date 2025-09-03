<template>
  <el-scrollbar class="h-full">
    <el-card>
      <!-- 用药提醒开关设置 -->
      <SettingItem title="用药提醒开关" description="开启后，系统将在设定的时间提醒您按时用药">
        <el-switch
          v-model="settingsForm.enabled"
          size="large"
          active-text="开启"
          inactive-text="关闭"
        />
      </SettingItem>

      <!-- 分割线 -->
      <el-divider />

      <!-- 药物管理设置 -->
      <SettingItem title="药物管理" description="添加和管理您的药物信息，包括药物名称、规格和用法">
        <el-button type="primary" :icon="Plus" @click="showMedicationManagementDialog">
          药物管理
        </el-button>
      </SettingItem>

      <!-- 分割线 -->
      <el-divider />

      <!-- 用药时间设置 -->
      <SettingItem
        title="用药时间"
        description="设置具体的用药时间和日期，系统将在指定时间提醒您用药"
      >
        <el-button
          type="primary"
          :icon="Clock"
          :disabled="medications.length === 0"
          @click="showAddTimeDialog"
        >
          添加用药时间
        </el-button>
      </SettingItem>

      <!-- 用药时间列表 -->
      <MedicationTimeList
        :medication-times="settingsForm.medicationTimes"
        :medications="medications"
        @toggle-enabled="handleToggleTimeEnabled"
        @remove-time="removeMedicationTime"
      />
    </el-card>

    <!-- 药物管理弹窗 -->
    <MedicationManagement
      :visible="medicationManagementDialogVisible"
      :medications="medications"
      @close="handleCloseMedicationManagementDialog"
      @add-medication="handleAddMedication"
      @edit-medication="handleEditMedication"
      @remove-medication="removeMedication"
    />

    <!-- 添加用药时间对话框 -->
    <el-dialog
      v-model="addTimeDialogVisible"
      title="添加用药时间"
      width="600px"
      :before-close="handleCloseAddTimeDialog"
    >
      <MedicationTimeForm
        ref="timeFormRef"
        :medications="medications"
        @update:form="handleTimeFormUpdate"
      />
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
import { Plus, Clock } from '@element-plus/icons-vue'
import { debounce } from 'lodash'
import {
  getMedicationSettings,
  saveMedicationSettings,
  getMedicationOptions,
  addMedication,
  updateMedication,
  deleteMedication
} from '@/api/settings'
import type { MedicationSettings, Medication, MedicationTime } from '@/types/settings'
import SettingItem from '@/components/common/SettingItem.vue'
import MedicationManagement from '@/components/settings/MedicationManagement.vue'
import MedicationTimeForm from '@/components/settings/MedicationTimeForm.vue'
import MedicationTimeList from '@/components/settings/MedicationTimeList.vue'

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

// 添加用药时间对话框
const addTimeDialogVisible = ref(false)
const timeFormRef = ref<InstanceType<typeof MedicationTimeForm>>()
const timeFormData = ref<Partial<MedicationTime>>({})

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
 * 添加药物
 */
const handleAddMedication = async (medicationData: Partial<Medication>) => {
  // 确保必需字段存在
  if (!medicationData.name || !medicationData.specification || !medicationData.usage) {
    ElMessage.error('药物信息不完整')
    return
  }

  // 调用 API 添加自定义药物
  const response = await addMedication({
    name: medicationData.name,
    specification: medicationData.specification,
    usage: medicationData.usage
  })
  // 将新药物添加到本地列表
  medications.value.push(response.data)
  ElMessage.success('药物添加成功')
}

/**
 * 编辑药物
 */
const handleEditMedication = async (medicationData: Medication) => {
  // 调用 API 更新药物
  const response = await updateMedication(medicationData)
  // 更新本地药物列表
  const index = medications.value.findIndex((m) => m.id === medicationData.id)
  if (index !== -1) {
    medications.value[index] = response.data
  }
  ElMessage.success('药物修改成功')
}

/**
 * 删除药物
 */
const removeMedication = async (medicationId: string) => {
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
  timeFormData.value = {}
  addTimeDialogVisible.value = false
}

/**
 * 处理用药时间表单数据更新
 */
const handleTimeFormUpdate = (formData: Partial<MedicationTime>) => {
  timeFormData.value = formData
}

/**
 * 添加用药时间
 */
const handleAddTime = async () => {
  if (!timeFormRef.value) return

  const valid = await timeFormRef.value.validate()
  if (!valid) return

  const newTime: MedicationTime = {
    id: Date.now().toString(),
    medicationId: timeFormData.value.medicationId!,
    type: timeFormData.value.type!,
    datetime: timeFormData.value.datetime!,
    enabled: true
  }

  // 如果是重复用药，添加重复配置
  if (timeFormData.value.type === 'repeat' && timeFormData.value.repeatConfig) {
    newTime.repeatConfig = { ...timeFormData.value.repeatConfig }
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
 * 处理切换用药时间启用状态
 */
const handleToggleTimeEnabled = (timeId: string, enabled: boolean) => {
  const time = settingsForm.medicationTimes.find((t) => t.id === timeId)
  if (time) {
    time.enabled = enabled
    debouncedSaveSettings()
  }
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

onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
.dialog-footer {
  @apply flex justify-end gap-2;
}
</style>
