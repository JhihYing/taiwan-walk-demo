<script setup lang="ts">
const { t } = useI18n();

interface IEventCardData {
  id: string;
  name?: string;
  image?: string;
  city?: string;
  date?: string;
  link?: string;
}
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

interface IProps {
  title?: string;
  moreText?: string;
  cards: IEventCardData[];
}

const props = withDefaults(defineProps<IProps>(), {
  title: "預設標題",
  moreText: "查看更多",
  cards: () => [],
});

// 範例：
// <HomeEventSection :cards="events" :title="t('home.eventTitle')" :more-text="t('common.more')" />
</script>

<template>
  <section class="my-[40px]">
    <CommonCardHeader>
      {{ title }}
      <template #more>
        <CommonMore to="/events">{{ moreText }}</CommonMore>
      </template>
    </CommonCardHeader>

    <ul
      v-if="cards.length"
      class="grid grid-cols-1 justify-between gap-x-[30px] gap-y-[16px] lg:grid-cols-2 lg:gap-y-[15px]"
    >
      <li
        v-for="item in cards"
        :key="item.id"
        class="h-[90px] w-full overflow-hidden sm:h-[120px] sm:rounded-[12px] sm:border sm:border-[#E5E5E5] sm:bg-[#F9F9F9] lg:h-[160px]"
      >
        <HomeEventCard :cardData="item" />
      </li>
    </ul>

    <p
      v-else
      class="flex h-[140px] items-center justify-center text-center text-gray-400 xl:h-[200px]"
    >
      {{ t("home.loadFailed") }}
    </p>
  </section>
</template>

<style scoped></style>
