/**
 * 目的：預先載入圖片，避免進入畫面時才開始載入，提升使用者體驗
 *
 * 功能說明：
 * - 傳入圖片URL陣列（string[]），依序建立 <img> 並設定 src
 * - 若圖片已快取，立即 resolve；否則綁定 onload / onerror 等待完成
 * - 所有圖片皆 resolve 後才繼續流程，避免某圖載入失敗造成卡住
 *
 * 使用範例：
 * await useImagePreload(["/img/a.jpg", "/img/b.jpg"]);
 */

export const useImagePreload = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        }),
    ),
  );
};
