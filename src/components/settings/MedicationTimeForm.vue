<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="选择药物" prop="medicationId">
      <el-select v-model="form.medicationId" placeholder="请选择药物" class="w-full">
        <el-option
          v-for="medication in medications"
          :key="medication.id"
          :label="medication.name"
          :value="medication.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="用药方式" prop="type">
      <el-radio-group v-model="form.type">
        <el-radio value="once">单次用药</el-radio>
        <el-radio value="repeat">重复用药</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item :label="form.type === 'once' ? '用药时间' : '用药时间'" prop="datetime">
      <el-date-picker
        v-if="form.type === 'once'"
        v-model="form.datetime"
        type="datetime"
        placeholder="请选择用药日期和时间"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm:ss"
        class="w-full"
      />
      <el-time-picker
        v-else
        v-model="form.datetime"
        placeholder="请选择用药时间"
        format="HH:mm"
        value-format="HH:mm:ss"
        class="w-full"
      />
    </el-form-item>

    <!-- 重复配置 -->
    <template v-if="form.type === 'repeat'">
      <el-form-item label="重复频率" prop="repeatConfig.frequency">
        <el-select
          v-model="form.repeatConfig.frequency"
          placeholder="请选择重复频率"
          class="w-full"
        >
          <el-option label="每天" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
        </el-select>
      </el-form-item>

      <el-form-item label="重复间隔" prop="repeatConfig.interval">
        <el-input-number v-model="form.repeatConfig.interval" :min="1" :max="365" class="w-full" />
        <span class="ml-2 text-sm text-gray-500">
          {{
            form.repeatConfig.frequency === 'daily'
              ? '天'
              : form.repeatConfig.frequency === 'weekly'
                ? '周'
                : '月'
          }}
        </span>
      </el-form-item>

      <!-- 每周重复的星期几选择 -->
      <el-form-item v-if="form.repeatConfig.frequency === 'weekly'" label="重复星期">
        <el-checkbox-group v-model="form.repeatConfig.weekDays">
          <el-checkbox :value="1">周一</el-checkbox>
          <el-checkbox :value="2">周二</el-checkbox>
          <el-checkbox :value="3">周三</el-checkbox>
          <el-checkbox :value="4">周四</el-checkbox>
          <el-checkbox :value="5">周五</el-checkbox>
          <el-checkbox :value="6">周六</el-checkbox>
          <el-checkbox :value="0">周日</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <!-- 每月重复的日期选择 -->
      <el-form-item v-if="form.repeatConfig.frequency === 'monthly'" label="每月日期">
        <el-input-number v-model="form.repeatConfig.monthDay" :min="1" :max="31" class="w-32" />
        <span class="ml-2 text-sm text-gray-500">日</span>
      </el-form-item>

      <el-form-item label="结束日期">
        <el-date-picker
          v-model="form.repeatConfig.endDate"
          type="date"
          placeholder="请选择结束日期（可选）"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="w-full"
        />
      </el-form-item>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Medication, MedicationTime, MedicationType, RepeatFrequency } from '@/types/settings'

/**
 * 组件属性
 */
interface Props {
  /** 药物列表 */
  medications: Medication[]
}

/**
 * 组件事件
 */
interface Emits {
  /** 表单数据变化时触发 */
  (e: 'update:form', form: Partial<MedicationTime>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

/**
 * 表单引用
 */
const formRef = ref<FormInstance>()

/**
 * 表单数据
 */
const form = reactive({
  medicationId: '',
  type: 'once' as MedicationType,
  datetime: '',
  repeatConfig: {
    frequency: 'daily' as RepeatFrequency,
    interval: 1,
    endDate: '',
    weekDays: [] as number[],
    monthDay: 1
  }
})

/**
 * 表单验证规则
 */
const rules: FormRules = {
  medicationId: [{ required: true, message: '请选择药物', trigger: 'change' }],
  type: [{ required: true, message: '请选择用药方式', trigger: 'change' }],
  datetime: [{ required: true, message: '请选择用药时间', trigger: 'change' }],
  'repeatConfig.frequency': [{ required: true, message: '请选择重复频率', trigger: 'change' }],
  'repeatConfig.interval': [
    { required: true, message: '请输入重复间隔', trigger: 'blur' },
    { type: 'number', min: 1, max: 365, message: '重复间隔必须在1-365之间', trigger: 'blur' }
  ]
}

/**
 * 监听表单数据变化，向父组件发送更新事件
 */
watch(
  form,
  (newForm) => {
    emit('update:form', { ...newForm })
  },
  { deep: true }
)

/**
 * 验证表单
 */
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return false

  // 验证重复配置
  if (form.type === 'repeat') {
    if (form.repeatConfig.frequency === 'weekly' && form.repeatConfig.weekDays.length === 0) {
      ElMessage.error('请至少选择一个重复的星期')
      return false
    }
  }

  return true
}

/**
 * 重置表单
 */
const resetFields = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    medicationId: '',
    type: 'once' as MedicationType,
    datetime: '',
    repeatConfig: {
      frequency: 'daily' as RepeatFrequency,
      interval: 1,
      endDate: '',
      weekDays: [] as number[],
      monthDay: 1
    }
  })
}

/**
 * 暴露给父组件的方法和数据
 */
defineExpose({
  validate,
  resetFields,
  form
})
</script>
