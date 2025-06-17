/**
 * API：節慶活動搜尋功能（支援多語系）
 *
 * 功能說明：
 * - 根據查詢條件（縣市、主題、關鍵字、日期）篩選活動
 * - 支援多語系翻譯與分頁功能，支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 使用的快取有：
 * - (1) translatedEventsCache：所有活動的多語系翻譯資料（本地 JSON 檔）
 * - (2) searchEventsCache_[城市]_[語言]：某個城市＋語系的活動快取資料（含合併圖片）
 *
 * 備註：跟 spots/search.ts 大同小異，差別在於：
 * (1) 取得的資料不同 (取得資料是活動)
 * (2) 篩選條件不同（多了檢查日期是否已結束）
 */

// 匯入共用函式和工具
// @ts-ignore (若不寫的話，TS中"#internal/nitro"會報錯)
import { useStorage } from "#internal/nitro";
import { getTDXAccessToken } from "@/server/utils/getAccessToken";
import { getQuery } from "#imports";
import { getCachedEvents } from "@/server/utils/getCachedEvents";
import type { Storage } from "unstorage";

const config = useRuntimeConfig();

const CACHE_KEY = "searchEventsCache";
const CACHE_DURATION = 1000 * 60 * 60 * 2; // 快取時間：24 小時（毫秒）

// 定義 TDX 原始資料格式
interface IEventItem {
  ActivityID: string;
  ActivityName?: string;
  City?: string;
  StartTime?: string | null;
  EndTime?: string | null;
  Class1?: string;
  Class2?: string;
  Picture?: {
    PictureUrl1?: string;
    PictureUrl2?: string;
    [key: string]: string | undefined;
  };
  [key: string]: any;
}

// 定義加上翻譯欄位的格式
interface ITranslatedEvent extends IEventItem {
  ActivityName_en?: string;
  ActivityName_ja?: string;
  City_en?: string;
  City_ja?: string;
}

// 定義最終回傳給前端的格式（已篩選並格式化）
interface IFormattedEvent {
  id: string;
  name: string;
  city: string;
  image: string;
  link: string;
}

// 載入翻譯的JSON資料（內容來自本地 JSON），並從 TDX API 合併 活動時間 StartTime / EndTime
async function loadTranslatedEvents(
  storage: Storage,
): Promise<ITranslatedEvent[]> {
  const cacheKey = "translatedEventsCache_v1";
  const now = Date.now();

  const cached = await storage.getItem<{
    data: ITranslatedEvent[];
    timestamp: number;
  }>(cacheKey);

  // 判斷目前的快取資料是不是「需要重新撈資料」
  // 如果快取有資料、沒過期、也有時間欄位(StartTime、EndTime)，就使用快取
  // 反之，則重新撈資料並更新快取
  const needsReload =
    !cached?.data?.length ||
    now - cached.timestamp > CACHE_DURATION ||
    !cached.data[0]?.StartTime ||
    !cached.data[0]?.EndTime;

  if (!needsReload) {
    return cached.data;
  }

  try {
    const url = `${config.public.appBaseUrl}/data/translated/events.json`;
    const translated: ITranslatedEvent[] = await $fetch(url);

    // 補充：為什麼會需要用到 getTDXAccessToken？
    // 因為活動資料有「開始與結束時間」，會影響是否顯示在前端（如已過期則不顯示）
    // 如果只使用快取資料，就無法即時反映活動是否已結束
    const token = await getTDXAccessToken(
      config.tdxClientId,
      config.tdxClientSecret,
    );

    const tdxData = await $fetch<IEventItem[]>(
      "https://tdx.transportdata.tw/api/basic/v2/Tourism/Activity",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const tdxMap = new Map(tdxData.map((item) => [item.ActivityID, item]));

    const merged = translated.map((item: ITranslatedEvent) => {
      const original = tdxMap.get(item.ActivityID);
      return {
        ...item,
        StartTime: original?.StartTime || null,
        EndTime: original?.EndTime || null,
      };
    });

    await storage.setItem(cacheKey, { data: merged, timestamp: now });
    return merged;
  } catch (err) {
    console.error("❌ 讀取活動資料失敗：", err as Error);
    return [];
  }
}

// 篩選出符合條件的活動，條件如下：
// (1) 符合所選的城市名稱
// (2) 活動名稱是否包含輸入的關鍵字（支援多個關鍵字與多語系）
// (3) 符合所選的主題類別（Class1)
// (4) 排除當前活動 ID（例如從 /events/[id] 點進來時）
// (5) 日期條件落在 StartTime ~ EndTime 範圍內
// 排除 沒有城市的資料、已經結束的活動
function filterEvents(
  data: ITranslatedEvent[],
  {
    city = "",
    keyword = "",
    class1 = "",
    date = "",
    lang = "zh-TW",
    excludeId = "",
  }: {
    city?: string;
    keyword?: string;
    class1?: string;
    date?: string;
    lang?: string;
    excludeId?: string;
  },
): ITranslatedEvent[] {
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  // 關鍵字處理：
  // 把關鍵字變成陣列（例如「夜景 景觀」會變成 ["夜景", "景觀"]）
  const keywords = keyword.toLowerCase().split(" ").filter(Boolean);

  return data.filter((item) => {
    // 條件 1：活動名稱要包含關鍵字（不區分大小寫）
    const name = (
      item["ActivityName" + langSuffix] ||
      item.ActivityName ||
      ""
    ).toLowerCase();

    const matchKeyword =
      keywords.length === 0 || keywords.some((k) => name.includes(k));

    // 條件 2：主題類別比對
    const matchClass =
      !class1 || item.Class1?.toLowerCase() === class1.toLowerCase();

    // 條件 3：城市名稱比對
    const cityName = item.City || "";
    const matchCity = !city || cityName === city;

    // 條件 4：排除指定的活動 ID（用在推薦活動時避免重複顯示）
    const notExcluded = !excludeId || item.ActivityID !== excludeId;

    // 排除沒有城市的資料
    const hasValidCity = !!cityName;

    // 排除已經結束的活動
    const notEnded =
      item.EndTime && new Date(item.EndTime).getTime() >= Date.now();

    // 條件 5：日期條件篩選
    const matchDate = (() => {
      if (!date) return true;
      if (!item.StartTime || !item.EndTime) return true;

      // 日期條件落在 StartTime ~ EndTime 範圍內
      const target = new Date(date).getTime();
      const start = new Date(item.StartTime).getTime();
      const end = new Date(item.EndTime).getTime();

      return target >= start && target <= end;
    })();

    return (
      matchKeyword &&
      matchClass &&
      matchCity &&
      hasValidCity &&
      notEnded &&
      matchDate &&
      notExcluded
    );
  });
}

//  將過濾後資料轉成前端需要的格式：
/**
{
  "id": "活動 ID",
  "name": "活動名稱（多語系）",
  "city": "城市名稱（多語系）",
  "image": "圖片網址",
  "link": "/events/xxx"
}
*/
function formatEvents(
  data: ITranslatedEvent[],
  lang: string = "zh-TW",
): IFormattedEvent[] {
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  return data.map((item) => {
    return {
      id: item.ActivityID,
      name: item["ActivityName" + langSuffix] || item.ActivityName,
      city: item["City" + langSuffix] || item.City || "未知地區",
      image:
        item?.Picture?.PictureUrl1 ||
        item?.Picture?.PictureUrl2 ||
        "/images/default.jpg",
      link: "/events/" + item.ActivityID,
    };
  });
}

// 取得 搜尋結果 的主函式
export default defineEventHandler(async (event) => {
  // 把每個參數值轉成字串（避免 undefined 或其他型別造成錯誤）
  // 如果沒有傳參數，則使用預設值（""、"1"、"12"、"zh-TW"...）
  const query = getQuery(event);
  const city = String(query.city || "");
  const keyword = String(query.keyword || "");
  const class1 = String(query.class1 || "");
  const date = String(query.date || "");
  const page = parseInt(String(query.page || "1"), 10);
  const limit = parseInt(String(query.limit || "12"), 10);
  const lang = String(query.lang || "zh-TW");
  const excludeId = String(query.excludeId || "");

  const storage = useStorage();
  const now = Date.now();

  // 組合「多語系快取的 Key」名稱
  // 目的：讓每種語言和城市都能分開儲存快取
  const langCacheKey = CACHE_KEY + "_" + (city || "all") + "_" + lang;

  // 檢查：「某個城市 + 某種語言」的快取是否存在
  // eventsByCityLang：指「某個城市 + 某種語言」所有的活動資料
  let eventsByCityLang = await storage.getItem<{
    data: ITranslatedEvent[];
    timestamp: number;
  }>(langCacheKey);

  // 如果快取不存在或快取過期，則重新撈取資料並更新快取
  if (!eventsByCityLang || now - eventsByCityLang.timestamp > CACHE_DURATION) {
    const translated = await loadTranslatedEvents(storage);
    eventsByCityLang = { data: translated, timestamp: now };
    await storage.setItem(langCacheKey, eventsByCityLang);
  }

  // 合併圖片資料（從 原始資料 合併到 翻譯資料 中）
  const originalEvents = await getCachedEvents(storage);
  const imageMap = new Map(
    originalEvents.map((item: IEventItem) => [item.ActivityID, item.Picture]),
  );

  // 合併圖片進翻譯資料
  eventsByCityLang.data = eventsByCityLang.data.map(
    (item: ITranslatedEvent) => ({
      ...item,
      Picture: imageMap.get(item.ActivityID),
    }),
  );

  // 避免資料為 undefined，預設會是空陣列
  const rawData = eventsByCityLang?.data || [];

  // 取得活動資料後，先過濾符合查詢條件的資料
  // 然後根據頁數與每頁筆數進行分頁，最後只回傳該頁資料
  const filtered = filterEvents(rawData, {
    city,
    keyword,
    class1,
    date,
    lang,
    excludeId,
  });

  // 分頁處理
  const total = filtered.length; // 資料總筆數
  const start = (page - 1) * limit; // 根據頁數算出從第幾筆資料開始抓
  const paged = filtered.slice(start, start + limit); // 取出目前這一頁要顯示的資料

  return {
    data: formatEvents(paged, lang),
    total,
  };
});
