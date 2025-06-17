/**
 * 目的：根據指定類型（景點、美食、活動）取得熱門主題區塊資料
 *
 * 功能說明：
 * - 根據傳入的類型（"spots" | "foods" | "events"），回傳對應的主題清單
 * - 每筆資料包含 id、title（使用 vue-i18n 翻譯）、link、image
 * - 使用 vue-i18n，支援 zh-TW / en-US / ja-JP 語系切換
 *
 * 使用範例：
 * const hotTopics = useHotTopics("spots");
 */

import { useI18n } from "vue-i18n";

import natureImg from "@/assets/images/spots-nature.jpg";
import factoryImg from "@/assets/images/spots-factory.jpg";
import artsImg from "@/assets/images/spots-arts.jpg";
import templeImg from "@/assets/images/spots-temple.jpg";
import sportsImg from "@/assets/images/spots-sports.jpg";
import hotspringImg from "@/assets/images/spots-hotspring.jpg";
import heritageImg from "@/assets/images/spots-heritage.jpg";

import localImg from "@/assets/images/foods-local.jpg";
import chineseImg from "@/assets/images/foods-chinese.jpg";
import dessertImg from "@/assets/images/foods-dessert.jpg";
import internationalImg from "@/assets/images/foods-international.jpg";
import souvenirImg from "@/assets/images/foods-souvenir.jpg";
import vegetarianImg from "@/assets/images/foods-vegetarian.jpg";

import festivalImg from "@/assets/images/events-festival.jpg";
import annualImg from "@/assets/images/events-annual.jpg";

interface IHotTopic {
  id: number;
  title: string;
  link: string;
  image: string;
}

export const useHotTopics = (type: "spots" | "foods" | "events") => {
  const { t } = useI18n();

  return computed<IHotTopic[]>(() => {
    switch (type) {
      case "spots":
        return [
          {
            id: 1,
            title: t("categories.nature"),
            link: "/spots/search?theme=自然風景類",
            image: natureImg,
          },
          {
            id: 2,
            title: t("categories.factory"),
            link: "/spots/search?theme=觀光工廠類",
            image: factoryImg,
          },
          {
            id: 3,
            title: t("categories.arts"),
            link: "/spots/search?theme=藝術類",
            image: artsImg,
          },
          {
            id: 4,
            title: t("categories.temple"),
            link: "/spots/search?theme=廟宇類",
            image: templeImg,
          },
          {
            id: 5,
            title: t("categories.sports"),
            link: "/spots/search?theme=體育健身類",
            image: sportsImg,
          },
          {
            id: 6,
            title: t("categories.hotspring"),
            link: "/spots/search?theme=溫泉類",
            image: hotspringImg,
          },
          {
            id: 7,
            title: t("categories.heritage"),
            link: "/spots/search?theme=古蹟類",
            image: heritageImg,
          },
        ];
      case "foods":
        return [
          {
            id: 1,
            title: t("categories.local"),
            link: "/foods/search?theme=地方特產",
            image: localImg,
          },
          {
            id: 2,
            title: t("categories.chinese"),
            link: "/foods/search?theme=中式美食",
            image: chineseImg,
          },
          {
            id: 3,
            title: t("categories.dessert"),
            link: "/foods/search?theme=甜點冰品",
            image: dessertImg,
          },
          {
            id: 4,
            title: t("categories.international"),
            link: "/foods/search?theme=異國料理",
            image: internationalImg,
          },
          {
            id: 5,
            title: t("categories.souvenir"),
            link: "/foods/search?theme=伴手禮",
            image: souvenirImg,
          },
          {
            id: 6,
            title: t("categories.vegetarian"),
            link: "/foods/search?theme=素食",
            image: vegetarianImg,
          },
        ];
      case "events":
        return [
          {
            id: 1,
            title: t("categories.festival"),
            link: "/events/search?theme=節慶活動",
            image: festivalImg,
          },
          {
            id: 2,
            title: t("categories.annual"),
            link: "/events/search?theme=年度活動",
            image: annualImg,
          },
        ];
      default:
        return [];
    }
  });
};
