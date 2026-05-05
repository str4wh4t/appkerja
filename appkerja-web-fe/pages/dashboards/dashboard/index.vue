<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

definePageMeta({
  middleware: [
    (to) => {
      if (!import.meta.client) return;

      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) return;

      return navigateTo({
        path: "/auth/login",
        query: { redirect: to.fullPath },
      });
    },
  ],
});

import TextCards from "@/components/dashboards/dashboard2/TextCards.vue";
import ProfitExpanse from "@/components/dashboards/dashboard2/ProfitExpanse.vue";
import TraficDistribution from "@/components/dashboards/dashboard2/TrafficDistribution.vue";
import PayingTable from "@/components/dashboards/dashboard2/PayingTable.vue";
import UpcommingSchedule from "@/components/dashboards/dashboard2/UpcommingSchedule.vue";

const isDev = import.meta.dev;
const accessToken = ref("");
const refreshToken = ref("");
const copiedState = ref<"" | "access" | "refresh" | "subject">("");

const decodeJwtPayload = (token: string) => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const accessTokenPayload = computed(() => decodeJwtPayload(accessToken.value));
const refreshTokenPayload = computed(() => decodeJwtPayload(refreshToken.value));
const accessTokenExp = computed(() => {
  const exp = accessTokenPayload.value?.exp;
  return typeof exp === "number" ? new Date(exp * 1000).toLocaleString() : "-";
});
const refreshTokenExp = computed(() => {
  const exp = refreshTokenPayload.value?.exp;
  return typeof exp === "number" ? new Date(exp * 1000).toLocaleString() : "-";
});
const accessTokenSubject = computed(() => accessTokenPayload.value?.sub ?? "-");
const tokenType = computed(() => accessTokenPayload.value?.token_type ?? "Bearer");
const accessSubjectPreview = computed(() => {
  const value = String(accessTokenSubject.value ?? "-");
  if (value.length <= 24) return value;
  return `${value.slice(0, 10)}...${value.slice(-8)}`;
});
const tokenPreview = (value: string) =>
  value ? `${value.slice(0, 18)}...${value.slice(-10)}` : "-";

const copyValue = async (type: "access" | "refresh" | "subject", value: string) => {
  if (!import.meta.client) return;
  if (!value) return;

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const input = document.createElement("textarea");
    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }

  copiedState.value = type;
  window.setTimeout(() => {
    copiedState.value = "";
  }, 1200);
};

const copyToken = async (type: "access" | "refresh") => {
  const value = type === "access" ? accessToken.value : refreshToken.value;
  return copyValue(type, value);
};

onMounted(() => {
  if (!import.meta.client) return;

  accessToken.value = localStorage.getItem("accessToken") || "";
  refreshToken.value = localStorage.getItem("refreshToken") || "";
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="10">
        <v-card-text class="py-6 px-6">
          <h3 class="text-h4 font-weight-bold mb-2">Dashboard</h3>
          <p class="text-subtitle-1 text-medium-emphasis mb-0">
            Monitor key metrics, review team performance, and follow up on upcoming tasks from one place.
          </p>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col v-if="isDev" cols="12">
      <v-alert
        type="info"
        variant="tonal"
        border="start"
        title="Development Runtime Info"
        text="Visible only in development mode to help debugging auth flow."
      />
      <v-card elevation="10" class="mt-4">
        <v-card-text>
          <h5 class="text-h5 font-weight-semibold mb-4">Auth Snapshot</h5>
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4 h-100">
                <div class="text-subtitle-1 font-weight-bold mb-4">Session Details</div>
                <div class="session-row mb-4">
                  <span class="text-medium-emphasis text-subtitle-2">Token Type</span>
                  <span class="font-weight-medium">{{ tokenType }}</span>
                </div>
                <div class="session-row mb-4">
                  <span class="text-medium-emphasis text-subtitle-2">Access Subject</span>
                  <div class="d-flex align-center justify-end gap-2">
                    <span class="font-weight-medium text-right">{{ accessSubjectPreview }}</span>
                    <v-btn
                      size="small"
                      icon
                      variant="tonal"
                      color="primary"
                      density="comfortable"
                      :disabled="accessTokenSubject === '-'"
                      @click="copyValue('subject', String(accessTokenSubject))"
                    >
                      <v-icon size="18">
                        {{ copiedState === "subject" ? "mdi-check" : "mdi-content-copy" }}
                      </v-icon>
                    </v-btn>
                  </div>
                </div>
                <div class="session-row mb-4">
                  <span class="text-medium-emphasis text-subtitle-2">Access Expired At</span>
                  <span class="font-weight-medium text-right">{{ accessTokenExp }}</span>
                </div>
                <div class="session-row">
                  <span class="text-medium-emphasis text-subtitle-2">Refresh Expired At</span>
                  <span class="font-weight-medium text-right">{{ refreshTokenExp }}</span>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-4 h-100">
                <div class="text-subtitle-1 font-weight-bold mb-4">Token Debug</div>
                <div class="mb-4">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-medium-emphasis text-subtitle-2">Access Token</span>
                    <v-btn
                      size="small"
                      icon
                      variant="tonal"
                      color="primary"
                      density="comfortable"
                      :disabled="!accessToken"
                      @click="copyToken('access')"
                    >
                      <v-icon size="18">
                        {{ copiedState === "access" ? "mdi-check" : "mdi-content-copy" }}
                      </v-icon>
                    </v-btn>
                  </div>
                  <div class="text-body-2 text-break">{{ tokenPreview(accessToken) }}</div>
                </div>
                <div>
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-medium-emphasis text-subtitle-2">Refresh Token</span>
                    <v-btn
                      size="small"
                      icon
                      variant="tonal"
                      color="primary"
                      density="comfortable"
                      :disabled="!refreshToken"
                      @click="copyToken('refresh')"
                    >
                      <v-icon size="18">
                        {{ copiedState === "refresh" ? "mdi-check" : "mdi-content-copy" }}
                      </v-icon>
                    </v-btn>
                  </div>
                  <div class="text-body-2 text-break">{{ tokenPreview(refreshToken) }}</div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <TextCards />
    </v-col>

    <v-col cols="12" lg="8">
      <ProfitExpanse />
    </v-col>
    <v-col cols="12" lg="4">
      <TraficDistribution />
    </v-col>

    <v-col cols="12" lg="8">
      <PayingTable />
    </v-col>
    <v-col cols="12" lg="4">
      <UpcommingSchedule />
    </v-col>
  </v-row>
</template>

<style scoped>
.session-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
</style>
