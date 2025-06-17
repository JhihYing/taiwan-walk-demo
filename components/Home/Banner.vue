<script setup lang="ts">
const { t } = useI18n();

import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
const modules = [Navigation, Pagination, Autoplay] as const;

import banner01 from "@/assets/images/banner01.jpg";
import banner02 from "@/assets/images/banner02.jpg";
import banner03 from "@/assets/images/banner03.jpg";
import banner04 from "@/assets/images/banner04.jpg";
import banner05 from "@/assets/images/banner05.jpg";

interface BannerItem {
  id: number;
  title: string;
  image: string;
}

const bannerList = computed<readonly BannerItem[]>(() => [
  {
    id: 1,
    title: t("banner.one"), // "新北市｜不厭亭"
    image: banner01,
  },
  {
    id: 2,
    title: t("banner.two"), // "花蓮縣｜清水斷崖"
    image: banner02,
  },
  {
    id: 3,
    title: t("banner.three"), // "新北市｜漁人碼頭"
    image: banner03,
  },
  {
    id: 4,
    title: t("banner.four"), // "新北市｜九份老街"
    image: banner04,
  },
  {
    id: 5,
    title: t("banner.five"), // "臺北市｜象山親子步道"
    image: banner05,
  },
]);
</script>

<template>
  <section class="relative">
    <Swiper
      class="h-[185px] overflow-hidden rounded-[24px] sm:h-[300px] md:h-[400px]"
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      :navigation="{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }"
    >
      <SwiperSlide
        v-for="item in bannerList"
        :key="item.id"
        class="relative h-full w-full"
      >
        <!-- 遮罩 -->
        <div class="bg-dark"></div>

        <!-- 圖片 -->
        <div class="absolute inset-0">
          <img
            :src="item.image"
            :alt="item.title"
            class="h-full w-full object-cover object-center"
            loading="lazy"
          />
        </div>

        <!-- 文字 -->
        <div
          class="relative z-[2] flex h-full items-center justify-center break-words px-[30px] text-center text-[18px] font-extrabold text-white sm:px-[70px] sm:text-[22px]"
        >
          {{ item.title }}
        </div>
      </SwiperSlide>

      <!-- 自訂箭頭 -->
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </Swiper>
  </section>
</template>

<style scoped>
/* 遮罩 */
.bg-dark {
  height: 100%;
  min-width: 100%;
  position: absolute;
  left: 0px;
  top: 0px;
  opacity: 0.3;
  background: rgb(59 59 59 / 15%);
  z-index: 1;
  border-radius: 24px;
}

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
