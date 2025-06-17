<script setup lang="ts">
import { DotLottieVue } from "@lottiefiles/dotlottie-vue";

const { t } = useI18n();
const route = useRoute();

const foodId = route.params.id as string; // 該地點的ID

// 初始化資料
interface IFoodDetail {
  id: string;
  name?: string;
  description?: string;
  city?: string;
  address?: string;
  openTime?: string;
  phone?: string;
  website?: string;
  ticketInfo?: string;
  images?: string[];
  classTags?: string[];
  position?: {
    PositionLat: number;
    PositionLon: number;
    GeoHash: string;
  };
}
interface IRelatedFood {
  id: string;
  name?: string;
  city?: string;
  link?: string;
  images?: string;
}

// 文章分享功能
const shareUrl = ref<string>("");
const shareTitle = computed(() => foodDetail.value?.name || "品嚐美食");
const { shareToLine, openLineApp, copyLink } = useShare(shareUrl, shareTitle);

// API：共用函式
const {
  isLoading,
  detail: foodDetail,
  related: relatedFoods,
  mapSrc,
} = useDetailData<IFoodDetail, IRelatedFood>("foods", foodId);

// 下拉選單 | 縣市
const cities = useCityOptions();

// 把 label 美食的地名 轉成 下拉選單中對應的 value 值
// 目的：URL 可以使用 ?city=臺中市 這種形式去搜尋
const findCityValueByLabel = (label?: string): string => {
  const match = cities.value.find((item) => item.label === label);
  return match?.value || "";
};
const cityQueryValue = computed(() =>
  findCityValueByLabel(foodDetail.value?.city),
);

watchEffect(() => {
  if (typeof window === "undefined") {
    return;
  }

  shareUrl.value = `${window.location.origin}/foods/${foodId}`;
});
</script>

<template>
  <!-- Loading 動畫 -->
  <div
    v-if="isLoading"
    class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
  >
    <DotLottieVue
      style="height: 180px; width: 180px"
      autoplay
      loop
      src="/lottie/loading.lottie"
    />
  </div>

  <section v-else class="mt-[40px] md:mt-[70px]">
    <!-- 麵包屑 -->
    <CommonBreadcrumb
      :items="[
        { label: t('nav.home'), to: '/' },
        { label: t('nav.foods'), to: '/foods' },
        {
          label: foodDetail?.city ?? t('common.unknown'),
          to: `/foods/search?city=${cityQueryValue}`,
        },
        { label: foodDetail?.name ?? t('common.unknownName') },
      ]"
    />

    <!-- 標題 -->
    <div class="mt-[25px] sm:mt-[40px]">
      <div
        class="mb-[12px] flex flex-col-reverse flex-wrap-reverse justify-between md:flex-row md:items-center"
      >
        <h2 class="text-[24px] lg:text-[28px]">
          {{ foodDetail?.name || t("detail.noLocationName") }}
        </h2>

        <!-- 分享 -->
        <div class="mb-[15px] flex items-center justify-end md:mb-0">
          <p class="mr-[10px] text-[12px] sm:text-[16px]">
            {{ $t("detail.share") }}
          </p>
          <ul class="share-list flex items-center justify-end md:justify-start">
            <!-- 手機版 -->
            <li
              @click="openLineApp"
              class="inline-block h-[35px] w-[35px] cursor-pointer duration-300 hover:opacity-70 sm:h-[40px] sm:w-[40px] md:hidden"
            >
              <img
                src="@/assets/images/icons/share-line-icon.svg"
                :alt="$t('detail.shareLine')"
              />
            </li>

            <!-- 網頁版 -->
            <li
              @click="shareToLine"
              class="hidden h-[35px] w-[35px] cursor-pointer duration-300 hover:opacity-70 sm:h-[40px] sm:w-[40px] md:inline-block"
            >
              <img
                src="@/assets/images/icons/share-line-icon.svg"
                :alt="$t('detail.shareLine')"
              />
            </li>
            <li
              @click="copyLink"
              class="h-[35px] w-[35px] cursor-pointer duration-300 hover:opacity-70 sm:h-[40px] sm:w-[40px]"
            >
              <img
                src="@/assets/images/icons/share-link-icon.svg"
                :alt="$t('detail.copyLink')"
              />
            </li>
          </ul>
        </div>
      </div>

      <!-- Tag 標籤 -->
      <ul
        v-if="foodDetail?.classTags?.length"
        class="tag-list flex flex-wrap items-center gap-y-[10px]"
      >
        <li
          v-for="tag in foodDetail.classTags"
          :key="tag"
          class="flex items-center justify-center rounded-[20px] border border-accent px-[5px] py-[5px] text-[13px] text-accent lg:px-[10px] lg:py-[5px] lg:text-[15px]"
        >
          # {{ tag }}
        </li>
      </ul>
    </div>

    <!-- Banner與資訊-->
    <div class="mt-[18px] flex flex-col items-start xl:mb-[30px] xl:flex-row">
      <CommonPageBanner
        class="mr-[30px] w-full xl:min-w-[560px]"
        :images="foodDetail?.images || []"
      />

      <ul
        class="content-list mb-[30px] mt-[30px] w-full rounded-[12px] bg-[#F9F9F9] px-[15px] py-[30px] md:px-[30px] xl:mb-0 xl:mt-[0px] xl:min-h-[395px]"
      >
        <li class="flex flex-col items-start sm:flex-row">
          <h5 class="whitespace-nowrap text-[16px] font-bold lg:text-[18px]">
            {{ $t("detail.openingHours") }}：
          </h5>
          <p>{{ foodDetail?.openTime || t("detail.notprovided") }}</p>
        </li>

        <li class="flex flex-col items-start sm:flex-row">
          <h5 class="whitespace-nowrap text-[16px] font-bold lg:text-[18px]">
            {{ $t("detail.contactNumber") }}：
          </h5>
          <p>{{ foodDetail?.phone || t("detail.notprovided") }}</p>
        </li>

        <li class="flex flex-col items-start sm:flex-row">
          <h5 class="whitespace-nowrap text-[16px] font-bold lg:text-[18px]">
            {{ $t("detail.restaurantAddress") }}：
          </h5>
          <p class="mt-[5px]">
            {{ foodDetail?.address || t("detail.notprovided") }}
          </p>
        </li>

        <li
          v-if="foodDetail?.website"
          class="flex flex-col items-start sm:flex-row"
        >
          <h5 class="whitespace-nowrap text-[16px] font-bold lg:text-[18px]">
            {{ $t("detail.website") }}：
          </h5>
          <a
            :href="foodDetail.website"
            target="_blank"
            class="text-primary underline duration-300 hover:opacity-70"
          >
            {{ $t("detail.viewWebsite") }}
          </a>
        </li>
      </ul>
    </div>

    <!-- 介紹 -->
    <div>
      <h4 class="mb-[15px] text-[18px] font-bold">
        {{ $t("detail.restaurantinfo") }}：
      </h4>
      <p
        v-html="foodDetail?.description || t('detail.nodetail')"
        class="text-[16px]"
      ></p>
    </div>

    <!-- Google地圖 與 周邊資訊 -->
    <div
      class="mb-[40px] mt-[30px] flex h-[337px] flex-col-reverse items-start md:mb-[60px] md:flex-row"
    >
      <!-- 周邊資訊 -->
      <CommonNearbyBox
        :baseId="foodDetail?.id"
        :baseName="foodDetail?.name"
        :position="foodDetail?.position"
        :cityLabel="foodDetail?.city"
      />

      <!-- Google 地圖 -->
      <div
        class="mb-[30px] h-full w-full overflow-hidden rounded-[12px] bg-primary md:mb-[0] md:w-[calc(100%-160px)]"
      >
        <iframe
          width="100%"
          height="100%"
          frameborder="0"
          style="border: 0"
          :src="mapSrc"
          allowfullscreen="true"
        ></iframe>
      </div>
    </div>

    <CommonCardSection
      v-if="relatedFoods?.length"
      :cards="relatedFoods"
      :title="t('detail.foodPlaceholder', { city: foodDetail?.city })"
      :more-text="t('common.more')"
      :more-link="`/foods/search?city=${cityQueryValue}&excludeId=${foodDetail?.id}`"
    />
  </section>
</template>

<style scoped>
.tag-list > li {
  margin-right: 8px;
}
.tag-list > li:last-child {
  margin-right: 0;
}

.content-list > li {
  margin-bottom: 12px;
}
.content-list > li:last-child {
  margin-bottom: 0px;
}

.share-list > li {
  margin-right: 8px;
}
.share-list > li:last-child {
  margin-right: 0;
}
</style>
