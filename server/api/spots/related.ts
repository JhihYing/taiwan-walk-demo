/**
 * API：推薦相關景點（支援多語系）
 *
 * 功能說明：
 * - 隨機選出 4 筆 有圖片 + 有城市名稱 的相同縣市景點 (根據 excludeId 排除該景點本身)
 * - 支援多語系翻譯（名稱、城市），支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 使用的快取有：
 * - (1) translatedSpotsCache：所有景點的多語系翻譯資料 (本地JSON檔)
 */

// 匯入共用函式和工具
import { getQuery } from "#imports";
import { getCachedSpots } from "@/server/utils/getCachedSpots";
import { loadTranslatedData } from "@/server/utils/loadTranslatedData";

// 定義 TDX 原始資料格式
interface ISpotItem {
  ScenicSpotID: string;
  ScenicSpotName?: string;
  City?: string;
  Address?: string;
  Picture?: {
    [key: string]: string | undefined;
  };
  [key: string]: any;
}

// 定義翻譯欄位的格式
interface ITranslatedSpot {
  ScenicSpotID: string;
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

// 取得 推薦相關景點 的主函式
export default defineEventHandler(async (event): Promise<IResultItem[]> => {
  const query = getQuery(event);

  // 取得 query 參數：城市、要排除的 ID(該景點本身)、語言
  const cityInput = query.city as string;
  const excludeId = query.excludeId as string;
  const lang = (query.lang || "zh-TW") as string;
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  // 如果沒有傳城市，會報錯回傳 400
  if (!cityInput) {
    throw createError({ statusCode: 400, message: "缺少 city 參數" });
  }

  // 快取撈取 原始全部景點資料、翻譯資料
  const originalData: ISpotItem[] = await getCachedSpots();
  const translatedData = await loadTranslatedData<ITranslatedSpot>({
    cacheKey: "translatedSpotsCache_v1",
    fileName: "spots.json",
  });

  // 處理城市名稱的語言轉換問題
  const cityMatch = translatedData.find(
    (item) => item[`City${langSuffix}` as keyof ITranslatedSpot] === cityInput,
  );
  const normalizedCity = cityMatch?.City || cityInput;

  // 篩選符合條件的推薦景點（同城市、排除自身）
  const filtered = originalData.filter((spot) => {
    const inCity =
      spot.City?.includes(normalizedCity) ||
      spot.Address?.startsWith(normalizedCity);

    return inCity && spot.ScenicSpotID !== excludeId;
  });

  // 隨機挑選資料(最多 4 筆)
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 4);

  // 格式化回傳結果
  const result: IResultItem[] = selected.map((spot) => {
    // 根據 ID 找出對應的翻譯資料
    const translated = translatedData.find(
      (t) => t.ScenicSpotID === spot.ScenicSpotID,
    );

    // 優先使用翻譯名稱，沒有就用原始名稱
    return {
      id: spot.ScenicSpotID,
      name:
        translated?.[`ScenicSpotName${langSuffix}`] ||
        spot.ScenicSpotName ||
        "",
      image: spot.Picture?.PictureUrl1 || "/images/default.jpg",
      city: translated?.[`City${langSuffix}`] || spot.City || "",
      link: `/spots/${spot.ScenicSpotID}`,
    };
  });

  return result;
});
