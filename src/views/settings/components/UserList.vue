<template>
  <div flex="~ col">
    <div>
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="用户名">
          <el-input v-model="queryForm.keyword" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex justify-end">
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </div>

    <el-table class="flex-1" :data="tableData" border style="width: 100%">
      <el-table-column prop="nickName" label="用户名称" />
      <el-table-column prop="username" label="账号" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          <el-button link type="success" @click="handleAssignRole(row)">绑定角色</el-button>
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
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="用户名称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" title="分配角色">
      <el-tree
        ref="treeRef"
        v-loading="drawerLoading"
        :data="roleData"
        :props="roleProps"
        show-checkbox
        :default-expand-all="true"
        :check-on-click-node="true"
        node-key="id"
      />
      <template #footer>
        <div class="flex justify-end">
          <el-button @click="handleCancelAssignRole">取消</el-button>
          <el-button type="primary" @click="handleConfirmAssignRole">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import TreeStore from 'element-plus/es/components/tree/src/model/tree-store'
import { onMounted, ref } from 'vue'
import { fetchList as fetchRoleList } from '../../../api/role.js'
import {
  assignRole,
  createUser,
  deleteUser,
  fetchList,
  getRolesByUser,
  updateUser
} from '../../../api/user.js'

/**
 * 用户行数据接口
 */
interface UserRow {
  id: string
  username: string
  nickName: string
  companyId?: string
  email?: string
  password?: string
  note?: string
}

/**
 * 角色数据接口
 */
interface RoleItem {
  id: string
  name: string
}

const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

const queryForm = ref({
  keyword: '',
  page: 1,
  limit: 10
})

const defaultForm: UserRow = {
  id: '',
  username: '',
  nickName: '',
  companyId: '',
  email: '',
  password: '',
  note: ''
}

const form = ref<UserRow>({ ...defaultForm })

const formRules = {
  username: [{ required: true, message: '请输入账号' }],
  password: [{ required: true, message: '请输入密码' }],
  companyId: [{ required: true, message: '请绑定车站' }]
}

const drawerVisible = ref(false)
const roleProps = {
  label: 'name'
}
const drawerLoading = ref(false)
const roleData = ref([])
const treeRef = ref<TreeStore>()
const userId = ref()

/**
 * 获取用户列表数据
 */
const getList = async () => {
  const params = {
    page: currentPage.value,
    limit: pageSize.value,
    keyword: queryForm.value.keyword
  }

  try {
    const res = await fetchList(params)
    tableData.value = res.data.list
    total.value = res.data.total
  } catch {
    ElMessage.error('获取用户列表失败')
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
    keyword: '',
    page: 1,
    limit: 10
  }
  currentPage.value = 1
  getList()
}

/**
 * 处理新增用户
 */
const handleAdd = () => {
  form.value = { ...defaultForm }
  dialogType.value = 'add'
  dialogVisible.value = true
}

/**
 * 处理编辑用户
 */
const handleEdit = (row: UserRow) => {
  form.value = { ...row, password: '' }
  dialogType.value = 'edit'
  dialogVisible.value = true
}

/**
 * 处理删除用户
 */
const handleDelete = (row: UserRow) => {
  if (!row.id) return

  ElMessageBox.confirm('确认删除该用户吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteUser(row.id)
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
        await createUser(form.value)
        ElMessage.success('添加成功')
      } else {
        await updateUser(form.value)
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
 * 处理分配角色
 */
async function handleAssignRole(row: UserRow) {
  userId.value = row.id
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    let res = await fetchRoleList({ limit: 999999 })
    roleData.value = res.data.list
    res = await getRolesByUser(row.id)
    if (treeRef.value) {
      treeRef.value.setCheckedKeys(
        res.data.map((item: RoleItem) => item.id),
        true
      )
    }
  } catch {
    ElMessage.error('获取角色数据失败')
  } finally {
    drawerLoading.value = false
  }
}

/**
 * 确认分配角色
 */
async function handleConfirmAssignRole() {
  drawerLoading.value = true
  try {
    if (!treeRef.value) return

    const data = {
      adminId: userId.value,
      roleIds: treeRef.value.getCheckedKeys().join(',')
    }
    if (!data.roleIds) {
      ElMessage({ type: 'error', message: '请选择角色' })
      return
    }
    await assignRole(data)
    ElMessage({ type: 'success', message: '操作成功' })
    drawerVisible.value = false
  } catch {
    ElMessage.error('绑定角色失败')
  } finally {
    drawerLoading.value = false
  }
}

/**
 * 取消分配角色
 */
function handleCancelAssignRole() {
  drawerVisible.value = false
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
