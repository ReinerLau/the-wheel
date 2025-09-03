<template>
  <el-tabs v-model="activeTab" type="card" tab-position="left">
    <el-tab-pane label="生理体征" name="physiological">
      <PhysiologicalSettings />
    </el-tab-pane>
    <el-tab-pane label="警报" name="alarm">
      <AlarmSettings />
    </el-tab-pane>
    <el-tab-pane label="用药" name="medication">
      <MedicationSettings />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PhysiologicalSettings from './components/PhysiologicalSettings.vue'
import AlarmSettings from './components/AlarmSettings.vue'
import MedicationSettings from './components/MedicationSettings.vue'

const activeTab = ref('physiological')
</script>

<style scoped lang="scss">
:deep(.el-tab-pane) {
  @apply h-full;
}
</style>
