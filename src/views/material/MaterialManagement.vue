<template>
  <div class="p-4 h-full">
    <el-card class="mb-4 h-full overflow-y-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>物资管理</h3>
        </div>
      </template>

      <div flex="~ col">
        <div>
          <el-form :inline="true" :model="queryForm">
            <el-form-item label="资产编号">
              <el-input v-model="queryForm.materialCode" placeholder="请输入资产编号" clearable />
            </el-form-item>
            <el-form-item label="资产名称">
              <el-input v-model="queryForm.materialName" placeholder="请输入资产名称" clearable />
            </el-form-item>
            <el-form-item label="库房名称">
              <el-input v-model="queryForm.warehouseName" placeholder="请输入库房名称" clearable />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleQuery">查询</el-button>
              <el-button @click="resetQuery">重置</el-button>
              <el-button type="primary" @click="showUploadDialog">上传物资</el-button>
              <el-button @click="handleExport">下载模板</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table class="flex-1" :data="tableData" border style="width: 100%">
          <el-table-column prop="materialCode" label="资产编号" />
          <el-table-column prop="materialName" label="资产名称" />
          <el-table-column prop="categoryName" label="资产分类" />
          <el-table-column prop="supplier" label="供应商" />
          <el-table-column prop="unit" label="计量单位" />
          <el-table-column prop="productionDate" label="生产日期">
            <template #default="{ row }">
              {{ row.productionDate ? row.productionDate.split('T')[0] : '' }}
            </template>
          </el-table-column>
          <el-table-column prop="materialCount" label="物资数量" />
          <el-table-column label="位置库存">
            <template #default="{ row }">
              <template v-if="row.store && row.store.length > 0">
                <el-tag v-for="item in row.store" :key="item.id" type="info" class="mb-1">
                  {{ item.code }}: {{ item.count }}
                </el-tag>
              </template>
              <el-tag v-else type="info">暂无库存信息</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">出库</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="flex justify-end mt-4">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>

        <el-dialog v-model="dialogVisible" title="编辑物资" width="500px" destroy-on-close>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="资产编号" prop="materialCode">
              <el-input v-model="form.materialCode" placeholder="请输入资产编号" />
            </el-form-item>
            <el-form-item label="资产名称" prop="materialName">
              <el-input v-model="form.materialName" placeholder="请输入资产名称" />
            </el-form-item>
            <el-form-item label="资产分类" prop="categoryName">
              <el-input v-model="form.categoryName" placeholder="请输入资产分类" />
            </el-form-item>
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="form.supplier" placeholder="请输入供应商" />
            </el-form-item>
            <el-form-item label="计量单位" prop="unit">
              <el-input v-model="form.unit" placeholder="请输入计量单位" />
            </el-form-item>
            <el-form-item label="生产日期" prop="productionDate">
              <el-date-picker
                v-model="form.productionDate"
                type="date"
                placeholder="请选择生产日期"
              />
            </el-form-item>
            <el-form-item label="库房" prop="warehouseId">
              <el-select
                v-model="form.warehouseId"
                placeholder="请选择库房"
                :loading="warehouseLoading"
                clearable
                @change="handleWarehouseChange"
              >
                <el-option
                  v-for="item in warehouseList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <div v-for="(store, index) in form.store" :key="index" class="flex mb-3">
              <el-form-item
                class="mb-0 flex-1"
                :label="`货架${index + 1}`"
                :prop="`store.${index}.id`"
                :rules="{ required: true, message: '请选择货架', trigger: 'change' }"
              >
                <el-select
                  v-model="store.id"
                  placeholder="请选择货架"
                  :loading="shelfLoading"
                  clearable
                  :disabled="!form.warehouseId"
                >
                  <el-option
                    v-for="item in getDisabledShelfList(index)"
                    :key="item.id"
                    :label="item.shelfName"
                    :value="item.id"
                    :disabled="item.disabled"
                  />
                </el-select>
              </el-form-item>
              <el-form-item
                class="mb-0 flex-1"
                :label="`物资数量`"
                :prop="`store.${index}.count`"
                :rules="{ required: true, message: '请输入货架物资数量', trigger: 'blur' }"
              >
                <el-input-number
                  v-model="store.count"
                  :min="0"
                  :precision="0"
                  placeholder="请输入货架物资数量"
                  :disabled="!`store.${index}.code`"
                />
              </el-form-item>
              <el-button
                type="danger"
                link
                @click="removeStore(index)"
                :disabled="form.store.length <= 1"
                >删除
              </el-button>
            </div>
            <el-form-item>
              <el-button type="primary" @click="addStore">
                <div i-ep-plus mr="2" />
                添加货架
              </el-button>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="dialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSubmit">确定</el-button>
            </span>
          </template>
        </el-dialog>

        <el-dialog
          v-model="uploadDialogVisible"
          title="选择上传仓库"
          width="400px"
          destroy-on-close
        >
          <el-form ref="uploadFormRef" :model="uploadForm" :rules="uploadRules" label-width="100px">
            <el-form-item label="选择库房" prop="warehouseId">
              <el-select
                v-model="uploadForm.warehouseId"
                placeholder="请选择库房"
                :loading="warehouseLoading"
              >
                <el-option
                  v-for="item in warehouseList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="uploadForm.warehouseId">
              <el-upload
                ref="uploadRef"
                :show-file-list="true"
                :file-list="fileList"
                :auto-upload="false"
                accept=".xls,.xlsx"
                :limit="1"
                :multiple="false"
                :on-exceed="handleExceed"
                :on-change="handleFileChange"
              >
                <template #trigger>
                  <el-button type="primary">选择文件</el-button>
                </template>
              </el-upload>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="uploadDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleManualUpload">确定</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  ElMessage,
  ElMessageBox,
  type UploadInstance,
  type UploadFile,
  type UploadRawFile,
  genFileId,
} from 'element-plus'
import {
  getMaterialList,
  updateMaterial,
  deleteMaterial,
  getMaterialDemo,
  importMaterial,
} from '@/api/material'
import { getShelfList } from '@/api/shelf'
import { getWarehouseList } from '@/api/warehouseManagement'
import type { Warehouse } from '@/types/warehouse'
import type { Material } from '@/types/material'

const tableData = ref<Material[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref()

const queryForm = ref({
  materialName: '',
  materialCode: '',
  warehouseName: '',
})

const defaultForm = {
  id: 0,
  materialName: '',
  materialCode: '',
  categoryName: '',
  materialCount: 0,
  supplier: '',
  unit: '',
  productionDate: '',
  warehouseId: 0,
  warehouseName: '',
  store: [],
}

const form = ref<Material>(defaultForm)

const rules = {
  materialName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
  materialCode: [{ required: true, message: '请输入资产编号', trigger: 'blur' }],

  categoryName: [{ required: true, message: '请输入资产分类', trigger: 'blur' }],
  supplier: [{ required: true, message: '请输入供应商', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入计量单位', trigger: 'blur' }],
  productionDate: [{ required: true, message: '请选择生产日期', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择库房', trigger: 'change' }],
}

const fetchData = async () => {
  const params = {
    page: currentPage.value,
    pageSize: pageSize.value,
    ...queryForm.value,
  }
  const res = await getMaterialList(params)
  // 处理表格数据
  tableData.value = res.data.list
  total.value = res.data.total
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

const handleEdit = async (row: Material) => {
  handleWarehouseClick()
  form.value = { ...row }
  dialogVisible.value = true

  if (row.warehouseId) {
    shelfLoading.value = true
    try {
      const res = await getShelfList({ warehouseId: row.warehouseId })
      shelfList.value = res.data.list || []
    } catch (error) {
      console.error(error)
    } finally {
      shelfLoading.value = false
    }
  }
}

const handleDelete = (row: Material) => {
  ElMessageBox.confirm('确认删除该物资吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteMaterial(row.id)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      await updateMaterial(form.value)
      ElMessage.success('更新成功')
      dialogVisible.value = false
      fetchData()
    }
  })
}

const handleQuery = () => {
  currentPage.value = 1
  fetchData()
}

const warehouseList = ref<Warehouse[]>([])
const warehouseLoading = ref(false)

const handleWarehouseClick = async () => {
  if (warehouseLoading.value) return
  warehouseLoading.value = true
  const res = await getWarehouseList({})
  warehouseList.value = res.data.list || []
  warehouseLoading.value = false
}

const resetQuery = () => {
  queryForm.value = {
    materialName: '',
    materialCode: '',
    warehouseName: '',
  }
  handleQuery()
}

onMounted(() => {
  fetchData()
})

// Define the Shelf interface to fix type errors
interface Shelf {
  id: number
  shelfName: string
  code: string
}

const shelfList = ref<Shelf[]>([])
const shelfLoading = ref(false)

// Define the store item interface to fix type errors
interface StoreItem {
  id: number | null
  code: string
  count: number | null
}

// 计算已选择的货架ID列表
const selectedShelfIds = computed(() => {
  return form.value.store
    .map((item: StoreItem) => item.id)
    .filter((id: number | null) => id !== null)
})

// 获取带禁用状态的货架列表
const getDisabledShelfList = (currentIndex: number) => {
  return shelfList.value.map((shelf) => ({
    ...shelf,
    disabled:
      selectedShelfIds.value.includes(shelf.id) && form.value.store[currentIndex].id !== shelf.id,
  }))
}

const handleWarehouseChange = async (warehouseId: number) => {
  if (!warehouseId) {
    shelfList.value = []
    return
  }
  shelfLoading.value = true
  try {
    const res = await getShelfList({ warehouseId })
    shelfList.value = res.data.list || []
    form.value.store = [
      {
        code: '',
        count: null,
        id: null,
      },
    ]
  } catch (error) {
    console.error(error)
  } finally {
    shelfLoading.value = false
  }
}

const addStore = () => {
  form.value.store.push({
    code: '',
    count: null,
    id: null,
  })
}

const removeStore = (index: number) => {
  form.value.store.splice(index, 1)
}

const uploadDialogVisible = ref(false)
const uploadFormRef = ref()
const uploadForm = ref({
  warehouseId: undefined as number | undefined,
})
const uploadRules = {
  warehouseId: [{ required: true, message: '请选择库房', trigger: 'change' }],
}

const uploadRef = ref<UploadInstance | null>(null)
const selectedFile = ref<File | null>(null)
const fileList = ref<UploadFile[]>([])

const showUploadDialog = async () => {
  if (warehouseList.value.length === 0) {
    await handleWarehouseClick()
  }
  uploadForm.value.warehouseId = undefined
  selectedFile.value = null
  fileList.value = []
  uploadDialogVisible.value = true
}

const handleFileChange = (uploadFile: UploadFile) => {
  if (uploadFile && uploadFile.raw) {
    selectedFile.value = uploadFile.raw as File
    fileList.value = [uploadFile]
  }
}

const handleExceed = (files: File[]) => {
  uploadRef.value!.clearFiles()
  fileList.value = []

  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)

  if (file) {
    selectedFile.value = file
  }
}

const handleManualUpload = async () => {
  if (!uploadForm.value.warehouseId) {
    ElMessage.error('请选择库房')
    return
  }

  if (!selectedFile.value) {
    ElMessage.error('请选择文件')
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('warehouseId', uploadForm.value.warehouseId.toString())

  try {
    await importMaterial(formData)
    ElMessage.success('导入成功')
    uploadDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
    ElMessage.error('上传失败')
  }
}

const handleExport = async () => {
  try {
    const res = await getMaterialDemo()
    const downloadUrl = res.data
    const link = document.createElement('a')
    link.href = downloadUrl
    link.click()
  } catch (error) {
    console.error(error)
    ElMessage.error('下载失败')
  }
}
</script>
