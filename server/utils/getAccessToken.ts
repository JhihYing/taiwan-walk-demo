/**
 * 目的：取得 TDX 的 Access Token（通行證），供其他 API 使用
 *
 * 功能說明：
 * - 使用 OAuth2 client_credentials 模式向 TDX 申請 Access Token
 * - 快取 Token 與過期時間，避免頻繁請求造成效能浪費與流量超限
 */

// 定義 TDX token API 回傳的資料格式
interface ITokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// 定義全域變數
let cachedToken = ""; // 用來儲存 token
let tokenExpireTime = 0; // token 的過期時間

// 取得 Token 的主函式
export async function getTDXAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const now = Date.now();

  // 判斷 token 是否已經存入快取 cachedToken，並且尚未過期 → 若符合就會直接回傳 token
  if (cachedToken && now < tokenExpireTime) {
    return cachedToken;
  }

  // 若不符合的話，則會重新向 TDX 申請 Access Token
  try {
    const tokenRes = await $fetch<ITokenResponse>(
      "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      },
    );

    // 把取得 token 存起來，放進全域變數 cachedToken
    cachedToken = tokenRes.access_token;

    // 計算過期時間，並提前 1 分鐘作為保險
    // 避免因網路延遲或計時誤差，導致 token 剛好失效
    tokenExpireTime = now + tokenRes.expires_in * 1000 - 60_000;

    return cachedToken;
  } catch (err) {
    if (err instanceof Error) {
      console.error("TDX Token 錯誤訊息:", err.message);
    }

    throw new Error("無法取得 TDX Access Token");
  }
}
