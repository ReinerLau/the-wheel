<template>
  <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
    <el-form-item label="药物名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入药物名称" maxlength="50" show-word-limit />
    </el-form-item>
    <el-form-item label="规格" prop="specification">
      <el-input
        v-model="form.specification"
        placeholder="例如：5mg/片"
        maxlength="30"
        show-word-limit
      />
    </el-form-item>
    <el-form-item label="用法" prop="usage">
      <el-input
        v-model="form.usage"
        type="textarea"
        :rows="3"
        placeholder="例如：饭后服用，每次1片"
        maxlength="100"
        show-word-limit
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Medication } from '@/types/settings'

/**
 * 组件属性
 */
interface Props {
  /** 药物数据，用于编辑模式 */
  medication?: Partial<Medication>
}

/**
 * 组件事件
 */
interface Emits {
  /** 表单数据变化时触发 */
  (e: 'update:form', form: Partial<Medication>): void
}

const props = withDefaults(defineProps<Props>(), {
  medication: () => ({})
})

const emit = defineEmits<Emits>()

/**
 * 表单引用
 */
const formRef = ref<FormInstance>()

/**
 * 表单数据
 */
const form = reactive<Partial<Medication>>({
  name: '',
  specification: '',
  usage: ''
})

/**
 * 表单验证规则
 */
const rules: FormRules = {
  name: [
    { required: true, message: '请输入药物名称', trigger: 'blur' },
    { min: 2, max: 50, message: '药物名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  specification: [
    { required: true, message: '请输入药物规格', trigger: 'blur' },
    { max: 30, message: '规格长度不能超过 30 个字符', trigger: 'blur' }
  ],
  usage: [
    { required: true, message: '请输入用法说明', trigger: 'blur' },
    { max: 100, message: '用法说明长度不能超过 100 个字符', trigger: 'blur' }
  ]
}

/**
 * 监听传入的药物数据变化
 */
watch(
  () => props.medication,
  (newMedication) => {
    Object.assign(form, {
      name: '',
      specification: '',
      usage: '',
      ...newMedication
    })
  },
  { immediate: true }
)

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
  return await formRef.value.validate().catch(() => false)
}

/**
 * 重置表单
 */
const resetFields = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    name: '',
    specification: '',
    usage: ''
  })
}

/**
 * 暴露给父组件的方法
 */
defineExpose({
  validate,
  resetFields
})
</script>
