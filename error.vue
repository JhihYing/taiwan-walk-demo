<!-- [...slug].vue -->
<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();
const error = props.error;
const router = useRouter();

const countdown = ref<number>(5); // 倒數 5 秒

// 自動導向首頁（僅限 5xx 錯誤）
onMounted(() => {
  const is5xx = String(error?.statusCode || "").startsWith("5");

  if (is5xx) {
    const timer = setInterval(() => {
      countdown.value--;

      if (countdown.value <= 0) {
        clearInterval(timer);
        router.push("/");
      }
    }, 1000); // 每秒減一
  }
});
</script>

<template>
  <Header v-if="!String(error?.statusCode).startsWith('5')" />

  <section
    class="relative h-screen w-full bg-[#FAFAFA] px-[20px] sm:px-[25px] md:px-[30px] lg:px-[35px] 2xl:px-[45px]"
  >
    <div
      class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center"
    >
      <div class="w-[300px] sm:w-[350px] md:w-[400px]">
        <img
          v-if="String(error.statusCode).startsWith('4')"
          class="h-full w-full object-contain"
          src="@/assets/images/error/error-404.svg"
          alt="404"
        />
        <img
          v-if="String(error.statusCode).startsWith('5')"
          class="h-full w-full object-contain"
          src="@/assets/images/error/error-500.svg"
          alt="404"
        />
      </div>

      <div class="flex flex-col items-center">
        <h1 class="text-[50px] font-bold text-primary sm:text-[60px]">
          {{ error.statusCode || "錯誤" }}
        </h1>

        <div class="mb-[40px] mt-[18px]">
          <div
            v-if="error.statusCode === 400"
            class="text-center text-2xl text-[#525252]"
          >
            <h3>請求格式錯誤</h3>
            <p class="mt-[8px] text-[16px] leading-[1.5]">
              您送出的資料格式有誤，請確認輸入是否正確。
            </p>
          </div>

          <div
            v-else-if="error.statusCode === 401"
            class="text-center text-2xl text-[#525252]"
          >
            <h3>身份驗證失敗</h3>
            <p class="mt-[8px] text-[16px] leading-[1.5]">
              您尚未登入或憑證已失效，請重新登入以繼續操作。
            </p>
          </div>

          <div
            v-else-if="error.statusCode === 403"
            class="text-center text-2xl text-[#525252]"
          >
            <h3>無權限存取</h3>
            <p class="mt-[8px] text-[16px] leading-[1.5]">
              您目前沒有權限訪問此頁面。
            </p>
          </div>

          <div
            v-else-if="error.statusCode === 404"
            class="text-center text-2xl text-[#525252]"
          >
            <h3>找不到您要的頁面</h3>
            <p class="mt-[8px] text-[16px] leading-[1.5]">
              這個頁面可能已被移除，或該網址不存在，請重新查詢。
            </p>
          </div>

          <div
            v-else-if="String(error.statusCode).startsWith('5')"
            class="text-center text-2xl text-[#525252]"
          >
            <h3>系統發生錯誤</h3>
            <p class="mt-[8px] text-[16px] leading-[1.5]">
              很抱歉，我們遇到一些問題，請稍後再試。
            </p>
            <p class="mt-[8px] text-[15px] text-gray-400">
              系統將於 {{ countdown }} 秒後自動返回首頁
            </p>
          </div>

          <div v-else class="text-center text-2xl text-[#525252]">
            <h3>發生未知錯誤</h3>
            <p class="mt-[8px] text-[16px] leading-[1.5]">
              很抱歉，我們遇到一些問題，請稍後再試。
              <!-- {{ error.message || "很抱歉，我們遇到一些問題，請稍後再試" }}。 -->
            </p>
          </div>
        </div>

        <NuxtLink
          to="/"
          class="search-btn flex h-[50px] w-[200px] items-center justify-center rounded-[6px] bg-primary text-[15px] font-medium tracking-[1px] text-white transition-colors duration-300 hover:bg-[#65895F] sm:text-[16px]"
          >返回首頁</NuxtLink
        >
      </div>
    </div>
  </section>

  <Footer v-if="!String(error?.statusCode).startsWith('5')" />
</template>

<style scoped></style>
