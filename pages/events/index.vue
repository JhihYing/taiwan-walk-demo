<script setup lang="ts">
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";

const { t } = useI18n();
const router = useRouter();

const isLoading = ref<boolean>(true);

// 搜尋相關的狀態
const selectedCity = ref<string>("");
const selectedTheme = ref<string>("");
const selectedDate = ref<string>("");
const keyword = ref<string>("");

// 下拉選單 | 縣市
const cities = useCityOptions();

// 下拉選單 | 主題
const themes = useCategoryOptions("events");

// 活動主題（含圖片、標題與連結）
const hotTopics = useHotTopics("events");

// 搜尋功能 (點擊搜尋按鈕)
const handleSearch = (): void => {
  router.push({
    path: "/events/search",
    query: {
      theme: selectedTheme.value || undefined,
      city: selectedCity.value || undefined,
      keyword: keyword.value.trim() || undefined,
      date: selectedDate.value || undefined,
    },
  });
};

onMounted(async () => {
  await nextTick();

  const imgUrls = hotTopics.value.map((item) => item.image);
  await useImagePreload(imgUrls); // 等圖片載入完成
  await new Promise((resolve) => setTimeout(resolve, 500));

  isLoading.value = false;
});
</script>

<template>
  <section class="mt-[40px] md:mt-[70px]">
    <!-- 麵包屑 -->
    <CommonBreadcrumb
      :items="[{ label: t('nav.home'), to: '/' }, { label: t('nav.events') }]"
    />

    <!-- 搜尋欄位 -->
    <div
      class="search-box mb-[60px] mt-[40px] grid w-full grid-cols-1 gap-[15px] sm:grid-cols-2 md:grid-cols-3 md:items-end"
    >
      <CommonSelect v-model="selectedCity" :options="cities" />
      <CommonSelect v-model="selectedTheme" :options="themes" />

      <EventsDatePicker v-model="selectedDate" />

      <CommonInput
        :placeholder="t('search.eventPlaceholder')"
        v-model="keyword"
      />
      <CommonButton @click="handleSearch" />
    </div>

    <!-- 標題-熱門主題 -->
    <h2 class="mb-[20px] text-[25px] md:text-[30px]">
      {{ $t("common.hotTopics") }}
    </h2>

    <!-- Loading 動畫 -->
    <div v-if="isLoading" class="mb-[40px] mt-[100px] flex justify-center">
      <DotLottieVue
        style="height: 180px; width: 180px"
        autoplay
        loop
        src="/lottie/loading.lottie"
      />
    </div>

    <!-- 主題清單 -->
    <ul
      v-else
      class="grid grid-cols-2 gap-x-[30px] gap-y-[12px] md:grid-cols-3 lg:grid-cols-4"
    >
      <li
        v-for="item in hotTopics"
        :key="item.id"
        class="h-[100px] w-full overflow-hidden rounded-[10px] duration-100 hover:opacity-70 sm:h-[125px]"
      >
        <CommonCategory :categoryData="item" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
@media (min-width: 1440px) {
  .search-box {
    grid-template-columns: 1.3fr 1.3fr 1fr 1.5fr 1fr;
  }
}
</style>
