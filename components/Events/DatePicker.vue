<script setup lang="ts">
const { t } = useI18n();
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

// 範例：
// <EventsDatePicker v-model="selectedDate" />
</script>
<template>
  <div class="l-search-item smallItem datepicker">
    <p class="dateChange">{{ modelValue || t("common.selectDate") }}</p>
    <input
      class="month-check"
      type="date"
      :value="modelValue"
      @input="
        (e) => emit('update:modelValue', (e.target as HTMLInputElement).value)
      "
    />
  </div>
</template>

<style scoped>
.l-search-item {
  border-radius: 5px;
  height: 50px;
  border: none;
  border: 1px solid #e5e5e5;
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}
.l-search-item p {
  color: #7f977b;
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 0.5px;
}
.l-search-date {
  position: absolute;
  z-index: 1;
  width: 100%;
  height: 100%;
  left: 0;
  cursor: pointer;
  opacity: 0;
}
.datepicker::after {
  content: "";
  background-image: url("@/assets/images/icons/datepicker-icon.svg");
  background-repeat: no-repeat;
  background-size: contain;
  width: 20px;
  height: 20px;
  position: absolute;
  right: 23px;
  top: 15px;
}

.month-check {
  position: absolute;
  width: calc(100% - 40px);
  opacity: 0;
  z-index: 1;
}
.month-check::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 0;
  padding-left: 100%;
}
</style>
