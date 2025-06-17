<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

const props = defineProps<{
  images: readonly string[];
}>();

// 範例
// <CommonPageBanner :images="eventDetail?.images || []" />
// [ "https://tourism.chcg.gov.tw/upload/12/2025031217295820663.jpg", "https://tourism.chcg.gov.tw/upload/12/2025031217295225184.jpg" ]

const modules = [Navigation, Pagination, Autoplay];
</script>

<template>
  <section class="relative">
    <Swiper
      class="h-[250px] overflow-hidden rounded-[24px] sm:h-[350px] md:h-[500px] xl:h-[395px]"
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :pagination="{ clickable: true }"
      :navigation="{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }"
    >
      <SwiperSlide
        v-for="(image, index) in images"
        :key="index"
        class="relative h-full w-full"
      >
        <div class="relative flex h-full w-full justify-center">
          <!-- 圖片 -->
          <div class="absolute h-full w-full">
            <img
              :src="image"
              :alt="`圖片 ${index + 1}`"
              class="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>
      </SwiperSlide>

      <!-- 自訂箭頭 -->
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </Swiper>
  </section>
</template>

<style scoped>
/* 輪播圖 */
.swiper-button-prev::after {
  content: "prev";
  margin-left: 35px;
}
.swiper-button-next::after {
  content: "next";
  margin-right: 35px;
}
.swiper-button-prev::after,
.swiper-button-next::after {
  font-size: 10px;
  color: #fff;
  border: 1px solid white;
  border-radius: 100%;
  padding: 14px 16.4px;
  background-color: rgba(0, 0, 0, 0.1);
}
.swiper-button-prev:hover,
.swiper-button-next:hover {
  opacity: 0.7;
}

@media screen and (max-width: 768px) {
  .swiper-button-prev::after,
  .swiper-button-next::after {
    font-size: 8px;
    padding: 9px 11px;
  }
}
@media screen and (max-width: 480px) {
  .swiper-button-prev::after,
  .swiper-button-next::after {
    display: none;
  }
}
</style>
