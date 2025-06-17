/**
 * 目的：取得來源名稱（支援多語系），用於「附近 xxx 公里內」的標題顯示
 *
 * 功能說明：
 * - 支援三種資料來源：景點、美食、活動
 * - 優先使用翻譯資料的名稱，若無則 fallback 原始資料
 * - 根據傳入的語系，自動套用欄位後綴（如 ScenicSpotName_ja）
 */

// 定義語系後綴對照表
const langMap: Record<string, string> = {
  "zh-TW": "",
  "en-US": "_en",
  "ja-JP": "_ja",
};

// 定義 TDX 原始資料格式
interface IOriginalSpot {
  ScenicSpotID: string;
  ScenicSpotName?: string;
}

interface IOriginalFood {
  RestaurantID: string;
  RestaurantName?: string;
}

interface IOriginalEvent {
  ActivityID: string;
  ActivityName?: string;
}

//  定義翻譯欄位的格式
interface ITranslatedSpot {
  ScenicSpotID: string;
  [key: string]: any;
}

interface ITranslatedFood {
  RestaurantID: string;
  [key: string]: any;
}

interface ITranslatedEvent {
  ActivityID: string;
  [key: string]: any;
}

// 定義函式參數格式
interface NearbySourceNameOptions {
  excludeId?: string;
  lang?: string;
  translatedSpots?: ITranslatedSpot[];
  translatedFoods?: ITranslatedFood[];
  translatedEvents?: ITranslatedEvent[];
  originalSpots?: IOriginalSpot[];
  originalFoods?: IOriginalFood[];
  originalEvents?: IOriginalEvent[];
}

// 取得 取得來源名稱，用於 nearby 標題顯示 的主函式
export function getNearbySourceName({
  excludeId,
  lang = "zh-TW",
  translatedSpots = [],
  translatedFoods = [],
  translatedEvents = [],
  originalSpots = [],
  originalFoods = [],
  originalEvents = [],
}: NearbySourceNameOptions): string {
  if (!excludeId) return "";

  const langSuffix = langMap[lang] ?? "";

  // 依據 ID 比對翻譯資料
  const fromSpot = translatedSpots.find((t) => t.ScenicSpotID === excludeId);
  const fromFood = translatedFoods.find((t) => t.RestaurantID === excludeId);
  const fromEvent = translatedEvents.find((t) => t.ActivityID === excludeId);

  // 若無資料，再比對原始資料
  const originSpot = originalSpots.find((t) => t.ScenicSpotID === excludeId);
  const originFood = originalFoods.find((t) => t.RestaurantID === excludeId);
  const originEvent = originalEvents.find((t) => t.ActivityID === excludeId);

  // 優先順序：翻譯 > 原始資料
  return (
    fromSpot?.[`ScenicSpotName${langSuffix}`] ||
    fromFood?.[`RestaurantName${langSuffix}`] ||
    fromEvent?.[`ActivityName${langSuffix}`] ||
    originSpot?.ScenicSpotName ||
    originFood?.RestaurantName ||
    originEvent?.ActivityName ||
    ""
  );
}
