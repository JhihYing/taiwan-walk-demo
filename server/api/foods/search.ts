/**
 * API：品嚐美食搜尋功能（支援多語系）
 *
 * 功能說明：
 * - 根據查詢條件（縣市、主題、關鍵字）篩選美食
 * - 支援多語系翻譯與分頁功能，支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 使用的快取有：
 * - (1) translatedFoodsCache：所有美食的多語系翻譯資料（本地 JSON 檔）
 * - (2) searchFoodsCache_[城市]_[語言]：某個城市＋語系的美食快取資料（含合併圖片）
 *
 * 備註：跟 spots/search.ts 是一樣的，差別在於取得的資料不同
 */

// 匯入共用函式和工具
// @ts-ignore (若不寫的話，TS中"#internal/nitro"會報錯)
import { useStorage } from "#internal/nitro";
import { getQuery } from "#imports";
import { getCachedFoods } from "@/server/utils/getCachedFoods";
import { loadTranslatedData } from "@/server/utils/loadTranslatedData";

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 快取時間：24 小時（毫秒）
const CACHE_KEY = "searchFoodsCache";

// 定義 TDX 原始資料格式
interface IFoodItem {
  RestaurantID: string;
  RestaurantName?: string;
  City?: string;
  Class?: string;
  Picture?: {
    PictureUrl1?: string;
    PictureUrl2?: string;
    [key: string]: string | undefined;
  };
  [key: string]: any;
}

// 定義加上翻譯欄位的格式
interface ITranslatedFood extends IFoodItem {
  RestaurantName_en?: string;
  RestaurantName_ja?: string;
  City_en?: string;
  City_ja?: string;
}

// 定義最終回傳給前端的格式（已篩選並格式化）
interface IFormattedFood {
  id: string;
  name: string;
  city: string;
  image: string;
  link: string;
}

// 篩選出符合條件的美食，條件如下：
// (1) 符合所選的城市名稱
// (2) 美食名稱是否包含輸入的關鍵字（支援多個關鍵字與多語系）
// (3) 符合所選的主題類別（Class 或 Class1)
// (4) 排除當前美食 ID（例如從 /foods/[id] 點進來時）
function filterFoods(
  data: ITranslatedFood[],
  {
    city = "",
    keyword = "",
    class1 = "",
    lang = "zh-TW",
    excludeId = "",
  }: {
    city?: string;
    keyword?: string;
    class1?: string;
    lang?: string;
    excludeId?: string;
  },
): ITranslatedFood[] {
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  // 關鍵字處理：
  // 把關鍵字變成陣列（例如「夜景 景觀」會變成 ["夜景", "景觀"]）
  const keywords = keyword.toLowerCase().split(" ").filter(Boolean);

  return data.filter((item) => {
    // 條件 1：美食名稱要包含關鍵字（不區分大小寫）
    const name = (
      item["RestaurantName" + langSuffix] ||
      item.RestaurantName ||
      ""
    ).toLowerCase();

    const matchKeyword =
      keywords.length === 0 || keywords.some((k) => name.includes(k));

    // 條件 2：主題類別比對
    const matchClass =
      !class1 || item.Class?.toLowerCase() === class1.toLowerCase();

    // 條件 3：城市名稱比對
    const cityName = item.City || "";
    const matchCity = !city || cityName === city;

    // 條件 4：排除指定的美食 ID（用在推薦美食時避免重複顯示）
    const notExcluded = !excludeId || item.RestaurantID !== excludeId;

    return matchKeyword && matchClass && matchCity && cityName && notExcluded;
  });
}

//  將過濾後資料轉成前端需要的格式：
/**
{
  "id": "美食 ID",
  "name": "美食名稱(多語系)",
  "city": "城市名稱(多語系)",
  "image": "圖片網址",
  "link": "/foods/xxx"
}
*/
function formatFoods(
  data: ITranslatedFood[],
  lang: string = "zh-TW",
): IFormattedFood[] {
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  return data.map((item) => {
    return {
      id: item.RestaurantID,
      name: item["RestaurantName" + langSuffix] || item.RestaurantName,
      city: item["City" + langSuffix] || item.City || "未知地區",
      image:
        item?.Picture?.PictureUrl1 ||
        item?.Picture?.PictureUrl2 ||
        "/images/default.jpg",
      link: "/foods/" + item.RestaurantID,
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
  // 補充：foodsByCityLang：指「某個城市 + 某種語言」所有的美食資料
  let foodsByCityLang = await storage.getItem<{
    data: ITranslatedFood[];
    timestamp: number;
  }>(langCacheKey);

  // 如果快取不存在或快取過期，則重新撈取資料並更新快取
  if (!foodsByCityLang || now - foodsByCityLang.timestamp > CACHE_DURATION) {
    const translated = await loadTranslatedData<ITranslatedFood>({
      cacheKey: "translatedFoodsCache_v1",
      fileName: "foods.json",
    });
    foodsByCityLang = { data: translated, timestamp: now };
    await storage.setItem(langCacheKey, foodsByCityLang);
  }

  // 合併圖片資料（從 原始資料 合併到 翻譯資料 中）
  const originalFoods = await getCachedFoods(storage);
  const imageMap = new Map(
    originalFoods.map((item: IFoodItem) => [item.RestaurantID, item.Picture]),
  );

  foodsByCityLang.data = foodsByCityLang.data.map((item: ITranslatedFood) => ({
    ...item,
    Picture: imageMap.get(item.RestaurantID),
  }));

  // 避免資料為 undefined，預設會是空陣列
  const rawData = foodsByCityLang?.data || [];

  // 取得美食資料後，先過濾符合查詢條件的資料
  // 然後根據頁數與每頁筆數進行分頁，最後只回傳該頁資料
  const filtered = filterFoods(rawData, {
    city,
    keyword,
    class1,
    lang,
    excludeId,
  });

  // 分頁處理
  const total = filtered.length; // 資料總筆數
  const start = (page - 1) * limit; // 根據頁數算出從第幾筆資料開始抓
  const paged = filtered.slice(start, start + limit); // 取出目前這一頁要顯示的資料

  return {
    data: formatFoods(paged, lang),
    total,
  };
});
