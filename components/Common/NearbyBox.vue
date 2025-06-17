<script setup lang="ts">
/**
 * 目的：共用附近搜尋功能（景點 / 美食 / 活動）
 *
 * 功能說明：
 * - 傳入 baseId / baseName / position 進行附近搜尋（預設 radius 3 公里）
 * - 傳入 cityLabel（例如 "台中市"）自動轉換為 query 用的 value
 * - 支援 hover 圖示切換與多語系文字顯示
 *
 * 使用範例：
 * <CommonNearbyBox
 *   :baseId="spotDetail?.id"
 *   :baseName="spotDetail?.name"
 *   :position="spotDetail?.position"
 *   :cityLabel="spotDetail?.city"
 * />
 */

import { useI18n } from "vue-i18n";
import spotsNormalIcon from "@/assets/images/icons/nearby-spots-icon.svg";
import spotsHoverIcon from "@/assets/images/icons/nearby-spots-hover-icon.svg";
import foodNormalIcon from "@/assets/images/icons/nearby-food-icon.svg";
import foodHoverIcon from "@/assets/images/icons/nearby-food-hover-icon.svg";
import eventNormalIcon from "@/assets/images/icons/nearby-event-icon.svg";
import eventHoverIcon from "@/assets/images/icons/nearby-event-hover-icon.svg";

// Props
const props = defineProps<{
  baseId?: string;
  baseName?: string;
  position?: {
    PositionLat: number;
    PositionLon: number;
  };
  cityLabel?: string;
}>();

const router = useRouter();

const cities = useCityOptions();

// Hover 狀態
const isHoverSpots = ref(false);
const isHoverFood = ref(false);
const isHoverEvent = ref(false);

// 將 cityLabel 轉成下拉選單中的 value（可用於搜尋）
const findCityValueByLabel = (label?: string): string => {
  const match = cities.value.find((item) => item.label === label);
  return match?.value || "";
};
const cityQueryValue = computed(() => findCityValueByLabel(props.cityLabel));

// 附近搜尋功能
const handleNearbySearch = (type: "spots" | "foods" | "events") => {
  const lat = props.position?.PositionLat;
  const lon = props.position?.PositionLon;
  const id = props.baseId;
  const name = props.baseName;

  if (!lat || !lon || !id) return;

  router.push({
    path: `/${type}/search`,
    query: {
      lat,
      lon,
      radius: 3,
      excludeId: id,
      name,
      city: cityQueryValue.value,
      page: 1,
    },
  });
};
</script>

<template>
  <div
    class="flex w-full flex-col justify-between md:mr-[30px] md:h-full md:w-[180px]"
  >
    <h5 class="mb-[10px] whitespace-nowrap text-[18px] font-bold md:mb-[0]">
      {{ $t("detail.nearbyInfo") }}：
    </h5>

    <ul
      class="grid grid-cols-3 gap-x-[10px] md:grid-cols-1 md:flex-col md:gap-x-[0px] md:gap-y-[10px]"
    >
      <!-- 附近景點 -->
      <li @mouseenter="isHoverSpots = true" @mouseleave="isHoverSpots = false">
        <NuxtLink
          @click.prevent="handleNearbySearch('spots')"
          class="flex h-[90px] w-full cursor-pointer flex-col items-center justify-center rounded-[6px] border-[2px] border-[#E5E5E5] px-[10px] hover:border-primary"
        >
          <img
            :src="isHoverSpots ? spotsHoverIcon : spotsNormalIcon"
            :alt="$t('detail.nearbyScenicSpots')"
            class="h-[30px] w-auto"
          />
          <p class="mt-[5px] text-center text-[15px] font-bold text-primary">
            {{ $t("detail.nearbyScenicSpots") }}
          </p>
        </NuxtLink>
      </li>

      <!-- 附近美食 -->
      <li @mouseenter="isHoverFood = true" @mouseleave="isHoverFood = false">
        <NuxtLink
          @click.prevent="handleNearbySearch('foods')"
          class="flex h-[90px] w-full cursor-pointer flex-col items-center justify-center rounded-[6px] border-[2px] border-[#E5E5E5] px-[10px] hover:border-primary"
        >
          <img
            :src="isHoverFood ? foodHoverIcon : foodNormalIcon"
            :alt="$t('detail.nearbyRestaurants')"
            class="h-[30px] w-auto"
          />
          <p class="mt-[5px] text-center text-[15px] font-bold text-primary">
            {{ $t("detail.nearbyRestaurants") }}
          </p>
        </NuxtLink>
      </li>

      <!-- 附近活動 -->
      <li @mouseenter="isHoverEvent = true" @mouseleave="isHoverEvent = false">
        <NuxtLink
          @click.prevent="handleNearbySearch('events')"
          class="flex h-[90px] w-full cursor-pointer flex-col items-center justify-center rounded-[6px] border-[2px] border-[#E5E5E5] px-[10px] hover:border-primary"
        >
          <img
            :src="isHoverEvent ? eventHoverIcon : eventNormalIcon"
            :alt="$t('detail.nearbyEvents')"
            class="h-[30px] w-auto"
          />
          <p class="mt-[5px] text-center text-[15px] font-bold text-primary">
            {{ $t("detail.nearbyEvents") }}
          </p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
