<template>
  <div class="hover:bg-[#0000000d] cursor-pointer p-2">
    <el-dropdown class="h-full" trigger="click">
      <img src="../assets/images/logo.png" class="h-10" />
      <template #dropdown>
        <el-dropdown-menu>
          <!-- <router-link to="/">
            <el-dropdown-item>主页</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click="handleChangePassword">
            修改密码
          </el-dropdown-item> -->
          <el-dropdown-item divided @click="handleLogout"> 退出登录 </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dialog
      v-model="formVisible"
      title="修改密码"
      width="30%"
      :destroy-on-close="true"
      @close="handleClose"
    >
      <el-form ref="changePasswordForm" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="formData.oldPassword"
            placeholder="请输入旧密码"
            type="password"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="formData.newPassword"
            placeholder="请输入新密码"
            type="password"
            clearable
            show-password
          />
        </el-form-item>
        <el-form-item label="重复密码" prop="repeatPassword">
          <el-input
            v-model="formData.repeatPassword"
            placeholder="请再次输入密码"
            type="password"
            show-password
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleChangePassword"> 取消 </el-button>
        <el-button :loading="loading" type="primary" @click="handelConfirm"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { setPasswd } from '../api/user'
import { useUserStore } from '../store/user'

const { logout } = useUserStore()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/login')
}

const formVisible = ref(false)
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  repeatPassword: '',
})
const formRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 5, max: 64, message: '密码5-64位', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 64, message: '密码5-64位', trigger: 'blur' },
  ],
  repeatPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { min: 5, max: 64, message: '密码5-64位', trigger: 'blur' },
  ],
}
const changePasswordForm = ref(null)
const loading = ref(false)

function handleChangePassword() {
  formVisible.value = !formVisible.value
}

async function handelConfirm() {
  try {
    loading.value = true
    await changePasswordForm.value.validate()
    const { code, message } = (await setPasswd({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
      repeatPassword: formData.repeatPassword,
    })) as any
    formVisible.value = false
    if (code === 200) {
      ElMessage({
        type: 'success',
        message,
        duration: 3 * 1000,
      })
    }
  } finally {
    loading.value = false
  }
}

function handleClose() {
  formData.newPassword = ''
  formData.oldPassword = ''
  formData.repeatPassword = ''
}
</script>
