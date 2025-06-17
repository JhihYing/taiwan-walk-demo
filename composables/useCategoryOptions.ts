/**
 * 目的：取得不同類型的主題分類選項（景點 / 美食 / 活動）
 *
 * 功能說明：
 * - 根據傳入的類型（"spots" | "foods" | "events"），回傳對應的主題分類資料
 * - 每筆資料包含 value（對應的分類名稱）與 label（對應翻譯字串）
 * - 使用 vue-i18n，支援 zh-TW / en-US / ja-JP 語系切換
 *
 * 使用範例：
 * const themes = useCategoryOptions("spots");
 */

import { computed, type ComputedRef } from "vue";
import { useI18n } from "vue-i18n";
import type { IOption } from "@/types/common";

// 支援的分類類型
export type CategoryType = "spots" | "foods" | "events";

export const useCategoryOptions = (
  type: CategoryType,
): ComputedRef<IOption[]> => {
  const { t } = useI18n();

  return computed(() => {
    if (type === "spots") {
      return [
        { value: "", label: t("categories.allTopics") },
        { value: "自然風景類", label: t("categories.nature") },
        { value: "觀光工廠類", label: t("categories.factory") },
        { value: "藝術類", label: t("categories.arts") },
        { value: "廟宇類", label: t("categories.temple") },
        { value: "體育健身類", label: t("categories.sports") },
        { value: "溫泉類", label: t("categories.hotspring") },
        { value: "古蹟類", label: t("categories.heritage") },
        { value: "文化類", label: t("categories.culture") },
        { value: "生態類", label: t("categories.eco") },
        { value: "國家公園類", label: t("categories.nationalPark") },
        { value: "國家風景區類", label: t("categories.scenicArea") },
        { value: "森林遊樂區類", label: t("categories.forestRecreation") },
        { value: "遊憩類", label: t("categories.recreation") },
        { value: "林場類", label: t("categories.forestStation") },
        { value: "都會公園類", label: t("categories.urbanPark") },
        { value: "小吃/特產類", label: t("categories.snackSpecialty") },
        { value: "休閒農業類", label: t("categories.agriculture") },
        { value: "其他", label: t("categories.other") },
      ];
    }

    if (type === "foods") {
      return [
        { value: "", label: t("categories.allTopics") },
        { value: "地方特產", label: t("categories.local") },
        { value: "中式美食", label: t("categories.chinese") },
        { value: "甜點冰品", label: t("categories.dessert") },
        { value: "異國料理", label: t("categories.international") },
        { value: "伴手禮", label: t("categories.souvenir") },
        { value: "素食", label: t("categories.vegetarian") },
        { value: "夜市小吃", label: t("categories.nightmarket") },
        { value: "火烤料理", label: t("categories.bbq") },
        { value: "其他", label: t("categories.other") },
      ];
    }

    if (type === "events") {
      return [
        { value: "", label: t("categories.allTopics") },
        { value: "節慶活動", label: t("categories.festival") },
        { value: "藝文活動", label: t("categories.artEvent") },
        { value: "四季活動", label: t("categories.seasonal") },
        { value: "年度活動", label: t("categories.annual") },
        { value: "自行車活動", label: t("categories.cycling") },
        { value: "其他", label: t("categories.other") },
      ];
    }

    return [];
  });
};
