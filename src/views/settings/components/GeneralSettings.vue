<template>
  <el-scrollbar class="h-full">
    <div class="general-settings-container">
      <el-card>
        <!-- 未登录状态 - 显示登录按钮 -->
        <div v-if="!userStore.token">
          <SettingItem title="登录" description="登录以使用更多功能">
            <el-button type="primary" @click="showLoginDialog"> 登录 </el-button>
          </SettingItem>
        </div>

        <!-- 已登录状态 - 显示用户信息 -->
        <div v-else>
          <SettingItem title="用户名" description="当前登录的用户名">
            <span class="info-value">{{ userStore.name || '未获取' }}</span>
          </SettingItem>

          <!-- 分割线 -->
          <el-divider />

          <SettingItem title="角色" description="当前用户的角色信息">
            <span class="info-value">
              {{ userStore.roles.length > 0 ? userStore.roles.join(', ') : '未获取' }}
            </span>
          </SettingItem>
        </div>
      </el-card>

      <!-- 登出按钮放在card外部 -->
      <div v-if="userStore.token" class="logout-section">
        <el-button type="danger" :loading="logoutLoading" @click="handleLogout"> 登出 </el-button>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <el-dialog
      v-model="loginDialogVisible"
      title="用户登录"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            clearable
            @keydown.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
            @keydown.enter="handleLogin"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="loginDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="loginLoading" @click="handleLogin"> 登录 </el-button>
        </div>
      </template>
    </el-dialog>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { useUserStore } from '../../../store/user'
import { setCookie } from '../../../utils/cookie'
import SettingItem from '@/components/common/SettingItem.vue'

const userStore = useUserStore()

/**
 * 登录表单数据
 */
const loginForm = reactive({
  username: '',
  password: ''
})

/**
 * 登录表单验证规则
 */
const loginRules = {
  username: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
  password: [{ required: true, trigger: 'blur', message: '请输入密码' }]
}

const loginFormRef = ref<FormInstance>()
const loginLoading = ref(false)
const logoutLoading = ref(false)
const loginDialogVisible = ref(false)

/**
 * 显示登录弹窗
 */
function showLoginDialog() {
  loginDialogVisible.value = true
}

/**
 * 初始化表单数据
 */
onMounted(() => {
  // 如果已登录，获取用户信息
  if (userStore.token && !userStore.name) {
    getUserInfo()
  }
})

/**
 * 获取用户信息
 */
async function getUserInfo() {
  try {
    await userStore.getInfo()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

/**
 * 处理登录
 */
async function handleLogin() {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loginLoading.value = true

    await userStore.login(loginForm)
    await getUserInfo()

    // 保存用户名
    setCookie('username', loginForm.username, 15)

    ElMessage.success('登录成功')

    // 关闭弹窗并清空表单
    loginDialogVisible.value = false
    loginForm.username = ''
    loginForm.password = ''
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loginLoading.value = false
  }
}

/**
 * 处理登出
 */
async function handleLogout() {
  try {
    logoutLoading.value = true
    await userStore.logout()
    ElMessage.success('已退出登录')
  } catch (error) {
    console.error('登出失败:', error)
    ElMessage.error('登出失败')
  } finally {
    logoutLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.general-settings-container {
  @apply flex flex-col gap-4;
}

.info-value {
  @apply font-medium text-gray-900;
}

.logout-section {
  @apply flex justify-end;
}

.dialog-footer {
  @apply flex justify-end gap-2;
}
</style>
