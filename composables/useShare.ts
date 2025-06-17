/**
 * 目的：文章分享與複製連結功能(LINE 網頁版、LINE App、Link複製)
 *
 * 功能說明：
 * - 傳入欲分享的網址與標題
 * - 提供 shareToLine（打開 LINE 分享網址）、openLineApp（跳轉 LINE App）與 copyLink（複製連結）
 *
 * 使用範例：
 * const shareTitle = computed(() => spotDetail.value?.name || "探索景點");
 * const { shareToLine, openLineApp, copyLink } = useShare(shareUrl, shareTitle);
 */

export const useShare = (urlRef: Ref<string>, titleRef: Ref<string>) => {
  // LINE 網頁版
  const shareToLine = (): void => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(urlRef.value)}`;
    window.open(url, "_blank");
  };

  // LINE App（限手機有安裝LINE APP才有效）
  const openLineApp = (): void => {
    const text = encodeURIComponent(`${titleRef.value}\n${urlRef.value}`);
    const lineScheme = `line://msg/text/${text}`;
    window.location.href = lineScheme;
  };

  // 複製分享連結
  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(urlRef.value);
      alert("連結已複製！");
    } catch (err) {
      alert("複製失敗，請手動複製！");
    }
  };

  return {
    shareToLine,
    openLineApp,
    copyLink,
  };
};
