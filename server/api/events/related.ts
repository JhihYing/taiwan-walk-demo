/**
 * API：推薦相關活動（支援多語系）
 *
 * 功能說明：
 * - 隨機選出 4 筆 有圖片 + 有城市名稱 + 尚未結束 的相同縣市活動 (根據 excludeId 排除該活動本身)
 * - 支援多語系翻譯（名稱、城市），支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 使用的快取有：
 * - (1) translatedEventsCache：所有活動的多語系翻譯資料 (本地JSON檔)
 *
 * 備註：跟 spots/related.ts 大同小異，差別在於：
 * (1) 篩選尚未結束的活動（EndTime >= now）
 */

// 匯入共用函式和工具
import { getQuery } from "#imports";
import { getCachedEvents } from "@/server/utils/getCachedEvents";
import { loadTranslatedData } from "@/server/utils/loadTranslatedData";

// 定義 TDX 原始資料格式
interface IEventItem {
  ActivityID: string;
  ActivityName?: string;
  City?: string;
  Address?: string;
  StartTime?: string;
  EndTime?: string;
  Picture?: {
    [key: string]: string | undefined;
  };
  [key: string]: any;
}

// 定義翻譯欄位的格式
interface ITranslatedEvent {
  ActivityID: string;
  [key: string]: any;
}

// 定義最終回傳給前端的格式（已篩選並格式化）
interface IResultItem {
  id: string;
  name: string;
  image: string;
  city: string;
  link: string;
}

// 取得 推薦相關活動 的主函式
export default defineEventHandler(async (event): Promise<IResultItem[]> => {
  const query = getQuery(event);

  // 取得 query 參數：城市、要排除的 ID(該活動本身)、語言
  const cityInput = query.city as string;
  const excludeId = query.excludeId as string;
  const lang = (query.lang || "zh-TW") as string;
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  // 如果沒有傳城市，會報錯回傳 400
  if (!cityInput) {
    throw createError({ statusCode: 400, message: "缺少 city 參數" });
  }

  const storage = useStorage();

  // 快取撈取 原始全部活動資料、翻譯資料
  const originalData: IEventItem[] = await getCachedEvents();
  const translatedData = await loadTranslatedData<ITranslatedEvent>({
    cacheKey: "translatedEventsCache_v1",
    fileName: "events.json",
  });

  // 處理城市名稱的語言轉換問題
  const cityMatch = translatedData.find(
    (item) => item[`City${langSuffix}` as keyof ITranslatedEvent] === cityInput,
  );
  const normalizedCity = cityMatch?.City || cityInput;

  const now = Date.now();

  // 篩選符合條件的推薦活動（同城市、排除自身、尚未結束）
  const filtered = originalData.filter((activity) => {
    const endTime = new Date(activity.EndTime || "").getTime();
    const inCity =
      activity.City?.includes(normalizedCity) ||
      activity.Address?.startsWith(normalizedCity);

    return (
      inCity &&
      activity.ActivityID !== excludeId &&
      !isNaN(endTime) &&
      endTime >= now
    );
  });

  // 隨機挑選資料(最多 4 筆)
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 4);

  // 格式化回傳結果
  const result: IResultItem[] = selected.map((item) => {
    // 根據 ID 找出對應的翻譯資料
    const translated = translatedData.find(
      (t) => t.ActivityID === item.ActivityID,
    );

    // 優先使用翻譯名稱，沒有就用原始名稱
    return {
      id: item.ActivityID,
      name:
        translated?.[`ActivityName${langSuffix}`] || item.ActivityName || "",
      image: item.Picture?.PictureUrl1 || "/images/default.jpg",
      city: translated?.[`City${langSuffix}`] || item.City || "",
      link: `/events/${item.ActivityID}`,
    };
  });

  return result;
});
