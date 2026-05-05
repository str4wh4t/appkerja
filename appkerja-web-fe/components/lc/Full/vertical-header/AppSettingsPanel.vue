<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useCustomizerStore, type ThemeMode } from "@/stores/customizer";
import {
  getAuthMyTenants,
  getUserMe,
  setActiveTenant,
} from "@/services/graphql/auth.service";

const customizer = useCustomizerStore();
const runtimeConfig = useRuntimeConfig();

const themeModeModel = computed({
  get: () => customizer.themeMode,
  set: (v: ThemeMode) => customizer.SET_THEME_MODE(v),
});

const tenantItems = ref<Array<{ id: string; code: string; name: string }>>([]);
const selectedTenantId = ref<string | null>(null);
const suppressTenantUpdate = ref(false);
const tenantsLoading = ref(false);
const tenantSwitchLoading = ref(false);
const loadError = ref<string | null>(null);
const snackbar = ref(false);
const snackbarText = ref("");

const appName = computed(() => String(runtimeConfig.public.appName ?? "App"));
const appVersion = computed(() => String(runtimeConfig.public.appVersion ?? "-"));
const buildCommit = computed(() => String(runtimeConfig.public.buildCommit ?? "-"));

const tenantSelectItems = computed(() =>
  tenantItems.value.map((t) => ({
    title: `${t.name} (${t.code})`,
    value: t.id,
  })),
);

const showTenantSection = computed(() => {
  if (!import.meta.client) return false;
  return Boolean(localStorage.getItem("accessToken"));
});

const closeDrawer = () => {
  customizer.SET_APP_SETTINGS_DRAWER(false);
};

const loadDrawerData = async () => {
  loadError.value = null;
  if (!import.meta.client || !showTenantSection.value) return;
  tenantsLoading.value = true;
  suppressTenantUpdate.value = true;
  try {
    const [tenantsRes, meRes] = await Promise.all([getAuthMyTenants(), getUserMe()]);
    tenantItems.value = (tenantsRes.data?.authMyTenants ?? [])
      .filter(
        (
          tenant,
        ): tenant is {
          id: string;
          code: string;
          name: string;
        } => Boolean(tenant?.id && tenant?.code && tenant?.name),
      )
      .map((tenant) => ({
        id: String(tenant.id),
        code: String(tenant.code),
        name: String(tenant.name),
      }));
    const meId = meRes.data?.usersMe?.activeTenantId;
    selectedTenantId.value = meId != null && meId !== "" ? String(meId) : null;
  } catch {
    loadError.value = "Failed to load tenant list.";
    tenantItems.value = [];
  } finally {
    await nextTick();
    await new Promise<void>((r) => setTimeout(r, 0));
    suppressTenantUpdate.value = false;
    tenantsLoading.value = false;
  }
};

watch(
  () => customizer.appSettingsDrawer,
  (open) => {
    if (open) {
      void loadDrawerData();
    }
  },
);

const onTenantUpdate = async (id: string | null) => {
  if (suppressTenantUpdate.value || id == null || id === "") return;
  if (tenantSwitchLoading.value) return;
  tenantSwitchLoading.value = true;
  try {
    const res = await setActiveTenant(id);
    const auth = res.data?.authSetActiveTenant;
    if (!auth?.access_token || !auth?.refresh_token) {
      throw new Error("Invalid token response.");
    }
    localStorage.setItem("accessToken", auth.access_token);
    localStorage.setItem("refreshToken", auth.refresh_token);
    window.location.reload();
  } catch (e) {
    snackbarText.value =
      e instanceof Error ? e.message : "Failed to switch active tenant.";
    snackbar.value = true;
    await loadDrawerData();
  } finally {
    tenantSwitchLoading.value = false;
  }
};
</script>

<template>
  <div class="app-settings-panel d-flex flex-column h-100">
    <div class="drawer-header drawer-header-primary d-flex align-center justify-space-between pa-4 border-b">
      <span class="text-h6 font-weight-semibold text-white">Settings</span>
      <v-btn icon variant="text" density="comfortable" @click="closeDrawer">
        <v-icon size="22" icon="mdi-close" />
      </v-btn>
    </div>

    <div class="drawer-body pa-4 flex-grow-1 overflow-y-auto">
      <div class="text-subtitle-2 text-medium-emphasis mb-1">Theme</div>
      <p class="text-body-2 text-medium-emphasis mb-3">
        Light, dark, or follow the system setting.
      </p>
      <v-radio-group v-model="themeModeModel" hide-details density="compact" color="primary">
        <v-radio value="light" class="settings-radio">
          <template #label>
            <span class="d-inline-flex align-center ga-2">
              <v-icon size="20" icon="mdi-white-balance-sunny" />
              Light
            </span>
          </template>
        </v-radio>
        <v-radio value="dark" class="settings-radio">
          <template #label>
            <span class="d-inline-flex align-center ga-2">
              <v-icon size="20" icon="mdi-weather-night" />
              Dark
            </span>
          </template>
        </v-radio>
        <v-radio value="system" class="settings-radio">
          <template #label>
            <span class="d-inline-flex align-center ga-2">
              <v-icon size="20" icon="mdi-monitor" />
              System
            </span>
          </template>
        </v-radio>
      </v-radio-group>

      <template v-if="showTenantSection">
        <v-divider class="my-6" />
        <div class="text-subtitle-2 text-medium-emphasis mb-1">Active tenant</div>
        <p class="text-body-2 text-medium-emphasis mb-3">
          Data context follows the selected tenant.
        </p>
        <v-alert v-if="loadError" type="error" variant="tonal" density="compact" class="mb-3">
          {{ loadError }}
        </v-alert>
        <v-select
          v-model="selectedTenantId"
          :items="tenantSelectItems"
          item-title="title"
          item-value="value"
          :loading="tenantsLoading || tenantSwitchLoading"
          :disabled="tenantSwitchLoading"
          density="comfortable"
          variant="outlined"
          hide-details
          placeholder="Select tenant"
          @update:model-value="onTenantUpdate"
        />
      </template>
    </div>

    <div class="drawer-footer pa-4">
      <div class="text-subtitle-2 text-medium-emphasis mb-2">Software information</div>
      <v-sheet class="software-info-panel pa-3 rounded-lg" rounded="lg">
        <div class="info-row">
          <v-icon icon="mdi-tag-outline" class="info-icon" size="18" />
          <div>
            <div class="text-caption text-medium-emphasis">Version</div>
            <div class="text-body-2 font-weight-medium">{{ appVersion }}</div>
          </div>
        </div>
        <div class="info-row mt-3">
          <v-icon icon="mdi-source-commit" class="info-icon" size="18" />
          <div>
            <div class="text-caption text-medium-emphasis">Build</div>
            <div class="text-body-2 font-mono text-truncate">{{ buildCommit }}</div>
          </div>
        </div>
      </v-sheet>
    </div>

    <v-snackbar v-model="snackbar" color="error" location="bottom">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.drawer-header {
  flex: 0 0 auto;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.drawer-header-primary {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.drawer-header-primary :deep(.v-btn) {
  color: rgb(var(--v-theme-on-primary));
}

.drawer-footer {
  flex: 0 0 auto;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.settings-radio :deep(.v-selection-control) {
  min-height: 40px;
}

.software-info-panel {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.info-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.info-icon {
  flex-shrink: 0;
  margin-top: 2px;
  opacity: 0.75;
}
</style>
