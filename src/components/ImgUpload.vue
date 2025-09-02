<template>
  <div>
    <el-upload
      ref="uploadRef"
      :show-file-list="false"
      :limit="1"
      :auto-upload="true"
      action="/api/file/upload"
      :on-success="handleSuccess"
    >
      <template #trigger>
        <el-button type="primary">上传</el-button>
      </template>
    </el-upload>
    <el-image
      v-if="props.src"
      class="w-32 h-32 mt-5"
      :src="props.src"
      :preview-src-list="[props.src]"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ src?: string }>();
const emit = defineEmits(["update:src"]);

const uploadRef = ref(null);

function handleSuccess(res) {
  uploadRef.value.clearFiles();
  emit("update:src", res.message);
}
</script>
