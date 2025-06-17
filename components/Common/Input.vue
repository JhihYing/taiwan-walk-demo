<script setup lang="ts">
interface IInputProps {
  modelValue: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<IInputProps>(), {
  modelValue: "",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// 範例：
// <CommonInput v-model="keyword" placeholder="請輸入關鍵字"/>
</script>

<template>
  <input
    type="text"
    :value="modelValue"
    :placeholder="placeholder"
    @input="
      emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
    class="h-[50px] w-full rounded-[6px] border border-[#E5E5E5] bg-[#f8f8f8] px-[20px]"
  />
</template>

<style scoped>
input:focus-visible {
  outline: none;
}
</style>
