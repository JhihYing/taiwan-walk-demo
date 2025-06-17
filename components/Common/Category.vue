<script setup lang="ts">
interface ICategoryItem {
  id: number;
  title: string;
  link: string;
  image: string;
}
const props = defineProps<{
  categoryData: Readonly<ICategoryItem>;
}>();

// 範例：
// <CommonCategory :categoryData="item" />
// <CommonCategory :categoryData="{ id: 1, title: '熱門活動', image: '', link: '' }" />
</script>

<template>
  <NuxtLink
    :to="categoryData.link"
    class="relative inline-block h-[100px] w-full sm:h-[125px]"
  >
    <div class="bg-dark"></div>

    <img
      :src="categoryData.image"
      :alt="categoryData.title"
      class="extra-light-blur h-full w-full object-cover object-center"
    />

    <p
      class="absolute left-[0] top-[0] z-[2] flex h-full w-full items-center justify-center px-[10px] text-center text-[18px] font-extrabold text-white shadow-md sm:text-[22px]"
    >
      {{ categoryData.title }}
    </p>
  </NuxtLink>
</template>

<style scoped>
.bg-dark {
  height: 100%;
  min-width: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
  opacity: 0.3;
  background: rgba(26, 26, 26, 0.7);
  z-index: 1;
  border-radius: 10px;
}
/* .extra-light-blur {
  filter: blur(0.8px);
} */
</style>
