<template>
  <div class="bg-[#2d3a4b] h-full flex justify-center flex-col items-center">
    <div class="text-white text-2xl font-bold mb-5">欢迎登录</div>
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      class="w-2/3 max-w-96"
      auto-complete="on"
      label-position="left"
    >
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
          @keydown.enter="loginForm.keydown"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          :type="passwordType"
          placeholder="密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keydown.enter="loginForm.keydown"
        />
      </el-form-item>

      <el-checkbox
        v-model="ifRememberPassword"
        class="text-white block"
        label="记住密码"
        @change="handleRememberPassword"
      ></el-checkbox>

      <el-button class="w-full" :loading="loading" type="primary" @click.prevent="handleLogin">
        登录
      </el-button>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRememberPassword } from '../composables/useRememberPassword'
import { useUserStore } from '../store/user'
import { getCookie, setCookie } from '../utils/cookie'
const { ifRememberPassword, handleRememberPassword, getRememberPassword } = useRememberPassword()

const loginForm = reactive({
  username: '',
  password: '',
  keydown: (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin()
    }
  },
})
const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '用户名不能为空' }],
  password: [{ required: true, trigger: 'blur', message: '密码不能为空' }],
}

const passwordType = ref('password')

loginForm.username = getCookie('username') || ''
loginForm.password = getRememberPassword()

const loading = ref(false)
const loginFormRef = ref(null)
const userStore = useUserStore()
const router = useRouter()
function handleLogin() {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const { login } = userStore
      try {
        await login(loginForm)
        loading.value = false
        setCookie('username', loginForm.username, 15)
        if (ifRememberPassword.value) {
          setCookie('password', loginForm.password, 15)
        }
        router.push('/')
      } catch {
        loading.value = false
      }
    } else {
      return false
    }
  })
}
</script>
