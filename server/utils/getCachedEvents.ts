/**
 * 目的：從 TDX 取得『全台活動』資料，並將資料快取儲存
 *
 * 功能說明：
 * - 使用useStorage()快取，減少對 TDX API 的頻繁請求，避免造成效能浪費與流量超限
 *
 * 備註：跟 getCachedSpots.ts 是一樣的，差別在於取得的資料不同
 */

// 匯入共用函式和工具
import { getTDXAccessToken } from "./getAccessToken";
import { useRuntimeConfig, useStorage } from "#imports";

// 設定快取用的 key 與有效時間
const CACHE_KEY = "eventsCache";
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 快取有效時間：24 小時（毫秒）

// 定義 TDX 回傳的活動資料格式：
interface IEventItem {
  ActivityID: string;
  ActivityName?: string;
  Description?: string;
  Address?: string;
  Phone?: string;
  City?: string;
  Picture?: {
    PictureUrl1?: string;
    PictureDescription1?: string;
  };
  Position?: {
    PositionLon: number;
    PositionLat: number;
    GeoHash?: string;
  };
  Organizer?: string;
  StartTime?: string;
  EndTime?: string;
  WebsiteUrl?: string;
  [key: string]: any;
}

// 定義快取內容的資料格式：
interface ICacheData {
  data: IEventItem[]; // 活動資料
  timestamp: number; // 資料撈取的時間戳，用來判斷這筆資料是否過期
}

// 取得 全台活動 的主函式
// 預設使用 useStorage() 快取
export async function getCachedEvents(
  storage = useStorage(),
): Promise<IEventItem[]> {
  const now = Date.now();

  // 嘗試用 快取的key (eventsCache)，去讀取已快取的資料，並存入 cached 變數
  const cached = await storage.getItem<ICacheData>(CACHE_KEY);

  // 若快取存在且尚未過期，直接回傳資料
  // 補充：現在時間 - 快取時間 < 24 小時
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    console.log("[Cache] eventsCache 命中，直接回傳");
    return cached.data;
  }

  // 反之，若無快取或已過期，則重新向 TDX 取得 Token，再透過Token取得全台活動資料
  const config = useRuntimeConfig();

  // 向 TDX 取得 Token
  const accessToken = await getTDXAccessToken(
    config.tdxClientId,
    config.tdxClientSecret,
  );

  try {
    // 向 TDX 取得活動資料（回傳 JSON 陣列）
    const res = await $fetch<IEventItem[]>(
      "https://tdx.transportdata.tw/api/basic/v2/Tourism/Activity?$format=JSON&",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          "Accept-Encoding": "gzip, br",
        },
      },
    );

    // 把 TDX 拿到的資料 跟 當前時間 快取起來
    await storage.setItem(CACHE_KEY, {
      data: res,
      timestamp: now,
    });

    return res;
  } catch (err) {
    console.error("取得活動失敗：", err);
    throw new Error("無法取得活動資料");
  }
}
