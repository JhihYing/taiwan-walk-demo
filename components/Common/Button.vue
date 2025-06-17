<script setup lang="ts">
const { locale } = useI18n();

interface IButtonProps {
  disabled?: boolean;
  // 未來可擴充其他屬性，如：
  // icon?: string;
}
const props = withDefaults(defineProps<IButtonProps>(), {
  disabled: false,
});

// 範例：
// <CommonButton :disabled="true" />
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :class="[
      'search-btn flex h-[50px] w-full items-center justify-center rounded-[6px] font-medium text-white transition-colors duration-300',
      locale !== 'en-US' ? 'tracking-[20px]' : 'tracking-[2px]',
      disabled
        ? 'cursor-not-allowed bg-gray-300'
        : 'bg-primary hover:bg-[#65895F]',
    ]"
  >
    {{ $t("search.searchBtn") }}
  </button>
</template>

<style scoped>
.search-btn::before {
  content: "";
  width: 18px;
  height: 16px;
  background-image: url(@/assets/images/icons/search-icon.svg);
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  margin-right: 12px;
}
</style>
