/**
 * 目的：取得全台縣市的下拉選單選項（支援多語系）
 *
 * 功能說明：
 * - 每筆資料包含 value（原始縣市名稱）與 label（對應翻譯字串）
 * - 使用 vue-i18n，支援 zh-TW / en-US / ja-JP 語系切換
 *
 * 使用範例：
 * const cities = useCityOptions();
 */

import { useI18n } from "vue-i18n";
import type { IOption } from "@/types/common";

export const useCityOptions = (): ComputedRef<IOption[]> => {
  const { t } = useI18n();

  return computed(() => [
    { value: "", label: t("city.all") },
    // 北部
    { value: "臺北市", label: t("city.taipei") },
    { value: "新北市", label: t("city.newTaipei") },
    { value: "基隆市", label: t("city.keelung") },
    { value: "桃園市", label: t("city.taoyuan") },
    { value: "新竹市", label: t("city.hsinchu") },
    { value: "新竹縣", label: t("city.hsinchuCounty") },
    { value: "苗栗縣", label: t("city.miaoliCounty") },

    // 中部
    { value: "臺中市", label: t("city.taichung") },
    { value: "彰化縣", label: t("city.changhuaCounty") },
    { value: "南投縣", label: t("city.nantouCounty") },
    { value: "雲林縣", label: t("city.yunlinCounty") },

    // 南部
    { value: "嘉義市", label: t("city.chiayi") },
    { value: "嘉義縣", label: t("city.chiayiCounty") },
    { value: "臺南市", label: t("city.tainan") },
    { value: "高雄市", label: t("city.kaohsiung") },
    { value: "屏東縣", label: t("city.pingtungCounty") },

    // 東部
    { value: "宜蘭縣", label: t("city.yilanCounty") },
    { value: "花蓮縣", label: t("city.hualienCounty") },
    { value: "臺東縣", label: t("city.taitungCounty") },

    // 離島
    { value: "澎湖縣", label: t("city.penghuCounty") },
    { value: "金門縣", label: t("city.kinmenCounty") },
    { value: "連江縣", label: t("city.lienchiangCounty") },
  ]);
};
