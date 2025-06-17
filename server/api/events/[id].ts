/**
 * API：活動詳細資料（支援多語系）
 *
 * 功能說明：
 * - 根據 ID 回傳對應活動詳細資料
 * - 支援多語系翻譯，支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 使用的快取有：
 * - (1) translatedEventsCache：所有活動的多語系翻譯資料（本地 JSON 檔）
 *
 * 備註：跟 spots/[id].ts 大同小異，差別在於：
 * (1) 多了活動時間格式處理（輸出格式：YYYY/MM/DD HH:mm）
 *
 */

// 匯入共用函式和工具
import { getCachedEvents } from "@/server/utils/getCachedEvents";
import { getQuery } from "#imports";
import { loadTranslatedData } from "@/server/utils/loadTranslatedData";

// 定義 TDX 原始資料格式
interface IEventItem {
  ActivityID: string;
  ActivityName?: string;
  Description?: string;
  Address?: string;
  Phone?: string;
  City?: string;
  WebsiteUrl?: string;
  StartTime?: string;
  EndTime?: string;
  Class1?: string;
  Class2?: string;
  Picture?: {
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

// 活動時間格式處理（輸出格式：YYYY/MM/DD HH:mm）
function formatDateTime(datetime: string): string {
  const date = new Date(datetime);
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  const hh = `${date.getHours()}`.padStart(2, "0");
  const min = `${date.getMinutes()}`.padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

// 取得 活動詳細資料 的主函式
export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined; // 抓出活動 ID
  const { lang = "zh-TW" } = getQuery(event) as { lang?: string };
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  // 如果沒有id，就會報錯
  if (!id) {
    throw createError({ statusCode: 400, message: "缺少活動 ID" });
  }

  // 從快取取得「翻譯資料」與「原始資料」
  const [originalData, translatedData]: [IEventItem[], ITranslatedEvent[]] =
    await Promise.all([
      getCachedEvents(),
      loadTranslatedData<ITranslatedEvent>({
        cacheKey: "translatedEventsCache_v1",
        fileName: "events.json",
      }),
    ]);

  // 根據 ID 找出對應的該筆資料（原始與翻譯）
  // 目的：因為要整合它們，回傳完整的多語系活動資訊
  const origin = originalData.find((item) => item.ActivityID === id);
  const translated = translatedData.find((item) => item.ActivityID === id);

  // 如果找不到「原始資料」或「翻譯資料」就會報錯
  if (!origin || !translated) {
    throw createError({ statusCode: 404, message: `找不到活動 ID：${id}` });
  }

  // 圖片處理（最多10張）(若沒有圖片就使用預設圖片)
  const images: string[] = [];
  const pictureData = origin.Picture as Record<string, string | undefined>;
  for (let i = 1; i <= 10; i++) {
    const url = pictureData[`PictureUrl${i}`];
    if (url) images.push(url);
  }
  if (images.length === 0) {
    images.push("/images/default.jpg");
  }

  // 處理城市名稱 (優先使用翻譯名稱，沒有就用原始名稱)
  let city = translated[`City${langSuffix}`] || origin.City || "";

  // 補救機制：如果 city 變數還是空的（翻譯和原始都沒有城市名稱），那就用地址來推測城市
  if (!city && translated.Address) {
    const addr = translated[`Address${langSuffix}`] || origin.Address || "";
    city =
      lang === "zh-TW"
        ? addr.slice(0, 3)
        : addr.match(/^([^,，\d]+)/)?.[1]?.trim() || "Unknown";
  }

  // 分類標籤（Class1）
  // 優先使用翻譯名稱，沒有就用原始名稱
  const classTags: string[] = [];
  for (let i = 1; i <= 2; i++) {
    const key = `Class${i}`;
    const translatedVal = translated?.[`${key}${langSuffix}`];
    const fallbackVal = origin?.[key];

    if (typeof translatedVal === "string" && translatedVal.trim()) {
      classTags.push(translatedVal);
    } else if (fallbackVal?.trim()) classTags.push(fallbackVal);
  }

  // 活動時間格式化（StartTime ~ EndTime）
  // 格式為 2024/11/14 00:00 - 2025/12/31 00:00
  let openTime = "";
  if (origin.StartTime && origin.EndTime) {
    const start = formatDateTime(origin.StartTime);
    const end = formatDateTime(origin.EndTime);
    openTime = `${start} - ${end}`;
  }

  // 優先使用翻譯名稱，沒有就用原始名稱
  return {
    id,
    name: translated[`ActivityName${langSuffix}`] || origin.ActivityName || "",
    description:
      translated[`Description${langSuffix}`] ||
      origin.DescriptionDetail ||
      origin.Description ||
      "",
    city,
    address: translated[`Address${langSuffix}`] || origin.Address || "",
    openTime,
    phone: origin.Phone || "",
    website: origin.WebsiteUrl || "",
    position: origin.Position || null,
    images,
    classTags,
  };
});
