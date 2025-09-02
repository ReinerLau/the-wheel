<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Warehouse } from '@/types/warehouse'
import WarehouseCard from '@/components/warehouse/WarehouseCard.vue'
import {
  getWarehouseList,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '@/api/warehouseManagement'
import { ElMessage, ElMessageBox } from 'element-plus'

const warehouses = ref<Warehouse[]>([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref()

const queryForm = ref({
  name: '',
})

const form = ref<Warehouse>({
  id: 0,
  name: '',
  ceilingHeight: 0,
  tunnelLength: 0,
  shelveCount: 0,
  materialCount: 0,
  constructionTime: '',
  buildingArea: 0,
})

const rules = {
  name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }],
  ceilingHeight: [{ required: true, message: '请输入举架高度', trigger: 'blur' }],
  tunnelLength: [{ required: true, message: '请输入引洞长度', trigger: 'blur' }],
  shelveCount: [{ required: true, message: '请输入货架数量', trigger: 'blur' }],
  materialCount: [{ required: true, message: '请输入物资数量', trigger: 'blur' }],
  constructionTime: [{ required: true, message: '请选择建设时间', trigger: 'change' }],
  buildingArea: [{ required: true, message: '请输入建筑面积', trigger: 'blur' }],
}

const fetchData = async () => {
  const res = await getWarehouseList({ name: queryForm.value.name })
  warehouses.value = res.data.list
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    id: 0,
    name: '',
    ceilingHeight: 0,
    tunnelLength: 0,
    shelveCount: 0,
    materialCount: 0,
    constructionTime: '',
    buildingArea: 0,
  }
  dialogVisible.value = true
}

const handleEdit = (row: Warehouse) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: Warehouse) => {
  ElMessageBox.confirm('确认删除该仓库吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteWarehouse(row.id!)
    ElMessage.success('删除成功')
    fetchData()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (dialogType.value === 'add') {
        await createWarehouse(form.value as Omit<Warehouse, 'id'>)
        ElMessage.success('创建成功')
      } else {
        await updateWarehouse(form.value)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      fetchData()
    }
  })
}

const handleQuery = () => {
  fetchData()
}

const resetQuery = () => {
  queryForm.value = {
    name: '',
  }
  handleQuery()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-4 h-full">
    <el-card class="mb-4 h-full overflow-y-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 text="2xl" font="medium">仓库管理</h2>
          <div flex="~" gap="4">
            <el-button type="primary" @click="handleAdd">
              <div i-ep-plus mr="2" />
              新增仓库
            </el-button>
          </div>
        </div>
      </template>

      <div>
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="仓库名称">
            <el-input v-model="queryForm.name" placeholder="请输入仓库名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-scrollbar class="flex-1">
        <div grid="~ cols-1 md:cols-2 lg:cols-3" gap="6">
          <WarehouseCard
            v-for="warehouse in warehouses"
            :key="warehouse.id"
            :warehouse="warehouse"
            @edit="handleEdit(warehouse)"
            @delete="handleDelete(warehouse)"
          />
        </div>
      </el-scrollbar>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增仓库' : '编辑仓库'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label="举架高度" prop="ceilingHeight">
          <el-input-number v-model="form.ceilingHeight" :min="0" placeholder="请输入举架高度" />
        </el-form-item>
        <el-form-item label="引洞长度" prop="tunnelLength">
          <el-input-number v-model="form.tunnelLength" :min="0" placeholder="请输入引洞长度" />
        </el-form-item>
        <el-form-item label="货架数量" prop="shelveCount">
          <el-input-number v-model="form.shelveCount" :min="0" placeholder="请输入货架数量" />
        </el-form-item>
        <el-form-item label="物资数量" prop="materialCount">
          <el-input-number v-model="form.materialCount" :min="0" placeholder="请输入物资数量" />
        </el-form-item>
        <el-form-item label="建设时间" prop="constructionTime">
          <el-date-picker
            v-model="form.constructionTime"
            type="date"
            placeholder="请选择建设时间"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="建筑面积" prop="buildingArea">
          <el-input-number v-model="form.buildingArea" :min="0" placeholder="请输入建筑面积" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
