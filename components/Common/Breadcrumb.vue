<script setup lang="ts">
interface IBreadcrumbItem {
  label: string;
  to?: string;
}

const props = defineProps<{
  items: readonly IBreadcrumbItem[];
}>();

// 範例：
// <CommonBreadcrumb
//       :items="[{ label: t('nav.home'), to: '/' },{ label: "目前頁面" }]"
// />
</script>

<template>
  <ul
    class="breadcrumb flex flex-wrap items-center gap-x-[6px] gap-y-[4px] text-[14px] md:text-[16px]"
  >
    <li v-for="item in items" :key="item.label">
      <NuxtLink v-if="item.to" :to="item.to">{{ item.label }}</NuxtLink>
      <span v-else>{{ item.label }}</span>
    </li>
  </ul>
</template>

<style scoped>
.breadcrumb > li {
  color: #7f977b;
}
.breadcrumb > li:last-child {
  color: #525252;
}
.breadcrumb > li > a::after {
  content: "/";
  margin: 0 2px 0 4px;
  color: #525252;
}
.breadcrumb > li:last-child > a::after {
  display: none;
}
</style>
