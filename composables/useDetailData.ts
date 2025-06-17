/**
 * 目的：取得不同類型的詳細資料（景點 / 美食 / 活動），並取得對應推薦資料
 *
 * 功能說明：
 * - 根據傳入的類型（"spots" | "foods" | "events"）與 ID，撈取對應詳細資料（例如 /api/spots/[id]）
 * - 根據該筆資料的城市與 ID，再撈取推薦資料（會排除自身）
 * - 監聽 locale 語言切換，自動重新撈取資料
 * - 回傳資料包含：isLoading 載入狀態、detail 詳細內容、related 推薦資料、mapSrc 地圖嵌入連結
 *
 * 使用範例：
 * const { isLoading, detail, related, mapSrc } = useDetailData<ISpotDetail, IRelatedSpot>("spots", spotId);
 */

import { useI18n } from "vue-i18n";

export function useDetailData<TDetail, TRelated>(
  type: "spots" | "foods" | "events",
  id: string,
) {
  const config = useRuntimeConfig();
  const { locale } = useI18n();
  const isLoading = ref(true);

  const detail = ref<TDetail | null>(null);
  const related = ref<TRelated[]>([]);

  // Google Map 嵌入網址 (動態更新地圖內容)
  const mapSrc = computed(() => {
    const lat = (detail.value as any)?.position?.PositionLat;
    const lon = (detail.value as any)?.position?.PositionLon;

    if (!lat || !lon) return "";
    return `https://www.google.com/maps/embed/v1/place?key=${config.public.googleMapsApiKey}&q=${lat},${lon}&zoom=16`;
  });

  // 資料取得函式
  const fetchData = async () => {
    isLoading.value = true;

    try {
      // 撈取主資料
      const { data: detailData } = await useFetch<TDetail>(
        `/api/${type}/${id}`,
        {
          query: { lang: locale.value },
        },
      );
      detail.value = detailData.value!;

      // 撈取推薦資料
      const { data: relatedData } = await useFetch<TRelated[]>(
        `/api/${type}/related`,
        {
          query: {
            city: (detail.value as any)?.city,
            excludeId: (detail.value as any)?.id,
            lang: locale.value,
          },
        },
      );
      related.value = relatedData.value ?? [];
    } catch (err) {
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
      await new Promise((r) => setTimeout(r, 500)); // 避免 loading 動畫一閃即逝
      isLoading.value = false;
    }
  };

  fetchData();
  watch(locale, fetchData);

  return {
    isLoading,
    detail,
    related,
    mapSrc,
    fetchData, // 若有其他需求也能手動觸發
  };
}
