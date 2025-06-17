/**
 * API：取得首頁「熱門景點」清單（支援多語系）
 *
 * 功能說明：
 * - 隨機選出 4 筆 有圖片 + 有城市名稱 的景點
 * - 支援多語系翻譯（名稱、城市），支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取(原始資料、翻譯資料、4筆景點ID)，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 使用的快取有：
 * - (1) translatedSpotsCache : 所有景點的多語系翻譯資料 (本地JSON檔)
 * - (2) baseCache :隨機抽出的 4 筆景點 ID (目的：切換語言時，能夠顯示相同景點)
 * - (3) langCache :前端直接用來渲染畫面的資料，包含翻譯後的資料。(目的：節省處理時間，避免每次重組資料)
 */

// 匯入共用函式和工具
// @ts-ignore (若不寫的話，TS中"#internal/nitro"會報錯)
import { useStorage } from "#internal/nitro";
import { getQuery } from "#imports";
import { getCachedSpots } from "@/server/utils/getCachedSpots";
import { loadTranslatedData } from "@/server/utils/loadTranslatedData";

// 設定快取的 key 與有效時間
const CACHE_KEY = "hotScenicSpots";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 快取時間：24 小時（毫秒）

// 定義最終回傳給前端的格式（已篩選並格式化）
interface IFormattedSpot {
  id: string;
  name: string;
  city: string;
  image: string;
  link: string;
}

// 定義本地翻譯的資料格式
interface ITranslatedSpot {
  ScenicSpotID: string;
  [key: string]: string;
}

// 定義 TDX 原始資料格式
interface ISpotItem {
  ScenicSpotID: string;
  ScenicSpotName?: string;
  City?: string;
  Picture?: {
    PictureUrl1?: string;
  };
  PictureUrl?: string;
}

// 取得 熱門景點 的主函式
export default defineEventHandler(async (event): Promise<IFormattedSpot[]> => {
  // 取得URL中的語言參數，預設為繁體中文
  const { lang = "zh-TW" } = getQuery(event);

  // 根據取得URL的語言參數，決定翻譯資料欄位的後綴（如 ScenicSpotName_ja）
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  const storage = useStorage();
  const now = Date.now();

  // 根據主快取 key ，動態產生出不同用途的快取 key 名稱
  const baseCacheKey = `${CACHE_KEY}_base`;
  const langCacheKey = `${CACHE_KEY}_${lang}`;

  // 載入翻譯後的景點快取資料
  const translatedSpots = await loadTranslatedData<ITranslatedSpot>({
    cacheKey: "translatedSpotsCache_v1",
    fileName: "spots.json",
  });

  // 載入原始快取資料
  // 目的：取得所有景點資料，供後續篩選與翻譯使用
  const originSpots: ISpotItem[] = await getCachedSpots();

  // 檢查語言快取是否存在且尚未過期
  // 符合的話，則撈取快取資料
  // 反之，則會篩選並格式化資料，重新撈取並快取起來
  const langCached = await storage.getItem<{
    data: IFormattedSpot[];
    timestamp: number;
  }>(langCacheKey);

  if (langCached && now - langCached.timestamp < CACHE_DURATION) {
    return langCached.data;
  }

  // 篩選出 有圖片 + 有城市 的景點資訊 (避免 UI 顯示不完整)
  const availableItems = originSpots.filter((item) => {
    const hasImage = item.Picture?.PictureUrl1 || item.PictureUrl;
    const city = item.City;
    return hasImage && city;
  });

  // 從篩選後的資料中，取得所有景點的 ID
  const availableIds = availableItems.map((item) => item.ScenicSpotID);

  // 接著，從快取讀取 baseCacheKey（之前選出的 4 筆景點 ID）
  // 若快取存在的話，則直接使用這組快取資料
  let baseCache = await storage.getItem<{ ids: string[]; timestamp: number }>(
    baseCacheKey,
  );

  // 反之，快取不存在或是過期的話，則會先隨機選出 4 筆熱門景點資料，重新撈取並快取起來
  if (!baseCache || now - baseCache.timestamp > CACHE_DURATION) {
    const shuffled = availableIds.sort(() => 0.5 - Math.random()).slice(0, 4);
    baseCache = { ids: shuffled, timestamp: now };
    await storage.setItem(baseCacheKey, baseCache);
  }

  // 依據景點 ID，組合相關資料，回傳給前端統一格式
  const formatted = (baseCache.ids as string[])
    .map((id: string) => {
      // 根據 baseCache 的 ID 找出原始資料與對應翻譯
      const translated = translatedSpots.find((t) => t.ScenicSpotID === id);
      const origin = originSpots.find((o) => o.ScenicSpotID === id);

      // 如果找不到對應資料或缺城市，就略過此筆
      if (!translated || !origin) return null;
      const city = translated[`City${langSuffix}`] || origin.City;
      if (!city) return null;

      const image = origin.Picture?.PictureUrl1 || origin.PictureUrl;

      return {
        id,
        name:
          translated[`ScenicSpotName${langSuffix}`] || origin.ScenicSpotName,
        city,
        image,
        link: `/spots/${id}`,
      };
    })
    .filter(Boolean) as IFormattedSpot[]; // 過濾掉 map 中產生的 null，保證資料完整

  // 將 處理後的資料 和 資料撈取的時間戳 存入快取
  await storage.setItem(langCacheKey, {
    data: formatted,
    timestamp: now,
  });

  return formatted;
});
