<!-- 分頁 -->
<!-- Vue 3 Pagination 套件：https://github.com/HENNGE/vue3-pagination -->
<script setup lang="ts">
import VPagination from "@hennge/vue3-pagination";
import "@hennge/vue3-pagination/dist/vue3-pagination.css";

const props = defineProps<{
  modelValue: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

function updateHandler(newPage: number) {
  emit("update:modelValue", newPage);
}

// 範例
// <CommonPagination v-model="currentPage" :totalPages="totalPages" />
</script>

<template>
  <v-pagination
    :model-value="modelValue"
    :pages="totalPages"
    :range-size="1"
    active-color="transparent"
    @update:modelValue="updateHandler"
  />
</template>

<style>
.Pagination {
  justify-content: center;
}
button.Page {
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  padding: 0 5px 0 5px;
}
button.Page.Page-active {
  border: 1.5px solid #7f977b;
  border-color: #7f977b;
  color: #7f977b;
}
</style>
