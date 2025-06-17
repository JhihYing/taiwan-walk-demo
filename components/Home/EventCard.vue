<script setup lang="ts">
interface IEventCardData {
  id: string;
  name?: string;
  image?: string;
  city?: string;
  date?: string;
  link?: string;
}
const props = defineProps<{
  cardData: IEventCardData;
}>();

// 範例：
//  <HomeEventCard :cardData="item" />

/*
{
  "id": "C2_376470000A_000509",
  "name": "轉知彰化縣政府交通安全宣導影片",
  "image": "https://tourism.chcg.gov.tw/upload/12/2024110615022876601.png",
  "city": "彰化縣",
  "date": "2024/11/05 - 2025/12/31",
  "link": "/events/C2_376470000A_000509"
}
*/
</script>

<template>
  <div class="group h-full w-full">
    <NuxtLink :to="cardData.link" class="flex h-full">
      <div
        class="h-full w-[160px] min-w-[120px] overflow-hidden rounded-[12px] border border-[#E5E5E5] sm:rounded-[0px] sm:border-transparent lg:min-w-[160px]"
      >
        <img
          loading="lazy"
          :src="cardData.image"
          :alt="cardData.name"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.06]"
        />
      </div>

      <div
        class="flex w-full flex-col py-[5px] pl-[15px] pr-[0px] sm:justify-between sm:px-[20px] sm:py-[10px] lg:px-[25px] lg:py-[16px]"
      >
        <div class="text-top">
          <p class="line-clamp-1 text-[14px] sm:text-[15px] lg:text-[16px]">
            {{ cardData.date }}
          </p>
          <h3
            class="line-clamp-1 text-[16px] font-bold sm:text-[20px] lg:line-clamp-2 lg:text-[21px]"
          >
            {{ cardData.name }}
          </h3>
        </div>
        <div class="mt-[5px] flex items-center justify-between lg:mt-[0px]">
          <p class="location flex items-center text-[14px] lg:text-[16px]">
            {{ cardData.city }}
          </p>
          <p
            class="detail hidden items-center text-[14px] font-medium text-primary duration-300 group-hover:opacity-80 sm:flex lg:text-[16px]"
          >
            {{ $t("home.details") }}
          </p>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<style scoped>
.location::before {
  content: "";
  width: 16px;
  height: 16px;
  background-image: url(@/assets/images/icons/location-black-icon.svg);
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  margin-right: 5px;
}
.detail::after {
  content: "";
  width: 16px;
  height: 16px;
  background-image: url(@/assets/images/icons/arrow-right-green-icon.svg);
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
  margin-left: 5px;
}
</style>
