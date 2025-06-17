<script setup lang="ts">
interface IMoreProps {
  to?: string;
}
const props = withDefaults(defineProps<IMoreProps>(), {
  to: "/",
});

// 範例：
// <CommonMore to="/spots/search">查看更多</CommonMore>
</script>

<template>
  <NuxtLink :to="to" class="view-more-btn group flex items-center text-[15px]">
    <span
      class="translate-x-[10px] font-medium duration-300 group-hover:text-primary"
      ><slot />
    </span>
    <img
      src="@/assets/images/icons/more-arrow-icon.png"
      alt="arrow"
      class="relative z-[5] translate-x-[20px] transition duration-[600ms]"
    />

    <i
      class="circle-deco relative z-[4] h-[40px] w-[40px]"
      aria-hidden="true"
    ></i>
  </NuxtLink>
</template>

<style scoped>
.circle-deco::before {
  content: "";
  width: 30px;
  height: 30px;
  display: block;
  border-radius: 99em;
  background: #e8f1e6;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 5;
  transform: translate(-50%, -50%) scale(0.6);
  transform-origin: center center;
  opacity: 0;
  transition: 0.4s;
}
.circle-deco::after {
  content: "";
  width: 40px;
  height: 40px;
  display: block;
  border-radius: 99em;
  border: 1px solid #e5e7eb;
  position: relative;
  z-index: 5;
}
.view-more-btn:hover i::before {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.view-more-btn:hover img {
  animation: arrow-nudge 0.5s linear infinite forwards;
}

/* 動畫 */
@keyframes arrow-nudge {
  0% {
    transform: translate(20px, 0);
  }

  50% {
    transform: translate(23px, 0);
  }

  100% {
    transform: translate(20px, 0);
  }
}
</style>
