/**
 * API：景點詳細資料（支援多語系）
 *
 * 功能說明：
 * - 根據 ID 回傳對應景點詳細資料
 * - 支援多語系翻譯，支援語言：zh-TW / en-US / ja-JP
 * - 使用 useStorage()快取，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 使用的快取有：
 * - (1) translatedSpotsCache：所有景點的多語系翻譯資料（本地 JSON 檔）
 */

// 匯入共用函式和工具
import { getCachedSpots } from "@/server/utils/getCachedSpots";
import { getQuery } from "#imports";
import { loadTranslatedData } from "@/server/utils/loadTranslatedData";

// 定義 TDX 原始資料格式
interface ISpotItem {
  ScenicSpotID: string;
  ScenicSpotName?: string;
  DescriptionDetail?: string;
  City?: string;
  Address?: string;
  Phone?: string;
  WebsiteUrl?: string;
  OpenTime?: string;
  TicketInfo?: string;
  Remarks?: string;
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
interface ITranslatedSpot {
  ScenicSpotID: string;
  [key: string]: string;
}

// 取得 景點詳細資料 的主函式
export default defineEventHandler(async (event) => {
  const id = event.context.params?.id as string | undefined; // 抓出景點 ID
  const { lang } = getQuery(event) as { lang?: string };
  const langSuffix = lang === "en-US" ? "_en" : lang === "ja-JP" ? "_ja" : "";

  // 如果沒有id，就會報錯
  if (!id) {
    throw createError({ statusCode: 400, message: "缺少景點 ID" });
  }

  // 從快取取得「翻譯資料」與「原始資料」
  const [originalData, translatedData]: [ISpotItem[], ITranslatedSpot[]] =
    await Promise.all([
      getCachedSpots(),
      loadTranslatedData<ITranslatedSpot>({
        cacheKey: "translatedSpotsCache_v1",
        fileName: "spots.json",
      }),
    ]);

  // 根據 ID 找出對應的該筆資料（原始與翻譯）
  // 目的：因為要整合它們，回傳完整的多語系景點資訊
  const origin = originalData.find((item) => item.ScenicSpotID === id);
  const translated = translatedData.find((item) => item.ScenicSpotID === id);

  // 如果找不到「原始資料」或「翻譯資料」就會報錯
  if (!origin || !translated) {
    console.warn("❗️找不到對應景點資料", {
      id,
      originFound: !!origin,
      translatedFound: !!translated,
    });
    throw createError({ statusCode: 404, message: `找不到景點 ID：${id}` });
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

  // 分類標籤（Class1、Class2）
  // 優先使用翻譯名稱，沒有就用原始名稱
  const classTags = [];
  for (let i = 1; i <= 2; i++) {
    const key = `Class${i}`;
    const translatedVal = translated?.[`${key}${langSuffix}`];
    const fallbackVal = origin?.[key];

    if (typeof translatedVal === "string" && translatedVal.trim()) {
      classTags.push(translatedVal);
    } else if (fallbackVal?.trim()) classTags.push(fallbackVal);
  }

  // 處理開放時間文字
  // 如果是 "24 hours"，改寫成中文顯示：「全天候開放」
  let openTime = translated[`OpenTime${langSuffix}`] || origin.OpenTime || "";
  if (/24\s*hours/i.test(openTime)) {
    openTime = "全天候開放";
  }

  // 優先使用翻譯名稱，沒有就用原始名稱
  return {
    id,
    name:
      translated[`ScenicSpotName${langSuffix}`] || origin.ScenicSpotName || "",
    description:
      translated[`DescriptionDetail${langSuffix}`] ||
      translated[`Description${langSuffix}`] ||
      origin.DescriptionDetail ||
      origin.Description ||
      "",
    city,
    address: translated[`Address${langSuffix}`] || origin.Address || "",
    openTime,
    phone: origin.Phone || "",
    website: origin.WebsiteUrl || "",
    ticketInfo:
      translated[`TicketInfo${langSuffix}`] || origin.TicketInfo || "",
    remarks: translated[`Remarks${langSuffix}`] || origin.Remarks || "",
    position: origin.Position || null,
    images,
    classTags,
  };
});
