<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getShelfList, createShelf, updateShelf, deleteShelfById, locateShelf } from '@/api/shelf'
import { createMaterial } from '@/api/material'
import { getRobotList } from '@/api/monitor'
import type { Shelf } from '@/types/shelf'

const route = useRoute()
const warehouseId = Number(route.params.id)
const warehouseName = route.params.name

// 定位对话框相关
const locateDialogVisible = ref(false)
const locateForm = ref({
  robotId: undefined,
  type: undefined,
})
const robotList = ref([])
const positionTypes = [
  { label: '一般点位', value: 0 },
  { label: '前台点', value: 1 },
  { label: '闸机', value: 7 },
  { label: '电梯外', value: 3 },
  { label: '电梯内', value: 4 },
  { label: '充电桩', value: 11 },
]

// 获取机器人列表
const fetchRobotList = async () => {
  const res: any = await getRobotList()
  robotList.value = res.data
}

// 货架列表相关
const shelfList = ref<Shelf[]>([])
const selectedShelves = ref<number[]>([])
const shelfFilter = ref('')
const shelfContextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  shelfId: 0,
})

// 新增货架对话框相关
const addShelfDialogVisible = ref(false)
const addShelfForm = ref({
  shelfName: '',
})
const addShelfFormRef = ref()

// 新增物资对话框相关
const addMaterialDialogVisible = ref(false)
const materialForm = ref({
  materialName: '',
  materialCode: '',
  categoryName: '',
  supplier: '',
  unit: '',
  productionDate: '',
  warehouseId,
  store: selectedShelves.value.map((shelfId) => {
    const shelf = shelfList.value.find((s) => s.id === shelfId)
    return {
      id: shelfId,
      shelfName: shelf?.shelfName || '',
      count: 0,
    }
  }),
})
const materialFormRef = ref()

const materialRules = {
  materialName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  materialCode: [{ required: true, message: '请输入资产编码', trigger: 'blur' }],
  categoryName: [{ required: true, message: '请输入资产分类', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入计量单位', trigger: 'blur' }],
  productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
  store: [{ required: true, message: '请选择货架并输入库存数量', trigger: 'blur' }],
}

// 获取货架列表
const fetchShelfList = async () => {
  const res = await getShelfList({ warehouseId: warehouseId, limit: 9999 })
  shelfList.value = res.data.list || []
}

// 新增货架
const handleAddShelf = () => {
  addShelfForm.value.shelfName = ''
  addShelfDialogVisible.value = true
}

// 提交新增货架表单
const handleAddShelfSubmit = async () => {
  if (!addShelfForm.value.shelfName) {
    ElMessage.warning('请输入货架名称')
    return
  }

  await createShelf({
    warehouseId: warehouseId,
    shelfName: addShelfForm.value.shelfName,
  })
  ElMessage.success('新增货架成功')
  addShelfDialogVisible.value = false
  fetchShelfList()
}

// 批量删除货架
// const handleBatchDelete = async () => {
//   if (!selectedShelves.value.length) {
//     ElMessage.warning('请选择要删除的货架')
//     return
//   }

//   try {
//     await ElMessageBox.confirm('确认删除选中的货架？', '提示')
//     await deleteShelfs({
//       ids: selectedShelves.value.join(','),
//       warehouseId: warehouseId,
//     })
//     ElMessage.success('删除货架成功')
//     selectedShelves.value = []
//     fetchShelfList()
//   } catch (error) {
//     if (error !== 'cancel') {
//       ElMessage.error('删除货架失败')
//     }
//   }
// }

// 右键菜单 - 编辑货架
const handleEditShelf = async (shelf: Shelf) => {
  try {
    const { value: newCode } = await ElMessageBox.prompt('请输入新的货架名称', '编辑货架', {
      inputValue: shelf.shelfName,
    })
    await updateShelf({ ...shelf, shelfName: newCode })
    ElMessage.success('编辑货架成功')
    fetchShelfList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('编辑货架失败')
    }
  }
}

// 右键菜单 - 删除货架
const handleDeleteShelf = async (shelfId: number) => {
  await ElMessageBox.confirm('确认删除该货架？', '提示')
  await deleteShelfById(shelfId)
  ElMessage.success('删除货架成功')
  fetchShelfList()
}
// 保存当前选中的货架ID
const currentShelfId = ref()
// 右键菜单 - 货架定位
const handleLocateShelf = async (shelfId: number | string) => {
  locateForm.value = {
    robotId: undefined,
    type: undefined,
  }
  locateDialogVisible.value = true
  currentShelfId.value = shelfId
}

// 提交定位表单
const handleLocateSubmit = async () => {
  if (!locateForm.value.robotId || locateForm.value.type === undefined) {
    ElMessage.warning('请选择机器人和定位类型')
    return
  }

  await locateShelf({
    id: currentShelfId.value,
    robotId: locateForm.value.robotId,
    type: locateForm.value.type,
  })
  ElMessage.success('货架定位成功')
  locateDialogVisible.value = false
}

// 新增物资
const handleAddMaterial = () => {
  if (!selectedShelves.value.length) {
    ElMessage.warning('请先选择货架')
    return
  }
  materialForm.value = {
    categoryName: '',
    supplier: '',
    unit: '',
    productionDate: '',
    materialName: '',
    materialCode: '',
    warehouseId: warehouseId,
    store: selectedShelves.value.map((shelfId) => {
      const shelf = shelfList.value.find((s) => s.id === shelfId)
      return {
        id: shelfId,
        shelfName: shelf?.shelfName || '',
        count: 0,
      }
    }),
  }
  addMaterialDialogVisible.value = true
}

// 提交新增物资表单
const handleMaterialSubmit = async () => {
  if (!materialFormRef.value) return

  await materialFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      await createMaterial(materialForm.value)
      ElMessage.success('创建物资成功')
      addMaterialDialogVisible.value = false
    }
  })
}

function changeShelfId(shelfId: any) {
  selectedShelves.value = selectedShelves.value.includes(shelfId)
    ? selectedShelves.value.filter((id) => id !== shelfId)
    : [...selectedShelves.value, shelfId]
}
onMounted(() => {
  fetchShelfList()
  fetchRobotList()
})
</script>

<template>
  <div class="p-4 h-full">
    <el-card class="mb-4 h-full overflow-y-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="warehouse-detail">
            <div text="2xl" font="bold" mb="4">仓库详情</div>
            <div>仓库名称: {{ warehouseName }}</div>
          </div>
          <div flex="~" gap="4">
            <el-button type="primary" @click="handleAddShelf">新增货架</el-button>
            <el-button type="primary" @click="handleAddMaterial">新增物资</el-button>
            <!-- <el-button type="danger" @click="handleBatchDelete">批量删除</el-button> -->
          </div>
        </div>
      </template>

      <div>
        <div mb="4" flex="~" justify="between" items="center">
          <el-input
            v-model="shelfFilter"
            placeholder="请输入货架名称筛选"
            prefix-icon="i-ep-search"
            w="64"
          />
        </div>

        <div class="shelf-grid" grid="~ cols-8" gap="2">
          <div
            v-for="shelf in shelfList.filter(
              (s) => !shelfFilter || s.shelfName.toLowerCase().includes(shelfFilter.toLowerCase()),
            )"
            :key="shelf.id"
            class="shelf-item"
            :class="{ active: selectedShelves.includes(shelf.id!) }"
            @click="changeShelfId(shelf.id)"
            @contextmenu.prevent="
              shelfContextMenu = {
                visible: true,
                x: $event.clientX,
                y: $event.clientY,
                shelfId: shelf.id!,
              }
            "
          >
            {{ shelf.shelfName }}
          </div>
        </div>

        <!-- 右键菜单 -->
        <div
          v-if="shelfContextMenu.visible"
          class="context-menu"
          :style="{
            left: shelfContextMenu.x + 'px',
            top: shelfContextMenu.y + 'px',
          }"
          @mouseleave="shelfContextMenu.visible = false"
        >
          <div
            class="context-menu-item"
            @click="handleEditShelf(shelfList.find((s: any) => s.id === shelfContextMenu.shelfId)!)"
          >
            <div i-ep-edit mr="2" />
            编辑
          </div>
          <div class="context-menu-item" @click="handleDeleteShelf(shelfContextMenu.shelfId)">
            <div i-ep-delete mr="2" />
            删除
          </div>
          <div class="context-menu-item" @click="handleLocateShelf(shelfContextMenu.shelfId)">
            <div i-ep-location mr="2" />
            定位
          </div>
        </div>
      </div>
    </el-card>

    <!-- 新增货架对话框 -->
    <el-dialog
      v-model="addShelfDialogVisible"
      title="新增货架"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form ref="addShelfFormRef" :model="addShelfForm" label-width="80px">
        <el-form-item label="货架名称" required>
          <el-input v-model="addShelfForm.shelfName" placeholder="请输入货架名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addShelfDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddShelfSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增物资对话框 -->
    <el-dialog v-model="addMaterialDialogVisible" title="新增物资" width="500px" destroy-on-close>
      <el-form
        ref="materialFormRef"
        :model="materialForm"
        :rules="materialRules"
        label-width="100px"
      >
        <el-form-item label="资产编码" prop="materialCode">
          <el-input v-model="materialForm.materialCode" placeholder="请输入资产编码" />
        </el-form-item>
        <el-form-item label="资产名称" prop="materialName">
          <el-input v-model="materialForm.materialName" placeholder="请输入资产名称" />
        </el-form-item>
        <el-form-item label="资产分类" prop="categoryName">
          <el-input v-model="materialForm.categoryName" placeholder="请输入资产分类" />
        </el-form-item>
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="materialForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
        <el-form-item label="计量单位" prop="unit">
          <el-input v-model="materialForm.unit" placeholder="请输入计量单位" />
        </el-form-item>
        <el-form-item label="生产日期" prop="productionDate">
          <el-date-picker
            v-model="materialForm.productionDate"
            type="date"
            placeholder="请选择生产日期"
          />
        </el-form-item>
        <el-form-item label="货架库存" prop="store">
          <div v-for="(item, index) in materialForm.store" :key="item.id" class="shelf-store-item">
            <span class="shelf-shelfName">{{ item.shelfName }}</span>
            <el-input-number
              v-model="materialForm.store[index].count"
              :min="0"
              :precision="0"
              placeholder="请输入库存数量"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addMaterialDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleMaterialSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 定位对话框 -->
    <el-dialog
      v-model="locateDialogVisible"
      title="货架定位"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-form :model="locateForm" label-width="100px">
        <el-form-item label="选择机器人" required>
          <el-select v-model="locateForm.robotId" placeholder="请选择机器人">
            <el-option
              v-for="robot in robotList"
              :key="robot.code"
              :label="robot.name"
              :value="robot.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="定位类型" required>
          <el-select v-model="locateForm.type" placeholder="请选择定位类型">
            <el-option
              v-for="type in positionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="locateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleLocateSubmit()">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.shelf-grid {
  @apply bg-gray-50 p-4 rounded-lg;
}

.shelf-item {
  @apply h-12 flex items-center justify-center bg-white rounded shadow-sm cursor-pointer transition-all duration-300;

  &:hover {
    @apply shadow-md transform -translate-y-0.5;
  }

  &.active {
    @apply ring-2 ring-blue-500;
  }
}

.context-menu {
  @apply fixed bg-white rounded-lg shadow-lg py-2 z-50;
}

.context-menu-item {
  @apply px-4 py-2 flex items-center cursor-pointer hover:bg-gray-100;
}

.shelf-store-item {
  @apply flex items-center gap-4 mb-2;
}

.shelf-shelfName {
  @apply w-20 text-gray-600;
}
</style>
