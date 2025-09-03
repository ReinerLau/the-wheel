<template>
  <el-dialog
    :model-value="visible"
    title="药物管理"
    width="800px"
    @update:model-value="handleClose"
    @close="handleClose"
  >
    <div class="medication-management">
      <div class="management-header">
        <el-button type="primary" :icon="Plus" @click="showAddDialog"> 添加药物 </el-button>
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
              <el-button size="small" type="primary" @click="showEditDialog(scope.row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="handleRemoveMedication(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>

    <!-- 添加药物对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加药物"
      width="500px"
      :before-close="handleCloseAddDialog"
    >
      <MedicationForm ref="addFormRef" @update:form="handleFormUpdate" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseAddDialog">取消</el-button>
          <el-button type="primary" @click="handleAddMedication">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑药物对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑药物"
      width="500px"
      :before-close="handleCloseEditDialog"
    >
      <MedicationForm
        ref="editFormRef"
        :medication="editingMedication"
        @update:form="handleEditFormUpdate"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="handleEditMedication">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import MedicationForm from './MedicationForm.vue'
import type { Medication } from '@/types/settings'

/**
 * 组件属性
 */
interface Props {
  /** 对话框显示状态 */
  visible: boolean
  /** 药物列表 */
  medications: Medication[]
}

/**
 * 组件事件
 */
interface Emits {
  /** 关闭对话框 */
  (e: 'close'): void
  /** 添加药物 */
  (e: 'add-medication', medication: Partial<Medication>): Promise<void>
  /** 编辑药物 */
  (e: 'edit-medication', medication: Medication): Promise<void>
  /** 删除药物 */
  (e: 'remove-medication', medicationId: string): Promise<void>
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 添加药物对话框
const addDialogVisible = ref(false)
const addFormRef = ref<InstanceType<typeof MedicationForm>>()
const addFormData = ref<Partial<Medication>>({})

// 编辑药物对话框
const editDialogVisible = ref(false)
const editFormRef = ref<InstanceType<typeof MedicationForm>>()
const editFormData = ref<Partial<Medication>>({})
const editingMedication = ref<Partial<Medication>>({})

/**
 * 关闭主对话框
 */
const handleClose = () => {
  emit('close')
}

/**
 * 显示添加药物对话框
 */
const showAddDialog = () => {
  addDialogVisible.value = true
}

/**
 * 关闭添加药物对话框
 */
const handleCloseAddDialog = () => {
  addFormRef.value?.resetFields()
  addFormData.value = {}
  addDialogVisible.value = false
}

/**
 * 处理添加表单数据更新
 */
const handleFormUpdate = (form: Partial<Medication>) => {
  addFormData.value = form
}

/**
 * 添加药物
 */
const handleAddMedication = async () => {
  if (!addFormRef.value) return

  const valid = await addFormRef.value.validate()
  if (!valid) return

  await emit('add-medication', addFormData.value)
  handleCloseAddDialog()
}

/**
 * 显示编辑药物对话框
 */
const showEditDialog = (medication: Medication) => {
  editingMedication.value = { ...medication }
  editDialogVisible.value = true
}

/**
 * 关闭编辑药物对话框
 */
const handleCloseEditDialog = () => {
  editFormRef.value?.resetFields()
  editFormData.value = {}
  editingMedication.value = {}
  editDialogVisible.value = false
}

/**
 * 处理编辑表单数据更新
 */
const handleEditFormUpdate = (form: Partial<Medication>) => {
  editFormData.value = form
}

/**
 * 编辑药物
 */
const handleEditMedication = async () => {
  if (!editFormRef.value) return

  const valid = await editFormRef.value.validate()
  if (!valid) return

  await emit('edit-medication', editFormData.value as Medication)
  handleCloseEditDialog()
}

/**
 * 删除药物
 */
const handleRemoveMedication = async (medicationId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个药物吗？删除后相关的用药时间也会被清除。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await emit('remove-medication', medicationId)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除药物失败')
    }
  }
}
</script>

<style scoped lang="scss">
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

.dialog-footer {
  @apply flex justify-end gap-2;
}
</style>
