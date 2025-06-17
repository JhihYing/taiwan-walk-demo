<script setup lang="ts"></script>

<template>
  <div class="relative flex min-h-screen flex-col tracking-[1px]">
    <Header />
    <div
      class="flex-1 px-[20px] sm:px-[25px] md:px-[30px] lg:px-[35px] 2xl:px-[45px]"
    >
      <div class="m-auto max-w-[1100px]">
        <slot />
      </div>
    </div>
    <Footer class="mt-[60px] md:mt-[120px]" />
  </div>
</template>

<style scoped></style>
