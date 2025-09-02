<template>
  <div class="p-4 h-full">
    <el-card class="mb-4 h-full overflow-y-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">地图列表</h2>
          <el-button type="primary" @click="handleAdd">新增地图</el-button>
        </div>
      </template>

      <div>
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="地图名称">
            <el-input v-model="queryForm.name" placeholder="请输入地图名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table class="flex-1" :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="地图名称" />
        <el-table-column label="地图预览" width="200">
          <template #default="{ row }">
            <el-image
              :src="row.path"
              fit="contain"
              :preview-src-list="[row.path]"
              :initial-index="0"
              preview-teleported
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增地图' : '编辑地图'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="地图名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入地图名称" />
        </el-form-item>
        <el-form-item label="地图文件" prop="file">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeMapUpload"
            :http-request="customUpload"
            accept="image/jpeg,image/jpg,image/png"
          >
            <img v-if="form.path" :src="form.path" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { fetchList, uploadMap, createMap, updateMap, deleteMap } from '@/api/map'
import type { Map, MapListParams } from '@/types/map'
import type { FormInstance, UploadRequestOptions } from 'element-plus'

const tableData = ref<Map[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const uploadLoading = ref(false)

const queryForm = ref<MapListParams>({
  name: '',
  page: 1,
  limit: 10,
})

const defaultForm: Map = {
  name: '',
  path: '',
}

const form = ref<Map>({ ...defaultForm })

const rules = {
  name: [{ required: true, message: '请输入地图名称', trigger: 'blur' }],
  path: [{ required: true, message: '请上传地图文件', trigger: 'change' }],
}

/**
 * 获取地图列表数据
 */
const fetchData = async () => {
  const params: MapListParams = {
    page: currentPage.value,
    limit: pageSize.value,
    name: queryForm.value.name,
  }
  try {
    const res = await fetchList(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取地图列表失败')
  }
}

/**
 * 处理每页显示数量变化
 */
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

/**
 * 处理页码变化
 */
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

/**
 * 处理查询操作
 */
const handleQuery = () => {
  currentPage.value = 1
  fetchData()
}

/**
 * 重置查询表单
 */
const resetQuery = () => {
  queryForm.value = {
    name: '',
    page: 1,
    limit: 10,
  }
  currentPage.value = 1
  fetchData()
}

/**
 * 处理新增地图
 */
const handleAdd = () => {
  form.value = { ...defaultForm }
  dialogType.value = 'add'
  dialogVisible.value = true
}

/**
 * 处理编辑地图
 */
const handleEdit = (row: Map) => {
  form.value = { ...row }
  dialogType.value = 'edit'
  dialogVisible.value = true
}

/**
 * 处理删除地图
 */
const handleDelete = (row: Map) => {
  if (!row.id) return

  ElMessageBox.confirm('确认删除该地图吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await deleteMap(row.id!)
        ElMessage.success('删除成功')
        fetchData()
      } catch {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

/**
 * 地图上传前的校验
 */
const beforeMapUpload = (file: File) => {
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)

  if (!isImage) {
    ElMessage.error('只能上传JPG/PNG格式的图片!')
  }

  return isImage
}

/**
 * 自定义上传请求
 */
const customUpload = async (options: UploadRequestOptions) => {
  const { file } = options
  if (!file) return

  uploadLoading.value = true
  try {
    const res = await uploadMap(file as File)
    form.value.path = res.data.fileUrl
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploadLoading.value = false
  }
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (dialogType.value === 'add') {
        await createMap({
          name: form.value.name,
          path: form.value.path,
        })
        ElMessage.success('添加成功')
      } else {
        if (!form.value.id) return

        await updateMap({
          id: form.value.id,
          name: form.value.name,
          path: form.value.path,
        })
        ElMessage.success('更新成功')
      }

      dialogVisible.value = false
      fetchData()
    } catch {
      ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
:deep(.avatar-uploader) {
  @apply border border-dashed border-gray-300 rounded-md cursor-pointer overflow-hidden w-40 h-40 flex justify-center items-center;

  &:hover {
    @apply border-[var(--el-color-primary)];
  }

  .el-upload {
    @apply w-full h-full;
  }

  .avatar-uploader-icon {
    @apply text-3xl text-gray-400;
  }
}
</style>
