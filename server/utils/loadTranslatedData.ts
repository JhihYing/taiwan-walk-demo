/**
 * 目的：共用載入本地翻譯 JSON 的工具函式（景點 / 美食 / 活動）
 *
 * 功能說明：
 * - 根據傳入的 key 與檔案路徑，從本地 JSON 讀取翻譯資料
 * - 快取資料與時間戳，避免重複讀檔造成效能浪費
 */

// 匯入共用函式和工具
// @ts-ignore (若不寫的話，TS中"#internal/nitro"會報錯)
import { useStorage } from "#internal/nitro";
import type { Storage } from "unstorage";

interface ICacheData<T> {
  data: T[];
  timestamp: number;
}

// 載入 翻譯資料 的主函式
// 預設使用 useStorage() 快取
export async function loadTranslatedData<T>({
  storage = useStorage(), // 預設使用 useStorage()
  cacheKey,
  fileName,
  cacheDuration = 1000 * 60 * 60 * 24, // 預設快取時間：24 小時（毫秒）
}: {
  storage?: Storage;
  cacheKey: string;
  fileName: string; // 本地翻譯JSON檔名（如 "foods.json"）
  cacheDuration?: number;
}): Promise<T[]> {
  const now = Date.now();

  const cached = await storage.getItem<ICacheData<T>>(cacheKey);

  // 檢查翻譯後的快取是否存在且尚未過期
  // 符合的話，則撈取快取資料
  if (
    cached &&
    Array.isArray(cached.data) &&
    cached.data.length > 0 &&
    now - cached.timestamp < cacheDuration
  ) {
    return cached.data;
  }

  // 反之，則重新撈取資料並更新快取
  try {
    const config = useRuntimeConfig();
    const url = `${config.public.appBaseUrl}/data/translated/${fileName}`;
    const data: T[] = await $fetch(url);

    await storage.setItem(cacheKey, { data, timestamp: now });
    return data;
  } catch (err) {
    console.error(`❌ 讀取翻譯資料失敗：${fileName}`, err);
    return [];
  }
}
