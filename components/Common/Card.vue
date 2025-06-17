<script setup lang="ts">
const { t } = useI18n();

interface ICardData {
  id: string;
  name?: string;
  address?: string;
  description?: string;
  city?: string;
  image?: string;
  link?: string;
  distance?: number;
  position?: {
    PositionLon: number;
    PositionLat: number;
    GeoHash: string;
  };
}

const props = defineProps<{
  cardData: Readonly<ICardData>;
}>();

/**
 * 使用範例：
 * <CommonCard :cardData="item" />
 * <CommonCard :cardData="
 {
  "id": "C1_376480000A_000446",
  "name": "松柏嶺受天宮",
  "city": "南投縣",
  "address": "南投縣名間鄉松山村松山街118號",
  "position": {
    "PositionLon": 120.63123321533203,
    "PositionLat": 23.831899642944336,
    "GeoHash": "wsjz942yz"
  },
  "image": "/images/default.jpg",
  "description": "八卦山台地松柏嶺上，為全台道教信仰重鎮。一望無際茶園景觀，更以松柏長青茶聞名。",
  "link": "/spots/C1_376480000A_000446",
  "distance": 0.16
 }
 " />
*/
</script>

<template>
  <NuxtLink :to="cardData.link">
    <div
      class="focus relative h-[140px] overflow-hidden rounded-[20px] lg:h-[200px]"
    >
      <img
        :src="cardData.image"
        :alt="cardData.name"
        class="h-full w-full object-cover"
        loading="lazy"
      />
    </div>

    <div class="card-text">
      <h3
        class="mb-[9px] mt-[13px] line-clamp-1 text-[16px] font-bold sm:text-[20px] md:text-[16px] lg:text-[22px]"
      >
        {{ cardData.name }}
      </h3>

      <p class="location flex items-center text-[14px] sm:text-[16px]">
        {{ cardData.city }}
      </p>
      <p
        v-if="cardData.distance != null"
        class="text-[14px] text-primary sm:text-[15px]"
      >
        {{
          t("common.approxDistance", {
            km: cardData.distance,
          })
        }}
      </p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.focus::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: solid 0 rgba(255, 255, 255, 0.5);
  transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) 0s;
  border-radius: 20px;
}
a:hover .focus img {
  transform: scale(1.1) rotate(1deg);
  filter: brightness(1.1);
  transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) 0s;
}
a:hover .focus::after {
  border-width: 0.6rem;
  transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) 0s;
}
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
</style>
