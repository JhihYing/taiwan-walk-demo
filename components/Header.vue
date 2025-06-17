<script setup lang="ts">
const { t, locale } = useI18n();
const route = useRoute();

// 漢堡選單相關
const mobileMenuOpen = ref<boolean>(false);
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

// 導覽連結清單
interface INavLink {
  path: string;
  labelKey: string;
}

const navLinks: readonly INavLink[] = [
  { path: "/spots", labelKey: "nav.spots" },
  { path: "/events", labelKey: "nav.events" },
  { path: "/foods", labelKey: "nav.foods" },
];

// 判斷當前路由是否為 active
const isActiveLink = (path: string): boolean => route.path.startsWith(path);

watch(locale, () => {
  if (mobileMenuOpen.value) {
    mobileMenuOpen.value = false;
  }
});
</script>

<template>
  <header
    class="sticky left-0 top-0 z-[10] flex h-[60px] w-full items-center justify-between bg-white px-[20px] shadow-md sm:h-[65px] sm:px-[25px] md:px-[30px] lg:h-[80px] lg:px-[35px] 2xl:px-[45px]"
  >
    <div class="m-auto flex w-full max-w-[1360px] items-center justify-between">
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="flex h-[65px] items-center hover:opacity-80 lg:h-[80px]"
      >
        <div class="w-[130px]">
          <img
            src="@/assets/images/logo.svg"
            alt="台灣走走 Tai Waik"
            class="h-full w-full object-contain"
          />
        </div>
      </NuxtLink>

      <!-- ----- 導覽列含語言 ----- -->
      <nav class="hidden font-medium text-main lg:flex">
        <!-- 導覽列 -->
        <ul class="flex">
          <li
            v-for="link in navLinks"
            :key="link.path"
            :class="['nav-item', isActiveLink(link.path) ? 'active' : '']"
          >
            <NuxtLink
              :to="link.path"
              class="relative block px-[20px] leading-[80px] duration-300 hover:text-primary"
            >
              {{ t(link.labelKey) }}
            </NuxtLink>
          </li>
        </ul>

        <!-- 語言 -->
        <CommonLanguageSelect
          wrapperClass="relative ml-[20px] flex leading-[80px]"
        />
      </nav>

      <!-- ----- 漢堡選單 ----- -->
      <div class="flex lg:hidden">
        <!-- 漢堡按鈕 -->
        <button
          type="button"
          class="hamburger-btn absolute right-[0px] top-[0px] z-[8] h-full w-[60px] cursor-pointer bg-primary"
          @click="toggleMobileMenu"
          :class="{ show: mobileMenuOpen }"
        >
          <span></span>
        </button>

        <!-- 漢堡導覽列 -->
        <div
          v-show="mobileMenuOpen"
          class="fixed left-0 top-[60px] h-full w-full bg-[rgba(255,255,255,0.95)]"
        >
          <div class="flex flex-col">
            <ul class="mt-[70px]">
              <li
                v-for="link in navLinks"
                :key="link.path"
                :class="[
                  'mobile-nav-item relative cursor-pointer',
                  isActiveLink(link.path) ? 'active' : '',
                ]"
              >
                <NuxtLink
                  :to="link.path"
                  class="relative block px-[20px] py-[20px] text-center font-medium duration-300 hover:text-primary"
                  @click="mobileMenuOpen = false"
                  >{{ t(link.labelKey) }}</NuxtLink
                >
              </li>
            </ul>

            <!-- 語言 -->
            <CommonLanguageSelect
              wrapperClass="relative ml-[20px] mt-[50px] flex justify-center leading-[80px]"
            />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-item > a::after {
  content: "";
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: calc(100% - 40px);
  height: 2px;
  background-color: white;
}
.nav-item:hover > a::after {
  background-color: #e0da48;
  transition: all 0.3s;
}
.nav-item.active > a {
  color: #7f977b;
}
.nav-item.active > a::after {
  background-color: #e0da48;
}
.mobile-nav-item.active > a {
  color: #7f977b;
}

/* 漢堡選單 */
.hamburger-btn span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: -0.5px;
  width: 16px;
  height: 1px;
  background-color: #fff;
  transition: all 0.5s;
  margin-left: 5px;
}
.hamburger-btn span::before {
  top: -7px;
}
.hamburger-btn span::before,
.hamburger-btn span::after {
  content: "";
  position: absolute;
  right: 0;
  width: 26px;
  height: 1px;
  background-color: #fff;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}
.hamburger-btn span::after {
  bottom: -7px;
}
.hamburger-btn.show span::before {
  top: 0;
  transform: rotate(45deg);
}
.hamburger-btn.show span::after {
  bottom: 0;
  transform: rotate(-45deg);
}
.hamburger-btn.show span {
  background-color: transparent;
}
</style>
