/**
 * API：首頁「活動」清單（支援多語系）
 *
 * 功能說明：
 * - 選出 4 筆 有圖片 + 有城市名稱 + 尚未結束 的活動 (由舊到新排列)
 * - 支援多語系翻譯（名稱、城市），支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取(原始資料、翻譯資料、4筆活動ID)，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 使用的快取有：
 * - (1) translatedEventsCache : 所有活動的多語系翻譯資料 (本地JSON檔)
 * - (2) langCache :前端直接用來渲染畫面的資料，包含翻譯後的資料。(目的：節省處理時間，避免每次重組資料)
 *
 * 備註：跟 spots/home.ts 大同小異，差別在於：
 * (1) 取得的資料不同 (取得資料是活動)
 * (2) 篩選條件不同（多了檢查日期是否已結束）
 * (3) 沒有使用隨機挑選，而是按照尚未結束的活動，由舊到新(日期)排列
 */

// 匯入共用函式和工具
// @ts-ignore (若不寫的話，TS中"#internal/nitro"會報錯)
import { useStorage } from "#internal/nitro";
import { getQuery } from "#imports";
import { getCachedEvents } from "@/server/utils/getCachedEvents";
import { loadTranslatedData } from "@/server/utils/loadTranslatedData";

// 設定快取的 key 與有效時間
const CACHE_KEY = "hotEvents";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 快取時間：24 小時（毫秒）

// 定義最終回傳給前端的格式（已篩選並格式化）
interface IFormattedEvent {
  id: string;
  name: string;
  city: string;
  date: string;
  image: string;
  link: string;
}

// 定義本地翻譯的資料格式
interface ITranslatedEvent {
  ActivityID: string;
  [key: string]: string;
}

// 定義 TDX 原始資料格式
interface IEventItem {
  ActivityID: string;
  ActivityName?: string;
  City?: string;
  StartTime?: string;
  EndTime?: string;
  Picture?: {
    PictureUrl1?: string;
  };
}

// 取得 活動 的主函式
export default defineEventHandler(async (event): Promise<IFormattedEvent[]> => {
  const { lang = "zh-TW" } = getQuery(event);
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  const storage = useStorage();
  const now = Date.now();

  // 根據主快取 key ，動態產生出不同用途的快取 key 名稱
  const langCacheKey = `${CACHE_KEY}_${lang}`;

  // 載入翻譯後的活動快取資料
  const translatedEvents = await loadTranslatedData<ITranslatedEvent>({
    cacheKey: "translatedEventsCache_v1",
    fileName: "events.json",
  });

  // 載入原始快取資料
  // 目的：取得所有活動資料，供後續篩選與翻譯使用
  const originEvents: IEventItem[] = await getCachedEvents();

  // 檢查語言快取是否存在且尚未過期
  // 符合的話，則撈取快取資料
  // 反之，則會篩選並格式化資料，重新撈取並快取起來
  const langCached = await storage.getItem<{
    data: IFormattedEvent[];
    timestamp: number;
  }>(langCacheKey);

  if (langCached && now - langCached.timestamp < CACHE_DURATION) {
    return langCached.data;
  }

  // 篩選出 有圖片 + 有城市 + 有結束時間(EndTime)且尚未結束 的活動資訊 (避免 UI 顯示不完整)
  const filtered = originEvents.filter((item) => {
    const hasImage = !!item.Picture?.PictureUrl1;
    const hasCity = !!item.City;

    if (!item.EndTime) return false; // 如果活動沒有結束時間(EndTime)，就排除

    // 判斷活動是否尚未結束 (把 EndTime 轉成時間戳（毫秒數），然後和「現在時間」相比)
    const notEnded = new Date(item.EndTime).getTime() >= now;
    return hasImage && hasCity && notEnded;
  });

  // 將篩選後的資料進行排序：進行中 > 尚未開始 (若兩者都是進行中或尚未開始，則依據開始時間由早到晚排序)
  const sorted = filtered.sort((a, b) => {
    if (!a.StartTime || !a.EndTime || !b.StartTime || !b.EndTime) return 0; // 如果沒有活動的開始時間、結束時間，就不排序，

    // 把開始、結束時間轉為毫秒 (用來比較 timestamp（毫秒數）)
    const aStart = new Date(a.StartTime).getTime();
    const aEnd = new Date(a.EndTime).getTime();
    const bStart = new Date(b.StartTime).getTime();
    const bEnd = new Date(b.EndTime).getTime();

    // 判斷活動是否正在進行中：
    // status = 0：活動正在進行
    // status = 1：活動還沒開始或已結束
    const aStatus = now >= aStart && now <= aEnd ? 0 : 1;
    const bStatus = now >= bStart && now <= bEnd ? 0 : 1;

    // 如果一個是進行中（0），另一個是還沒開始（1），就會讓進行中的排前面
    if (aStatus !== bStatus) return aStatus - bStatus;

    // 如果 status 一樣（例如都是進行中 or 都還沒開始），就改用開始時間比較：開始時間越早 → 越前面
    return aStart - bStart;
  });

  // 將排序好的資料選出前4筆
  const selected = sorted.slice(0, 4);

  // 依據活動 ID，組合相關資料，回傳給前端統一格式
  const formatted = selected
    .map((item): IFormattedEvent | null => {
      const translated = translatedEvents.find(
        (t) => t.ActivityID === item.ActivityID,
      );

      const city = translated?.[`City${langSuffix}`] || item.City;

      // 如果找不到城市 or 沒有開始時間 or 沒有結束時間，就略過此筆
      if (!city || !item.StartTime || !item.EndTime) return null;

      const name =
        translated?.[`ActivityName${langSuffix}`] || item.ActivityName;

      // 把開始、結束時間轉為毫秒
      const start = new Date(item.StartTime);
      const end = new Date(item.EndTime);

      // 將活動開始與結束日期改成指定格式：
      // 轉換前：Wed Jun 11 2025 00:00:00 GMT+0800 (Taipei Standard Time)
      // 轉換後：2025/06/11 - 2025/06/30
      const formatDate = (d: Date) =>
        `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
          .getDate()
          .toString()
          .padStart(2, "0")}`;
      const dateRange = `${formatDate(start)} - ${formatDate(end)}`;

      return {
        id: item.ActivityID,
        name: name || "",
        image: item.Picture?.PictureUrl1 || "",
        city,
        date: dateRange,
        link: `/events/${item.ActivityID}`,
      };
    })
    .filter(Boolean) as IFormattedEvent[]; // // 過濾掉 map 中產生的 null，保證資料完整

  //  將 處理後的資料 和 資料撈取的時間戳 存入快取
  await storage.setItem(langCacheKey, {
    data: formatted,
    timestamp: now,
  });

  return formatted;
});
