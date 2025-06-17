<script setup lang="ts">
const { locale, setLocale } = useI18n();

type TSupportedLocale = "zh-TW" | "en-US" | "ja-JP";

const props = defineProps<{
  wrapperClass?: string;
}>();

// 範例：
// <CommonLanguageSelect wrapperClass="relative ml-[20px] flex leading-[80px]" />

const selectedLocale = ref<TSupportedLocale>(locale.value);

// 當選單改變時才觸發切換語言
watch(selectedLocale, async (newLocale) => {
  if (newLocale !== locale.value) {
    await setLocale(newLocale);
  }
});

// 初始化時根據瀏覽器語言判斷語系
onMounted(() => {
  const browserLang = navigator.language;

  let detectedLocale: TSupportedLocale = "en-US";
  if (browserLang.startsWith("ja")) detectedLocale = "ja-JP";
  else if (browserLang.startsWith("zh")) detectedLocale = "zh-TW";

  selectedLocale.value = detectedLocale;
});
</script>

<template>
  <div :class="wrapperClass">
    <div
      class="language relative flex cursor-pointer items-center duration-300 hover:opacity-70"
    >
      <select
        name="lang"
        id="lang-select"
        v-model="selectedLocale"
        :class="[
          'flex cursor-pointer appearance-none items-center bg-transparent px-[25px]',
        ]"
      >
        <option value="zh-TW">繁體中文</option>
        <option value="en-US">English</option>
        <option value="ja-JP">日本語</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
select:focus-visible {
  outline: none;
}
.language::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: 31px;
  width: 17px;
  height: 17px;
  background: url(@/assets/images/icons/language-icon.png) no-repeat center
    center / cover;
  filter: brightness(0);
  margin-right: 17px;
  display: inline-block;
}
.language::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 38px;
  width: 7px;
  height: 7px;
  border-right: 1px solid #525252;
  border-bottom: 1px solid #525252;
  transform: rotate(45deg);
  z-index: 1;
  margin-left: 12px;
}
</style>
