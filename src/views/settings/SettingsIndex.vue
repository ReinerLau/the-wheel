<template>
  <el-tabs v-model="activeTab" type="card" tab-position="left">
    <el-tab-pane label="通用" name="general">
      <GeneralSettings />
    </el-tab-pane>
    <el-tab-pane
      v-if="hasPermission(PermissionId.PHYSIOLOGICAL_SETTINGS)"
      label="生理体征"
      name="physiological"
    >
      <PhysiologicalSettings />
    </el-tab-pane>
    <el-tab-pane v-if="hasPermission(PermissionId.ALARM_SETTINGS)" label="警报" name="alarm">
      <AlarmSettings />
    </el-tab-pane>
    <el-tab-pane
      v-if="hasPermission(PermissionId.MEDICATION_SETTINGS)"
      label="用药"
      name="medication"
    >
      <MedicationSettings />
    </el-tab-pane>
    <el-tab-pane
      v-if="hasPermission(PermissionId.AUTHORITY_SETTINGS)"
      label="权限"
      name="authority"
    >
      <AuthoritySettings />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GeneralSettings from './components/GeneralSettings.vue'
import PhysiologicalSettings from './components/PhysiologicalSettings.vue'
import AlarmSettings from './components/AlarmSettings.vue'
import MedicationSettings from './components/MedicationSettings.vue'
import AuthoritySettings from './components/AuthoritySettings.vue'
import { PermissionId } from '@/constants/permissions'
import { hasPermission } from '@/permission'

const activeTab = ref('general')
</script>

<style scoped lang="scss">
:deep(.el-tab-pane) {
  @apply h-full;
}
</style>
