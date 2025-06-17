<script setup lang="ts">
const { t, locale } = useI18n();
const router = useRouter();

// 彈窗狀態
const showPopup = ref<boolean>(false);
const alwaysShowPopup = false;

// 下拉選單狀態
const selectedTheme = ref<string>("探索景點");
const keyword = ref<string>("");

// 資料狀態
interface ICardData {
  id: string;
  name?: string;
  description?: string;
  image?: string;
  date?: string;
}

const foods = ref<ICardData[]>([]);
const scenicSpots = ref<ICardData[]>([]);
const events = ref<ICardData[]>([]);
const hasError = ref<boolean>(false);

// 下拉式選單 | 主題
interface IOption {
  value: string;
  label: string;
}
const themes = computed<IOption[]>(() => [
  { value: "探索景點", label: t("nav.spots") },
  { value: "節慶活動", label: t("nav.events") },
  { value: "美食佳餚", label: t("nav.foods") },
]);

// API：（初始化撈資料 + 語言切換用）
const fetchHomeData = async (lang: string): Promise<void> => {
  const result = await Promise.allSettled([
    $fetch("/api/foods/home", { query: { lang } }),
    $fetch("/api/spots/home", { query: { lang } }),
    $fetch("/api/events/home", { query: { lang } }),
  ]);

  foods.value = result[0].status === "fulfilled" ? result[0].value : [];
  scenicSpots.value = result[1].status === "fulfilled" ? result[1].value : [];
  events.value = result[2].status === "fulfilled" ? result[2].value : [];

  // 至少有一筆失敗就顯示錯誤提示
  hasError.value = result.some((res) => res.status === "rejected");
};

await fetchHomeData(locale.value);

// 搜尋功能
const handleSearch = (): void => {
  const trimmedKeyword = keyword.value.trim();

  // 檢查是否有輸入關鍵字
  if (!trimmedKeyword) {
    alert("請輸入關鍵字！");
    return;
  }

  // 根據主題跳轉到對應頁面
  let targetPath = "/spots/search";
  if (selectedTheme.value === "節慶活動") targetPath = "/events/search";
  else if (selectedTheme.value === "美食佳餚") targetPath = "/foods/search";

  router.push({
    path: targetPath,
    query: {
      keyword: keyword.value.trim() || undefined,
    },
  });
};

// 彈窗打開時，禁止整個頁面滾動
watch(showPopup, (val) => {
  document.body.style.overflow = val ? "hidden" : "auto";
});

// API：語言切換時重新撈資料
watch(locale, async (lang) => {
  await fetchHomeData(lang);
});

// 彈窗顯示：
// alwaysShowPopup = false：只要不關掉此網站就會顯示公告; 反之，則不會顯示
onMounted(() => {
  if (alwaysShowPopup) {
    showPopup.value = true;
    document.body.style.overflow = "hidden";
    return;
  }

  const seenPopup = sessionStorage.getItem("tdx_notice_seen");
  if (!seenPopup) {
    showPopup.value = true;
    sessionStorage.setItem("tdx_notice_seen", "true");
    document.body.style.overflow = "hidden";
  }
});
</script>

<template>
  <!-- 彈跳視窗 -->
  <div
    v-if="showPopup"
    class="fixed left-0 top-0 z-[999] flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.5)]"
    @click.self="showPopup = false"
  >
    <div
      class="popup-content relative w-[90%] max-w-[500px] rounded-[12px] bg-[#f8f6f1] px-[20px] py-[50px] text-center shadow-xl duration-300 animate-in fade-in"
    >
      <button
        class="absolute right-[15px] top-[2px] text-[30px] text-gray-500 hover:opacity-[0.8]"
        @click="showPopup = false"
      >
        ×
      </button>
      <h3 class="mb-[10px] text-[20px] font-bold text-[#3e3e3e]">
        {{ $t("home.popupTitle") }}
      </h3>
      <p class="text-[16px] leading-[1.6] text-[#4a4a4a]">
        {{ $t("home.popupContent") }}
      </p>
    </div>
  </div>

  <!-- 標題 & 搜尋功能 -->
  <section
    class="mt-[40px] flex flex-col items-center justify-center md:mt-[70px] md:flex-row"
  >
    <div
      class="mb-[33px] mr-[0px] text-center md:mb-[0px] md:mr-[40px] md:text-left xl:mr-[77px]"
    >
      <!-- 中文 -->
      <h2
        v-if="locale === 'zh-TW'"
        class="text-[30px] font-light text-[#1E1E1E] sm:text-[37px] xl:text-[48px]"
      >
        探索<span class="highlight relative">台灣之美</span><br />{{
          $t("home.subtitle")
        }}
      </h2>

      <!-- 英文 -->
      <h2
        v-else-if="locale === 'en-US'"
        class="text-[30px] font-light text-[#1E1E1E] sm:text-[37px] xl:text-[48px]"
      >
        The Beauty of <span class="highlight relative">Taiwan</span><br />{{
          $t("home.subtitle")
        }}
      </h2>

      <!-- 日文 -->
      <h2
        v-else-if="locale === 'ja-JP'"
        class="text-[30px] font-light text-[#1E1E1E] sm:text-[37px] xl:text-[48px]"
      >
        <span class="highlight relative">台湾</span>の美しさ<br />{{
          $t("home.subtitle")
        }}
      </h2>

      <div class="mt-[17px] flex items-center justify-center md:justify-start">
        <span
          class="subtitle mr-[8px] flex items-center text-[14px] sm:text-[15px] xl:text-[20px]"
          >{{ $t("home.guideLabel") }}</span
        >
      </div>
    </div>

    <!-- 搜尋功能 -->
    <div class="w-full sm:w-[380px] md:w-[350px]">
      <CommonSelect v-model="selectedTheme" :options="themes" />
      <CommonInput
        v-model="keyword"
        :placeholder="t('home.placeholder')"
        class="my-[7px]"
      />
      <CommonButton @click="handleSearch" />
    </div>
  </section>

  <!-- Banner -->
  <HomeBanner class="mb-[40px] mt-[57px]" />

  <!-- 活動 -->
  <HomeEventSection
    :cards="events"
    :title="t('home.eventTitle')"
    :more-text="t('common.more')"
  />

  <!-- 景點 -->
  <CommonCardSection
    :title="t('home.spotTitle')"
    class="my-[40px]"
    :cards="scenicSpots"
    :more-text="t('common.more')"
    moreLink="/spots"
  />

  <!-- 美食 -->
  <CommonCardSection
    :title="t('home.foodTitle')"
    :cards="foods"
    :more-text="t('common.more')"
    moreLink="/foods"
  />
</template>

<style>
.subtitle::before {
  content: "";
  width: 24px;
  height: 24px;
  background-image: url(@/assets/images/icons/location-green-icon.svg);
  background-repeat: no-repeat;
  background-size: contain;
  display: inline-block;
}
.highlight::after {
  content: "";
  width: 100%;
  height: 3px;
  background-color: #e0da48;
  position: absolute;
  right: 0px;
  top: 61px;
  border-radius: 10px;
}

@media screen and (max-width: 1024px) {
  .highlight::after {
    height: 2px;
    top: 47px;
  }
}
@media screen and (max-width: 480px) {
  .highlight::after {
    height: 2px;
    top: 36px;
  }
}
</style>
