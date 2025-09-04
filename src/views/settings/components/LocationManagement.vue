<template>
  <div class="h-full">
    <!-- 操作栏 -->
    <div class="mb-4 flex justify-end items-center">
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <Plus />
        </el-icon>
        新增地点
      </el-button>
    </div>

    <!-- 地点列表 -->
    <el-table :data="locationList" border style="width: 100%">
      <el-table-column prop="name" label="地点名称" />
      <el-table-column prop="x" label="X坐标" width="120" />
      <el-table-column prop="y" label="Y坐标" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)"> 编辑 </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地点' : '新增地点'"
      width="500px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="地点名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入地点名称" @blur="handleNameBlur" />
        </el-form-item>
        <el-form-item label="坐标信息">
          <div class="flex items-center space-x-2">
            <el-button :loading="coordinatesLoading" @click="getCoordinates"> 录入 </el-button>
            <span class="text-sm text-gray-500"> 点击录入按钮自动获取坐标 </span>
          </div>
        </el-form-item>
        <el-form-item label="X坐标" prop="x">
          <el-input v-model.number="formData.x" placeholder="自动获取" disabled />
        </el-form-item>
        <el-form-item label="Y坐标" prop="y">
          <el-input v-model.number="formData.y" placeholder="自动获取" disabled />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Location } from '@/types/settings'
import {
  getLocationList,
  getLocationCoordinates,
  addLocation,
  updateLocation,
  deleteLocation
} from '@/api/settings'

/**
 * 地点列表数据
 */
const locationList = ref<Location[]>([])

/**
 * 弹窗相关状态
 */
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const coordinatesLoading = ref(false)
const submitLoading = ref(false)

/**
 * 表单数据
 */
const formData = ref({
  id: '',
  name: '',
  x: 0,
  y: 0
})

/**
 * 表单验证规则
 */
const formRules: FormRules = {
  name: [{ required: true, message: '请输入地点名称', trigger: 'blur' }],
  x: [{ required: true, message: '请先录入坐标信息', trigger: 'blur' }],
  y: [{ required: true, message: '请先录入坐标信息', trigger: 'blur' }]
}

/**
 * 获取地点列表
 */
const getList = async () => {
  const res = await getLocationList()
  locationList.value = res.data
}

/**
 * 地点名称失焦时清空坐标（如果名称有变化）
 */
const handleNameBlur = () => {
  if (!isEdit.value) {
    formData.value.x = 0
    formData.value.y = 0
  }
}

/**
 * 获取坐标信息
 */
const getCoordinates = async () => {
  coordinatesLoading.value = true
  const res = await getLocationCoordinates()
  formData.value.x = res.data.x
  formData.value.y = res.data.y
  coordinatesLoading.value = false
  ElMessage.success('坐标获取成功')
}

/**
 * 新增地点
 */
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
}

/**
 * 编辑地点
 */
const handleEdit = (row: Location) => {
  isEdit.value = true
  formData.value = { ...row }
  dialogVisible.value = true
}

/**
 * 删除地点
 */
const handleDelete = async (row: Location) => {
  await ElMessageBox.confirm('确认删除该地点吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await deleteLocation(row.id)
  ElMessage.success('删除成功')
  getList()
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate()

  submitLoading.value = true

  if (isEdit.value) {
    await updateLocation(formData.value as Location)
    ElMessage.success('编辑成功')
  } else {
    await addLocation(formData.value)
    ElMessage.success('新增成功')
  }

  submitLoading.value = false
  dialogVisible.value = false
  getList()
}

/**
 * 重置表单
 */
const resetForm = () => {
  formData.value = {
    id: '',
    name: '',
    x: 0,
    y: 0
  }
  formRef.value?.resetFields()
}

/**
 * 暴露给父组件的方法
 */
defineExpose({
  getList
})

onMounted(() => {
  getList()
})
</script>
