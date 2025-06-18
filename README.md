# 台灣走走．Tai Walk | 2025.06
![](https://i.ibb.co/xqDrB7Mt/taiwan-walk-zeabur-app.jpg)

## 專案說明
《台灣走走．Tai Walk》是一個以「台灣旅遊景點導覽」為主題的多語系網站，使用者可依城市、主題與關鍵字搜尋景點、活動、美食資訊，並查看地圖與 3 公里內的周邊資訊。

本專案為 [舊版專案(2022.03)](https://github.com/JhihYing/tai-walk) 的重構版本，改寫整體技術架構、優化效能，並新增多項功能，全面提升使用體驗與維護性。



## 重構重點
- 技術升級：由原生 JavaScript + jQuery 改寫為 Nuxt 3 + TypeScript + Tailwind CSS
- 功能擴充：
  - 多語系切換（支援繁中／英文／日文）
  - 分享功能（Line 網頁版／Line App／複製連結）
  - 快取優化，減少重複 API 請求，避免流量超限並提升效能
- 介面優化：調整排版結構，加入 RWD 響應式設計，提升使用者體驗

※ 備註：網站資料來自政府 TDX API，部分圖片或描述可能因原始資料限制而顯示不完整，敬請見諒。


## 開發目的
- 練習 TypeScript、多語系切換功能
- 重構舊專案，提升可讀性、擴充性與效能


## Demo
https://taiwan-walk.zeabur.app/


## 使用技術 / 套件
| 類別        | 技術／工具說明                                   |
|------------|------------------------------------------------|
| 技術        | Vue 3、Nuxt 3、TypeScript、Tailwind CSS         |
| 多語系處理   | Vue I18n + 本地翻譯 JSON 對照表                  |
| 資料串接     | TDX API（交通部觀光資料，OAuth 2.0）              |
| 地圖嵌入     | Google Maps Embed API                         |
| 套件應用     | Swiper（輪播圖）                                |
| 部署平台     | Zeabur                                         |


## 主要功能
 - 多條件搜尋（城市、主題、關鍵字）
 - 活動搜尋支援「起訖日期」篩選，僅顯示尚未結束的活動
 - 顯示 3 公里內的周邊景點／活動／美食資訊
 - 詳細頁整合 Google Map、分享功能、推薦資訊
 - 多語系切換（支援繁體中文 / 英文 / 日文）


## 未來優化方向
- 收藏功能（無需登入）
- 活動分類篩選與狀態標籤（尚未開始／進行中／已結束）
- 分頁跳轉（可輸入頁碼）
- 社群分享擴充（Facebook、Messenger）

  
## 參考資料
第三屆 F2E 的第一關 「臺灣旅遊景點導覽」

- 設計師：[早餐](https://2021.thef2e.com/users/6296427084285739247/)
- 資料來源：[TDX API](https://tdx.transportdata.tw/api-service/swagger#/Tourism)
