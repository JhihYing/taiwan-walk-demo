<script setup lang="ts">
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

const isLoading = ref<boolean>(true);
const hasSearched = ref<boolean>(false);
const nearbySourceName = ref("");

// 搜尋相關的狀態
const selectedCity = ref<string>("");
const selectedTheme = ref<string>("");
const selectedDate = ref<string>("");
const keyword = ref<string>("");

// 儲存實際送出查詢用的條件 (防止尚未按下搜尋按鈕，就觸發搜尋功能)
const lastSearchCity = ref<string>("");
const lastSearchTheme = ref<string>("");
const lastSelectedDate = ref<string>("");
const lastSearchKeyword = ref<string>("");

// 結果與分頁狀態
interface IEvent {
  id: string;
  name?: string;
  city?: string;
  address?: string;
  position?: {
    PositionLat: number;
    PositionLon: number;
    GeoHash: string;
  };
  image?: string;
  description?: string;
  link?: string;
  distance?: number;
}
const result = ref<IEvent[]>([]);
const totalCount = ref<number>(0);
const DEFAULT_LIMIT = 12;
const limit = ref<number>(DEFAULT_LIMIT);
const currentPage = ref<number>(1);
const totalPages = computed(() => Math.ceil(totalCount.value / limit.value));

// 下拉選單 | 縣市
const cities = useCityOptions();

// 下拉選單 | 主題
const themes = useCategoryOptions("events");

// API：搜尋功能
const fetchSearchResults = async (): Promise<void> => {
  isLoading.value = true;

  try {
    const query: Record<string, any> = {
      page: currentPage.value,
      limit: limit.value,
      lang: locale.value,
    };
    // 判斷是一般條件搜尋還是附近活動模式
    // (附近活動)
    if (route.query.lat && route.query.lon) {
      query.lat = route.query.lat;
      query.lon = route.query.lon;
      query.radius = route.query.radius || 3;
      query.excludeId = route.query.excludeId;

      const res = await $fetch<{
        data: IEvent[];
        total: number;
        nearbySourceName?: string;
      }>("/api/events/nearby", {
        params: {
          ...query,
          lang: locale.value,
        },
      });
      result.value = res.data;
      totalCount.value = res.total;

      nearbySourceName.value = res.nearbySourceName || "";
    } else {
      // (一般搜尋)
      query.city = lastSearchCity.value;
      query.class1 = lastSearchTheme.value;
      query.keyword = lastSearchKeyword.value;
      query.date = lastSelectedDate.value;
      query.excludeId = route.query.excludeId;

      const res = await $fetch<{
        data: IEvent[];
        total: number;
      }>("/api/events/search", { params: query });
      result.value = res.data;
      totalCount.value = res.total;
    }
  } catch (err: unknown) {
    console.error("發生錯誤", err);

    let statusCode = 500;
    let statusMessage = "發生未知錯誤";

    if (typeof err === "object" && err !== null) {
      const error = err as {
        statusCode?: number;
        statusMessage?: string;
        message?: string;
        response?: { status?: number };
      };

      statusCode = error.statusCode || error.response?.status || 500;
      statusMessage = error.statusMessage || error.message || "發生未知錯誤";
    }

    showError({ statusCode, statusMessage });
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 500)); // 人為延遲 500ms (避免讓 loading 動畫一閃即逝)
    isLoading.value = false;
  }
};

// 搜尋功能 (點擊搜尋按鈕)
const handleSearch = async (): Promise<void> => {
  lastSearchKeyword.value = keyword.value.trim();
  lastSearchTheme.value = selectedTheme.value;
  lastSearchCity.value = selectedCity.value;
  lastSelectedDate.value = selectedDate.value;

  currentPage.value = 1;

  // 更新 URL 的查詢參數
  await router.push({
    path: "/events/search",
    query: {
      theme: selectedTheme.value || undefined,
      city: selectedCity.value || undefined,
      keyword: keyword.value.trim() || undefined,
      date: selectedDate.value || undefined,
      page: 1,
    },
  });

  await fetchSearchResults();
  hasSearched.value = true;
};

// 分頁切換時，自動搜尋新頁面內容
watch(currentPage, (newPage, oldPage) => {
  if (newPage < 1) {
    currentPage.value = 1;
    return;
  }
  if (hasSearched.value) {
    fetchSearchResults();
  }
});

// 語言切換
watch(locale, async () => {
  // 若已搜尋過 → 重新撈取搜尋結果（翻譯內容會變）
  if (hasSearched.value) {
    await fetchSearchResults();
  }
});

onMounted(async () => {
  const themeFromQuery = route.query.theme;
  const cityFromQuery = route.query.city;
  const keywordFromQuery = route.query.keyword;
  const dateFromQuery = route.query.date;
  const lat = route.query.lat;
  const lon = route.query.lon;

  // 模式一：附近活動搜尋（網址帶有經緯度）
  if (lat && lon) {
    // 初始化目前頁數（讓使用者能直接分享特定頁數的搜尋結果）
    const page = parseInt(String(route.query.page));
    currentPage.value = isNaN(page) ? 1 : page;

    hasSearched.value = true;

    // 清空搜尋條件（附近活動不需條件）
    lastSearchCity.value = "";
    lastSearchTheme.value = "";
    lastSearchKeyword.value = "";
    lastSelectedDate.value = "";

    // 直接根據網址參數查詢，不記錄使用者操作
    fetchSearchResults();
    return;
  }

  // 模式二：條件式搜尋（使用者輸入縣市、主題、日期、關鍵字）
  // （避免 query 是陣列或 undefined）
  if (typeof themeFromQuery === "string") {
    selectedTheme.value = themeFromQuery;
  }
  if (typeof cityFromQuery === "string") {
    selectedCity.value = cityFromQuery;
  }
  if (typeof keywordFromQuery === "string") {
    keyword.value = keywordFromQuery;
  }
  if (typeof dateFromQuery === "string") {
    selectedDate.value = dateFromQuery;
  }

  // 初始化實際搜尋條件（用於 API 查詢）
  lastSearchTheme.value = selectedTheme.value;
  lastSearchCity.value = selectedCity.value;
  lastSearchKeyword.value = keyword.value.trim();
  lastSelectedDate.value = selectedDate.value;

  // 初始化目前頁數（預設為第1頁）
  const page = parseInt(String(route.query.page));
  currentPage.value = isNaN(page) ? 1 : page;

  await fetchSearchResults();
  hasSearched.value = true;
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

    <!-- Loading 動畫 -->
    <div v-if="isLoading" class="mb-[40px] mt-[100px] flex justify-center">
      <DotLottieVue
        style="height: 180px; width: 180px"
        autoplay
        loop
        src="/lottie/loading.lottie"
      />
    </div>

    <div v-else>
      <!-- 標題 -->
      <div class="mb-[20px]">
        <div class="flex flex-wrap items-end">
          <h2
            v-if="route.query.lat && route.query.lon"
            class="mr-[6px] text-[24px] md:text-[30px]"
          >
            {{
              t("common.nearbyFromPlace", {
                place: nearbySourceName || t("common.defaultSpotName"),
                km: 3,
              })
            }}
          </h2>

          <h2 v-else class="mr-[6px] text-[24px] md:text-[30px]">
            {{ $t("common.results") }}
          </h2>

          <p class="pb-[4px] text-[14px] text-[#646464] md:text-[17px]">
            {{ t("common.total_prefix") }}
            <span class="text-[16px] text-accent md:text-[17px]">{{
              totalCount
            }}</span>
            {{ t("common.total_suffix") }}
          </p>
        </div>

        <p
          v-if="route.query.lat && route.query.lon"
          class="mt-[5px] text-[15px] text-[#646464]"
        >
          {{ $t("common.distanceNote") }}
        </p>
      </div>

      <!-- 搜尋結果 | 有資料 -->
      <ul
        class="grid grid-cols-2 gap-x-[15px] gap-y-[20px] md:grid-cols-4 md:gap-y-[36px] xl:gap-x-[20px] 2xl:gap-x-[30px]"
        data-food="food-jsList"
      >
        <li v-for="item in result" :key="item.id" class="w-full">
          <CommonCard :cardData="item" />
        </li>
      </ul>

      <!-- 頁碼 -->
      <div v-if="totalPages > 0" class="mt-[40px] md:mt-[60px]">
        <CommonPagination v-model="currentPage" :totalPages="totalPages" />
      </div>

      <!-- 搜尋結果 | 尚無資料 -->
      <div
        v-if="hasSearched && result.length === 0"
        class="mt-[120px] flex w-full flex-col items-center"
      >
        <div class="w-[65px] md:w-[80px]">
          <img
            src="@/assets/images/icons/no-data-icon.svg"
            :alt="$t('common.noResults')"
            class="h-full w-full object-contain"
          />
        </div>
        <p
          class="mt-[12px] text-center text-[16px] font-bold text-primary md:text-[18px]"
        >
          {{ $t("common.noResults") }}<br />
          {{ $t("common.searchingAgain") }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (min-width: 1440px) {
  .search-box {
    grid-template-columns: 1.3fr 1.3fr 1fr 1.5fr 1fr;
  }
}
</style>
