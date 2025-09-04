<template>
  <div class="h-full">
    <!-- 操作栏 -->
    <div class="mb-4 flex justify-end items-center">
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <Plus />
        </el-icon>
        新增路线
      </el-button>
    </div>

    <!-- 路线列表 -->
    <el-table :data="routeList" border style="width: 100%">
      <el-table-column prop="name" label="路线名称" />
      <el-table-column label="经过地点" min-width="300">
        <template #default="{ row }">
          <el-tag v-for="location in row.locations" :key="location.id" class="mr-1 mb-1">
            {{ location.name }}
          </el-tag>
        </template>
      </el-table-column>
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
      :title="isEdit ? '编辑路线' : '新增路线'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="路线名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入路线名称" />
        </el-form-item>
        <el-form-item label="经过地点" prop="locationIds">
          <div class="w-full">
            <!-- 添加地点按钮 -->
            <div class="mb-3">
              <el-button @click="addLocationToRoute">
                <el-icon>
                  <Plus />
                </el-icon>
                添加地点
              </el-button>
            </div>

            <!-- 已选地点列表 -->
            <div v-if="selectedLocations.length > 0" class="space-y-2">
              <div
                v-for="(location, index) in selectedLocations"
                :key="location.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded"
              >
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-gray-500">{{ index + 1 }}.</span>
                  <span>{{ location.name }}</span>
                  <span class="text-xs text-gray-400"> ({{ location.x }}, {{ location.y }}) </span>
                </div>
                <el-button type="danger" size="small" @click="removeLocationFromRoute(index)">
                  移除
                </el-button>
              </div>
            </div>

            <!-- 空状态 -->
            <div
              v-else
              class="text-center text-gray-400 py-8 border border-dashed border-gray-200 rounded"
            >
              暂无地点，请点击"添加地点"按钮添加
            </div>
          </div>
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

    <!-- 地点选择弹窗 -->
    <el-dialog v-model="locationSelectVisible" title="选择地点" width="500px">
      <el-table :data="availableLocations" @row-click="handleLocationRowClick">
        <el-table-column prop="name" label="地点名称" />
        <el-table-column label="坐标" width="150">
          <template #default="{ row }"> ({{ row.x }}, {{ row.y }}) </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="locationSelectVisible = false">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Location, Route } from '@/types/settings'
import { getRouteList, getLocationList, addRoute, updateRoute, deleteRoute } from '@/api/settings'

/**
 * 路线列表数据
 */
const routeList = ref<Route[]>([])

/**
 * 地点列表数据
 */
const locationList = ref<Location[]>([])

/**
 * 弹窗相关状态
 */
const dialogVisible = ref(false)
const locationSelectVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

/**
 * 表单数据
 */
const formData = ref({
  id: '',
  name: '',
  locationIds: [] as string[]
})

/**
 * 已选择的地点
 */
const selectedLocations = ref<Location[]>([])

/**
 * 表单验证规则
 */
const formRules: FormRules = {
  name: [{ required: true, message: '请输入路线名称', trigger: 'blur' }],
  locationIds: [{ required: true, message: '请至少选择一个地点', trigger: 'change' }]
}

/**
 * 可选择的地点（排除已选择的）
 */
const availableLocations = computed(() => {
  return locationList.value.filter((location) => !formData.value.locationIds.includes(location.id))
})

/**
 * 获取路线列表
 */
const getRouteListData = async () => {
  const res = await getRouteList()
  routeList.value = res.data
}

/**
 * 获取地点列表
 */
const getLocationListData = async () => {
  const res = await getLocationList()
  locationList.value = res.data
}

/**
 * 添加地点到路线
 */
const addLocationToRoute = () => {
  if (availableLocations.value.length === 0) {
    ElMessage.warning('暂无可选择的地点')
    return
  }
  locationSelectVisible.value = true
}

/**
 * 从路线中移除地点
 */
const removeLocationFromRoute = (index: number) => {
  const removedLocation = selectedLocations.value[index]
  selectedLocations.value.splice(index, 1)
  formData.value.locationIds = formData.value.locationIds.filter((id) => id !== removedLocation.id)
}

/**
 * 处理地点行点击选择
 */
const handleLocationRowClick = (row: Location) => {
  selectedLocations.value.push(row)
  formData.value.locationIds.push(row.id)
  locationSelectVisible.value = false
}

/**
 * 新增路线
 */
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
}

/**
 * 编辑路线
 */
const handleEdit = (row: Route) => {
  isEdit.value = true
  formData.value = {
    id: row.id,
    name: row.name,
    locationIds: [...row.locationIds]
  }

  // 设置已选择的地点
  selectedLocations.value = row.locations ? [...row.locations] : []

  dialogVisible.value = true
}

/**
 * 删除路线
 */
const handleDelete = async (row: Route) => {
  await ElMessageBox.confirm('确认删除该路线吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  await deleteRoute(row.id)
  ElMessage.success('删除成功')
  getRouteListData()
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate()

  submitLoading.value = true

  if (isEdit.value) {
    await updateRoute({
      id: formData.value.id,
      name: formData.value.name,
      locationIds: formData.value.locationIds
    })
    ElMessage.success('编辑成功')
  } else {
    await addRoute({
      name: formData.value.name,
      locationIds: formData.value.locationIds
    })
    ElMessage.success('新增成功')
  }

  submitLoading.value = false
  dialogVisible.value = false
  getRouteListData()
}

/**
 * 重置表单
 */
const resetForm = () => {
  formData.value = {
    id: '',
    name: '',
    locationIds: []
  }
  selectedLocations.value = []
  formRef.value?.resetFields()
}

/**
 * 暴露给父组件的方法
 */
defineExpose({
  getList: getRouteListData
})

onMounted(() => {
  getRouteListData()
  getLocationListData()
})
</script>
