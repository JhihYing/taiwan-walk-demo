/**
 * API：三公里內周邊活動（支援多語系）
 *
 * 功能說明：
 * - 根據經緯度計算活動距離，篩選 radius 公里內 + 尚未結束 的活動資料 (根據 excludeId 排除該活動本身)
 * - 支援多語系翻譯與分頁功能，支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 快取說明：
 * - (1) translatedEventsCache：所有活動的多語系翻譯資料 (本地JSON檔)
 *
 * 備註：跟 spots/nearby.ts 大同小異，差別在於：
 * (1) 篩選尚未結束的活動 + 沒城市
 */

// 匯入共用函式和工具
import { getQuery } from "#imports";
import { getCachedEvents } from "@/server/utils/getCachedEvents";
import { getCachedSpots } from "@/server/utils/getCachedSpots";
import { getCachedFoods } from "@/server/utils/getCachedFoods";
import { loadTranslatedData } from "@/server/utils/loadTranslatedData";
import { getNearbySourceName } from "@/server/utils/getNearbySourceName";

// 定義 TDX 原始資料格式
interface IEventItem {
  ActivityID: string;
  ActivityName?: string;
  Description?: string;
  City?: string;
  Address?: string;
  EndTime?: string;
  Picture?: {
    PictureUrl1?: string;
    [key: string]: string | undefined;
  };
  Position?: {
    PositionLat: number;
    PositionLon: number;
    GeoHash?: string;
  };
  [key: string]: any;
}

// 定義翻譯欄位的格式
interface ITranslatedEvent {
  ActivityID: string;
  [key: string]: any;
}
interface ITranslatedSpot {
  ScenicSpotID: string;
  [key: string]: any;
}
interface ITranslatedFood {
  RestaurantID: string;
  [key: string]: any;
}

// 定義最終回傳給前端的格式（已篩選並格式化）
interface INearbyEventItem {
  id: string;
  name: string;
  city: string;
  address: string;
  position: IEventItem["Position"] | null;
  image: string;
  description: string;
  link: string;
  distance: number;
}

// 使用Haversine 公式，根據兩個經緯度，計算兩點之間的直線距離（單位：公里）
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // 地球的半徑(常數)，單位是公里（km）

  // 把角度轉成「弧度」
  // 目的：因為三角函數（像是 Math.sin()）要用弧度來計算，不是角度
  const toRad = (val: number) => (val * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // Haversine 公式
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 取得 附近活動 的主函式
export default defineEventHandler(async (event) => {
  // 取得 query 參數
  const {
    lat,
    lon,
    radius = "3",
    excludeId,
    page = "1",
    limit = "12",
    lang = "zh-TW",
  } = getQuery(event);

  // 如果沒有經緯度，會報錯回傳 400
  if (!lat || !lon) {
    throw createError({ statusCode: 400, message: "缺少經緯度參數" });
  }

  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  // 快取撈取 原始全部活動資料、翻譯資料
  const originalData: IEventItem[] = await getCachedEvents();
  const translatedData = await loadTranslatedData<ITranslatedEvent>({
    cacheKey: "translatedEventsCache_v1",
    fileName: "events.json",
  });

  const now = Date.now();

  // 計算距離並過濾符合條件的活動，條件如下：
  // (1) 排除沒經緯度
  // (2) 排除沒城市
  // (3) 排除尚未結束的活動
  // (4) 排除 ID 和 excludeId 一樣的（就是該活動本身）
  // (5) 符合自訂距離內的活動
  // 最後依照距離排序，由近到遠
  const eventsWithDistance = originalData
    .map((activity) => {
      const pos = activity.Position;

      if (!pos?.PositionLat || !pos?.PositionLon) return null;
      if (!activity.City) return null;
      if (!activity.EndTime || new Date(activity.EndTime).getTime() < now)
        return null;
      if (excludeId && activity.ActivityID === excludeId) return null;

      const distance = getDistance(
        Number(lat),
        Number(lon),
        pos.PositionLat,
        pos.PositionLon,
      );

      if (distance > Number(radius)) return null;

      return { ...activity, distance };
    })
    .filter((s): s is IEventItem & { distance: number } => !!s) // 避免 null 值
    .sort((a, b) => a.distance - b.distance);

  // 分頁處理
  const total = eventsWithDistance.length;
  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 12;
  const start = (pageNum - 1) * limitNum;
  const paged = eventsWithDistance.slice(start, start + limitNum);

  // 格式化回傳結果
  const data: INearbyEventItem[] = paged.map((activity) => {
    // 根據 ID 找出對應的翻譯資料
    const translated = translatedData.find(
      (t) => t.ActivityID === activity.ActivityID,
    );

    // 優先使用翻譯名稱，沒有就用原始名稱
    return {
      id: activity.ActivityID,
      name:
        translated?.[`ActivityName${langSuffix}`] ||
        activity.ActivityName ||
        "",
      city: translated?.[`City${langSuffix}`] || activity.City || "",
      address: translated?.[`Address${langSuffix}`] || activity.Address || "",
      position: activity.Position || null,
      image: activity.Picture?.PictureUrl1 || "/images/default.jpg",
      description:
        translated?.[`Description${langSuffix}`] || activity.Description || "",
      link: `/events/${activity.ActivityID}`,
      distance: parseFloat(activity.distance.toFixed(2)),
    };
  });

  // 取得來源名稱（支援多語系）
  // 用於顯示標題「附近 xxx 公里內的活動」
  const originalFoods = await getCachedFoods();
  const originalSpots = await getCachedSpots();

  const translatedFoods = await loadTranslatedData<ITranslatedFood>({
    cacheKey: "translatedFoodsCache_v1",
    fileName: "foods.json",
  });

  const translatedSpots = await loadTranslatedData<ITranslatedSpot>({
    cacheKey: "translatedSpotsCache_v1",
    fileName: "spots.json",
  });

  const nearbySourceName = getNearbySourceName({
    excludeId: typeof excludeId === "string" ? excludeId : undefined,
    lang: typeof lang === "string" ? lang : "zh-TW",
    translatedSpots,
    translatedFoods,
    translatedEvents: translatedData,
    originalSpots,
    originalFoods,
    originalEvents: originalData,
  });

  return {
    total,
    data,
    nearbySourceName,
  };
});
