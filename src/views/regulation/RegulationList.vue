<template>
  <div class="p-4 h-full">
    <el-card class="mb-4 h-full overflow-y-auto">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">规章管理</h2>
          <el-button type="primary" @click="handleAdd">新增规章</el-button>
        </div>
      </template>

      <div>
        <el-form :inline="true" :model="queryForm">
          <el-form-item label="规章名称">
            <el-input v-model="queryForm.name" placeholder="请输入规章名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table class="flex-1" :data="tableData" border style="width: 100%">
        <el-table-column prop="fileName" label="文件名称" />
        <el-table-column prop="context" label="内容" />
        <el-table-column label="操作" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">阅览</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增规章" width="500px" destroy-on-close>
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        :headers="{ Authorization: getToken() }"
        :limit="1"
        :action="url"
        :auto-upload="false"
        @success="handleSuccess"
        :before-upload="beforeAvatarUpload"
        accept=".txt"
      >
        <template #trigger>
          <el-button type="primary">选择文件</el-button>
        </template>

        <template #tip>
          <div class="el-upload__tip">请上传txt格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUpload">上传</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 规章内容查看对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      :title="currentRegulationTitle"
      width="80%"
      destroy-on-close
    >
      <div class="whitespace-pre-wrap break-all p-4 max-h-[60vh] overflow-y-auto">
        {{ regulationContent }}
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getToken } from '@/utils/auth'
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type UploadInstance } from 'element-plus'
import {
  deleteRegulation,
  type Regulation,
  searchRegulationList,
  readRegulation,
} from '@/api/regulation'

const uploadRef = ref<UploadInstance | null>(null)
const url = `http://${window.location.host}/api/pdf-rules/v1/upload`
const submitUpload = () => {
  if (uploadRef.value) {
    uploadRef.value.submit()
  }
}

const fileData = ref()
const handleSuccess = (response) => {
  fileData.value = response.data
  dialogVisible.value = false
  fetchData()
}

const beforeAvatarUpload = (rawFile: any) => {
  const fileExtension = rawFile.name.split('.').pop().toLowerCase()
  if (fileExtension !== 'txt') {
    ElMessage({ type: 'error', message: '请上传txt格式文件！' })
    return false
  }
  return true
}
const tableData = ref<Regulation[]>([])
const dialogVisible = ref(false)

// 添加查看规章相关变量
const viewDialogVisible = ref(false)
const regulationContent = ref('')
const currentRegulationTitle = ref('')

const queryForm = ref({
  name: '',
})

const fetchData = async () => {
  const params = { keyword: '' }
  const res = await searchRegulationList(params)
  tableData.value = res.data || []
}

const handleAdd = () => {
  dialogVisible.value = true
}

const handleDelete = (row: Regulation) => {
  ElMessageBox.confirm('确认删除该规章吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteRegulation({ objectName: row.fileName })
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

const handleQuery = async () => {
  const res = await searchRegulationList({ keyword: queryForm.value.name })
  tableData.value = res.data || []
}

const resetQuery = () => {
  queryForm.value = {
    name: '',
  }
  handleQuery()
}

const handleView = async (row: Regulation) => {
  currentRegulationTitle.value = row.fileName
  viewDialogVisible.value = true
  try {
    const res = await readRegulation({ objectName: row.fileName })
    regulationContent.value = res.data
  } catch {
    ElMessage.error('获取文件内容失败')
    regulationContent.value = '文件内容加载失败'
  }
}

onMounted(() => {
  fetchData()
})
</script>
