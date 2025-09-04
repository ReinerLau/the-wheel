<template>
  <div flex="~ col">
    <div>
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="角色名称">
          <el-input v-model="queryForm.name" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex justify-end">
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>

    <el-table class="flex-1" :data="tableData" border style="width: 100%">
      <el-table-column prop="name" label="角色名称" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button link type="success" @click="handleAssignMenu(row)">绑定权限</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" title="绑定权限">
      <el-tree
        ref="treeRef"
        v-loading="loading"
        :data="[...PERMISSIONS]"
        :props="menuProps"
        show-checkbox
        :default-expand-all="true"
        node-key="id"
        :check-strictly="true"
      >
      </el-tree>
      <template #footer>
        <div class="flex justify-end">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmAssignMenu">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { createRole, deleteRole, fetchList, getOneRole, updateRole } from '@/api/role'
import { PERMISSIONS } from '@/constants/permissions'

interface RoleItem {
  id?: string
  name: string
}

const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const drawerVisible = ref(false)
const loading = ref(false)
const treeRef = ref()
let roleId = ''

const queryForm = ref({
  name: '',
  page: 1,
  limit: 10
})

const defaultForm = {
  name: ''
}

const form = ref({ ...defaultForm })

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

const menuProps = {
  label: 'name',
  children: 'children'
}

/**
 * 获取角色列表数据
 */
const getList = async () => {
  const params = {
    page: currentPage.value,
    limit: pageSize.value,
    name: queryForm.value.name
  }

  try {
    const res = await fetchList(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取角色列表失败')
  }
}

/**
 * 处理每页显示数量变化
 */
const handleSizeChange = (val: number) => {
  pageSize.value = val
  getList()
}

/**
 * 处理页码变化
 */
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  getList()
}

/**
 * 处理查询操作
 */
const handleQuery = () => {
  currentPage.value = 1
  getList()
}

/**
 * 重置查询表单
 */
const resetQuery = () => {
  queryForm.value = {
    name: '',
    page: 1,
    limit: 10
  }
  currentPage.value = 1
  getList()
}

/**
 * 处理新增角色
 */
const handleAdd = () => {
  form.value = { ...defaultForm }
  dialogType.value = 'add'
  dialogVisible.value = true
}

/**
 * 处理编辑角色
 */
const handleEdit = (row: RoleItem) => {
  form.value = { ...row }
  dialogType.value = 'edit'
  dialogVisible.value = true
}

/**
 * 处理删除角色
 */
const handleDelete = (row: RoleItem) => {
  if (!row.id) return

  ElMessageBox.confirm('确认删除该角色吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteRole(row.id)
        ElMessage.success('删除成功')
        getList()
      } catch {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
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
        await createRole(form.value)
        ElMessage.success('添加成功')
      } else {
        await updateRole(form.value)
        ElMessage.success('更新成功')
      }

      dialogVisible.value = false
      getList()
    } catch {
      ElMessage.error(dialogType.value === 'add' ? '添加失败' : '更新失败')
    }
  })
}

/**
 * 处理绑定权限
 */
const handleAssignMenu = async (row: RoleItem) => {
  if (!row.id) return

  roleId = row.id
  drawerVisible.value = true
  loading.value = true

  try {
    const res = await getOneRole(row.id)
    const keys = res.data.menuList ? res.data.menuList.split(',') : []
    treeRef.value?.setCheckedKeys(keys)
  } catch {
    ElMessage.error('获取权限数据失败')
  } finally {
    loading.value = false
  }
}

/**
 * 确认绑定权限
 */
const handleConfirmAssignMenu = async () => {
  if (!treeRef.value) return

  loading.value = true

  try {
    await updateRole({
      id: roleId,
      menuList: treeRef.value.getCheckedKeys().join(',')
    })

    ElMessage.success('绑定权限成功')
    drawerVisible.value = false
  } catch {
    ElMessage.error('绑定权限失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})

// 暴露给父组件的方法
defineExpose({
  getList
})
</script>

<style lang="scss" scoped>
:deep(.el-form-item__content) {
  @apply w-64;
}

:deep(.el-drawer__body) {
  @apply p-6;
}
</style>
