<script setup lang="ts">
const { t } = useI18n();

interface ICardItem {
  id: string;
  name?: string;
  city?: string;
  image?: string;
  link?: string;
}

interface ICardSectionProps {
  title?: string;
  moreText?: string;
  moreLink?: string;
  cards: ICardItem[];
}

const props = withDefaults(defineProps<ICardSectionProps>(), {
  title: "推薦清單",
  moreText: "查看更多",
  moreLink: "/",
  cards: () => [],
});

// 範例：
// <CommonCardSection :title="t('home.spotTitle')" :more-text="t('common.more')" moreLink="/spots" :cards="scenicSpots" />
// scenicSpots 等於 { id: 'C1_376430000A_000981', name: '眷村故事館', city: '桃園市', image: 'https://travel.tycg.gov.tw/content/images/attractions/40424/640x480_attractions-image-5t6c9iih3e6gsarewa1afa.jpg', link: 'C1_376430000A_000981' } />
</script>

<template>
  <section>
    <CommonCardHeader>
      {{ title }}
      <template #more>
        <CommonMore :to="moreLink">{{ moreText }}</CommonMore>
      </template>
    </CommonCardHeader>

    <ul
      v-if="cards.length"
      class="grid grid-cols-2 gap-x-[15px] gap-y-[20px] md:grid-cols-4 md:gap-y-[0px] xl:gap-x-[20px] 2xl:gap-x-[30px]"
      data-food="food-jsList"
    >
      <li v-for="item in cards" :key="item.id" class="w-full">
        <CommonCard :cardData="item" />
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
