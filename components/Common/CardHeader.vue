<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="mb-[18px] flex items-center justify-between">
    <div>
      <h2 class="relative text-[24px] font-medium sm:text-[28px]">
        <slot />
      </h2>
    </div>

    <slot name="more">
      <CommonMore>{{ t("common.more") }}</CommonMore>
    </slot>
  </div>
</template>

<style scoped></style>
