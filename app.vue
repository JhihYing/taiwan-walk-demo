<script setup lang="ts">
useHead({
  title: "台灣走走",
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "favicon.ico", // 正式機
      // href: "/favicon.ico", // 本機
    },
  ],
});
</script>

<template>
  <div class="text-main">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
