<script setup lang="ts">
import { useTheme } from "vuetify";

import { useCustomizerStore } from "@/stores/customizer";
import { BLUE_THEME } from "@/theme/LightTheme";
import { pl, zhHans } from "vuetify/locale";
import { exitImpersonateUser, getUserMe } from "@/services/graphql/auth.service";
import bookLoadingAnimation from "@/assets/lottie/book-loading.json";
const customizer = useCustomizerStore();
const title = ref(
  "Spikeadmin - Nuxt3 Typescript based Admin Dashboard Template"
);
const isImpersonating = ref(false);
const impersonatedUserName = ref("User");
const exitImpersonateLoading = ref(false);
const { isLoading: isGraphqlLoading } = useGraphqlLoading();

const parseJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

const loadImpersonationState = async () => {
  if (!import.meta.client) return;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    isImpersonating.value = false;
    return;
  }

  const payload = parseJwtPayload(token);
  isImpersonating.value = Boolean(payload?.impersonatedByUserId);

  if (!isImpersonating.value) return;

  try {
    const me = await getUserMe();
    const user = me.data?.usersMe;
    impersonatedUserName.value =
      user?.fullname || user?.username || user?.email || "User";
  } catch {
    impersonatedUserName.value = "User";
  }
};

const exitImpersonate = async () => {
  if (!import.meta.client) return;
  exitImpersonateLoading.value = true;
  try {
    const response = await exitImpersonateUser();
    const auth = response.data?.usersExitImpersonate;
    if (!auth?.access_token || !auth?.refresh_token) {
      throw new Error("Exit impersonation token response is invalid.");
    }
    localStorage.setItem("accessToken", auth.access_token);
    localStorage.setItem("refreshToken", auth.refresh_token);
    isImpersonating.value = false;
    window.location.reload();
  } finally {
    exitImpersonateLoading.value = false;
  }
};

useHead({
  meta: [{ content: title }],
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - Nuxt3 Typescript based Admin Dashboard Template`
      : "Spikeadmin - Nuxt3 Typescript based Admin Dashboard Template";
  },
});

onMounted(async () => {
  await loadImpersonationState();
});


</script>

<template>
  <!-----RTL LAYOUT------->
  <v-locale-provider v-if="customizer.setRTLLayout" rtl>
    <v-app
    
      :class="[
        customizer.actTheme,
        customizer.mini_sidebar ? 'mini-sidebar' : '',
        customizer.setHorizontalLayout ? 'horizontalLayout' : 'verticalLayout',
        customizer.setBorderCard ? 'cardBordered' : '',
        isGraphqlLoading ? 'post-login-overlay-active' : '',
      ]"
    >
      <v-overlay
        :model-value="isGraphqlLoading"
        persistent
        class="align-center justify-center post-login-lottie-overlay"
      >
        <!-- <v-sheet rounded="0" class="pa-2 text-center overlay-card overlay-full-width"> -->
          <Vue3Lottie :animationData="bookLoadingAnimation" :height="250" class="pb-6" />
        <!-- </v-sheet> -->
      </v-overlay>
      <div v-if="isImpersonating" class="impersonate-banner-wrap">
        <v-alert
          type="warning"
          variant="tonal"
          border="start"
          class="impersonate-banner"
        >
          <div class="d-flex align-center justify-space-between ga-4 flex-wrap">
            <span class="text-body-2 font-weight-medium text-error">
              Impersonating user as {{ impersonatedUserName }}
            </span>
            <v-btn
              size="small"
              color="error"
              variant="tonal"
              :loading="exitImpersonateLoading"
              @click="exitImpersonate"
            >
              Exit
            </v-btn>
          </div>
        </v-alert>
      </div>
      <!---Customizer location left side--->
      <ClientOnly>
        <v-navigation-drawer
          app
          temporary
          elevation="10"
          location="left"
          v-model="customizer.Customizer_drawer"
          width="320"
          class="left-customizer"
        >
          <LcFullCustomizer />
        </v-navigation-drawer>
        <v-navigation-drawer
          v-model="customizer.appSettingsDrawer"
          app
          temporary
          elevation="10"
          location="right"
          width="360"
          class="app-settings-navigation-drawer"
        >
          <LcFullVerticalHeaderAppSettingsPanel />
        </v-navigation-drawer>
        <LcFullVerticalSidebar v-if="!customizer.setHorizontalLayout" />
        <div :class="customizer.boxed ? 'maxWidth' : 'full-header'">
          <LcFullVerticalHeader v-if="!customizer.setHorizontalLayout" />
        </div>
        <div :class="customizer.boxed ? 'maxWidth' : 'full-header'">
          <LcFullHorizontalHeader v-if="customizer.setHorizontalLayout" />
        </div>
        <LcFullHorizontalSidebar v-if="customizer.setHorizontalLayout" />
      </ClientOnly>
      <v-main>
        <div class="rtl-lyt mb-3 hr-layout">
          <v-container
            fluid
            class="page-wrapper  px-sm-5 px-4 pt-12 rounded-xl"
          >
            <div class="">
              <div :class="customizer.boxed ? 'maxWidth' : ''">
                <NuxtPage />
              </div>
            </div>
          </v-container>
        </div>
      </v-main>
    </v-app>
  </v-locale-provider>

  <!-----LTR LAYOUT------->
  <v-locale-provider v-else>
    <v-app
    :theme="customizer.actTheme"
      :class="[
        customizer.actTheme,
        customizer.mini_sidebar ? 'mini-sidebar' : '',
        customizer.setHorizontalLayout ? 'horizontalLayout' : 'verticalLayout',
        customizer.setBorderCard ? 'cardBordered' : '',
        isGraphqlLoading ? 'post-login-overlay-active' : '',
      ]"
    >
      <v-overlay
        :model-value="isGraphqlLoading"
        persistent
        class="align-center justify-center post-login-lottie-overlay"
      >
        <v-sheet rounded="0" class="pa-2 text-center overlay-card overlay-full-width">
          <Vue3Lottie :animationData="bookLoadingAnimation" :height="250" class="pb-6" />
        </v-sheet>
      </v-overlay>
      <div v-if="isImpersonating" class="impersonate-banner-wrap">
        <v-alert
          type="warning"
          variant="tonal"
          border="start"
          class="impersonate-banner"
        >
          <div class="d-flex align-center justify-space-between ga-4 flex-wrap">
            <span class="text-body-2 font-weight-medium text-error">
              Impersonating user as {{ impersonatedUserName }}
            </span>
            <v-btn
              size="small"
              color="error"
              variant="tonal"
              :loading="exitImpersonateLoading"
              @click="exitImpersonate"
            >
              Exit
            </v-btn>
          </div>
        </v-alert>
      </div>
      <!---Customizer location right side--->
      <ClientOnly>
        <v-navigation-drawer
          app
          temporary
          elevation="10"
          location="right"
          v-model="customizer.Customizer_drawer"
          width="320"
        >
          <LcFullCustomizer />
        </v-navigation-drawer>
        <v-navigation-drawer
          v-model="customizer.appSettingsDrawer"
          app
          temporary
          elevation="10"
          location="right"
          width="360"
          class="app-settings-navigation-drawer"
        >
          <LcFullVerticalHeaderAppSettingsPanel />
        </v-navigation-drawer>
        <LcFullVerticalSidebar v-if="!customizer.setHorizontalLayout" />
        <div :class="customizer.boxed ? 'maxWidth' : 'full-header'">
          <LcFullVerticalHeader v-if="!customizer.setHorizontalLayout" />
        </div>
        <div :class="customizer.boxed ? 'maxWidth' : 'full-header'">
          <LcFullHorizontalHeader v-if="customizer.setHorizontalLayout" />
        </div>
        <LcFullHorizontalSidebar v-if="customizer.setHorizontalLayout" />
      </ClientOnly>
      <v-main>
        <div class="mb-3 hr-layout">
          <v-container
            fluid
            class="page-wrapper  px-sm-5 px-4 pt-12 rounded-xl"
          >
            <div class="">
              <div :class="customizer.boxed ? 'maxWidth' : ''">
                <NuxtPage />
              </div>
            </div>
          </v-container>
        </div>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<style scoped>
.impersonate-banner-wrap {
  position: fixed;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: min(760px, calc(100vw - 32px));
  z-index: 3000;
}

.impersonate-banner {
  border: 2px solid rgba(var(--v-theme-error), 0.65) !important;
}

.impersonate-banner :deep(.v-alert__prepend .v-icon),
.impersonate-banner :deep(.v-alert__prepend svg) {
  color: rgb(var(--v-theme-error)) !important;
  opacity: 1;
}
</style>

<style lang="scss">
/* Single global post-login overlay source (layout-level). */
.post-login-overlay-active .v-navigation-drawer,
.post-login-overlay-active .full-header,
.post-login-overlay-active .v-app-bar,
.post-login-overlay-active .v-main {
  filter: blur(3px);
  /* transition: filter 180ms ease; */
}

.post-login-lottie-overlay .v-overlay__scrim {
  background: rgba(24, 40, 64, 0.38) !important;
}

.overlay-card {
  background: rgba(var(--v-theme-surface), 0.96);
}

.overlay-full-width {
  width: 100vw;
  max-width: 100vw;
}
</style>
