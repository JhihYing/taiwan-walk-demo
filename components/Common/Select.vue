<script setup lang="ts">
interface SelectOption {
  label: string;
  value: string;
}
// 範例：{ value: "探索景點", label: t("nav.spots") }

const props = defineProps<{
  options: readonly SelectOption[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// 範例
// <CommonSelect v-model="selectedTheme" :options="themes" />
</script>

<template>
  <select
    :value="modelValue"
    @change="
      emit('update:modelValue', ($event.target as HTMLSelectElement).value)
    "
    class="common-select relative flex h-[50px] w-full cursor-pointer appearance-none items-center justify-between rounded-[6px] border border-[#E5E5E5] bg-white px-[20px] font-medium tracking-[0.5px] text-primary"
  >
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<style scoped>
select:focus-visible {
  outline: none;
}
.common-select {
  background-image: url(@/assets/images/icons/arrow-down-icon.svg);
  background-repeat: no-repeat;
  background-position: right 20px center;
  background-size: 16px;
}
</style>
