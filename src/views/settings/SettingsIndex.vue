<template>
  <div>
    <el-tabs v-model="activeTab" type="card" tab-position="left">
      <el-tab-pane label="生理体征" name="physiological">
        <PhysiologicalSettings />
      </el-tab-pane>
      <el-tab-pane label="警报" name="alarm">
        <AlarmSettings />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PhysiologicalSettings from './components/PhysiologicalSettings.vue'
import AlarmSettings from './components/AlarmSettings.vue'

const activeTab = ref('physiological')
</script>
