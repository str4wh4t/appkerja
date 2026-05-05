<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { DeviceLaptopIcon, DeviceMobileIcon, DotsVerticalIcon } from "vue-tabler-icons";
import { getMySessions, revokeAllSessions, revokeSession } from "@/services/graphql/auth.service";

type SessionRow = {
  id: string;
  deviceName: string;
  deviceType: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  lastSeenAt?: string | null;
  expiresAt: string;
  isCurrent: boolean;
};

const sessions = ref<SessionRow[]>([]);
const sessionsLoading = ref(false);
const actionLoading = ref(false);
const errorMessage = ref("");
const successSnackbar = ref(false);
const successMessage = ref("");
const revokingSessionId = ref<string | null>(null);

const sessionsSorted = computed(() => [...sessions.value]);

const formatSessionSubtitle = (session: SessionRow): string => {
  const location = String(session.ipAddress || "Unknown location").trim();
  const when = session.lastSeenAt || session.expiresAt;
  const date = new Date(when);
  const dateLabel = Number.isNaN(date.getTime())
    ? "Unknown time"
    : date.toLocaleString();
  return `${location}, ${dateLabel}`;
};

const isMobileSession = (session: SessionRow) =>
  /mobile|android|iphone|ipad/i.test(String(session.deviceType || ""));

const loadSessions = async () => {
  sessionsLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getMySessions();
    sessions.value = (res.data?.authMySessions ?? [])
      .filter(
        (row): row is SessionRow =>
          Boolean(
            row?.id &&
              row?.deviceName &&
              row?.deviceType &&
              row?.expiresAt &&
              typeof row?.isCurrent === "boolean",
          ),
      )
      .map((row) => ({
        id: String(row.id),
        deviceName: String(row.deviceName),
        deviceType: String(row.deviceType),
        ipAddress: row.ipAddress ?? null,
        userAgent: row.userAgent ?? null,
        lastSeenAt: row.lastSeenAt ?? null,
        expiresAt: String(row.expiresAt),
        isCurrent: Boolean(row.isCurrent),
      }));
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load device sessions.";
  } finally {
    sessionsLoading.value = false;
  }
};

const handleSignOutAll = async () => {
  actionLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await revokeAllSessions(true);
    const revoked = Number(res.data?.authRevokeAllSessions ?? 0);
    successMessage.value =
      revoked > 0 ? `${revoked} session(s) signed out.` : "No other active sessions.";
    successSnackbar.value = true;
    await loadSessions();
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to sign out all devices.";
  } finally {
    actionLoading.value = false;
  }
};

const handleRevokeSession = async (sessionId: string) => {
  revokingSessionId.value = sessionId;
  errorMessage.value = "";
  try {
    const res = await revokeSession(sessionId);
    if (!res.data?.authRevokeSession) {
      throw new Error("Session not found.");
    }
    successMessage.value = "Device session has been signed out.";
    successSnackbar.value = true;
    await loadSessions();
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to sign out this device.";
  } finally {
    revokingSessionId.value = null;
  }
};

onMounted(() => {
  void loadSessions();
});
</script>
<template>
    <v-card elevation="10" >
        <v-row class="ma-sm-n2 ma-n1">
            <v-col cols="12" md="8">
                <v-card elevation="10">
                    <v-card-item>
                        <h4 class="text-h4">Two-factor Authentication</h4>
                        <div class="d-sm-flex justify-space-between mt-4 mb-8">
                            <div class="text-subtitle-1 text-grey100 text-13 pr-5">
                                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Corporis sapiente sunt earum officiis laboriosam
                                ut.
                            </div>
                            <v-btn color="primary" class="mt-sm-0 mt-3" flat>Enable</v-btn>
                        </div>
                        <v-divider></v-divider>
                        <div class="d-flex justify-space-between my-4">
                            <div>
                                <h6 class="text-h6 mb-1">Authentication App</h6>
                                <h5 class="text-subtitle-1 text-grey100">Google auth app</h5>
                            </div>
                            <v-btn class="bg-lightprimary text-primary" flat>Setup</v-btn>
                        </div>
                        <v-divider></v-divider>
                        <div class="d-flex justify-space-between my-4">
                            <div>
                                <h6 class="text-h6 mb-1">Another e-mail</h6>
                                <h5 class="text-subtitle-1 text-grey100">E-mail to send verification link</h5>
                            </div>
                            <v-btn class="bg-lightprimary text-primary" flat>Setup</v-btn>
                        </div>
                        <v-divider></v-divider>
                        <div class="d-flex justify-space-between my-4">
                            <div>
                                <h6 class="text-h6 mb-1">SMS Recovery</h6>
                                <h5 class="text-subtitle-1 text-grey100">Your phone number or something</h5>
                            </div>
                            <v-btn class="bg-lightprimary text-primary" flat>Setup</v-btn>
                        </div>
                    </v-card-item>
                </v-card>
            </v-col>
            <v-col cols="12" md="4">
                <v-card elevation="10">
                    <v-card-item>
                        <v-avatar size="48" class="" rounded="md" color="lightprimary">
                            <DeviceLaptopIcon class="text-primary" size="25" />
                        </v-avatar>
                        <h5 class="text-h5 mt-4">Devices</h5>
                        <div class="text-subtitle-1 mt-3 text-grey100 text-10">
                            Manage your active sessions and revoke access from devices.
                        </div>
                        <v-alert
                          v-if="errorMessage"
                          type="error"
                          variant="tonal"
                          density="compact"
                          class="mt-4"
                          rounded="md"
                        >
                          {{ errorMessage }}
                        </v-alert>
                        <v-btn
                          color="primary"
                          class="mt-4"
                          flat
                          :loading="actionLoading"
                          :disabled="sessionsLoading || actionLoading"
                          @click="handleSignOutAll"
                        >
                          Sign out from all devices
                        </v-btn>
                        <div class="mt-sm-8 mt-5">
                          <v-progress-linear
                            v-if="sessionsLoading"
                            color="primary"
                            indeterminate
                            class="mb-4"
                          />
                          <template v-for="(session, index) in sessionsSorted" :key="session.id">
                            <div class="d-flex align-center my-4">
                                <v-avatar size="30" rounded="md" color="surface">
                                  <DeviceMobileIcon v-if="isMobileSession(session)" size="25" />
                                  <DeviceLaptopIcon v-else size="25" />
                                </v-avatar>
                                <div class="ml-3 pr-3">
                                    <h6 class="text-h6 mb-1">
                                      {{ session.deviceName }}
                                      <span v-if="session.isCurrent" class="text-caption text-primary ml-1">(Current)</span>
                                    </h6>
                                    <h5 class="text-subtitle-1 text-grey100">{{ formatSessionSubtitle(session) }}</h5>
                                </div>
                                <v-menu location="bottom end">
                                  <template #activator="{ props }">
                                    <v-btn
                                      size="30"
                                      icon
                                      variant="flat"
                                      class="lightprimary ml-auto"
                                      v-bind="props"
                                      :loading="revokingSessionId === session.id"
                                      :disabled="revokingSessionId === session.id"
                                    >
                                      <v-avatar size="20">
                                          <DotsVerticalIcon />
                                      </v-avatar>
                                    </v-btn>
                                  </template>
                                  <v-list density="compact" min-width="170">
                                    <v-list-item
                                      density="compact"
                                      @click="handleRevokeSession(session.id)"
                                      :disabled="session.isCurrent || revokingSessionId === session.id"
                                    >
                                      <v-list-item-title>
                                        {{ session.isCurrent ? "Current session" : "Sign out this device" }}
                                      </v-list-item-title>
                                    </v-list-item>
                                  </v-list>
                                </v-menu>
                            </div>
                            <v-divider v-if="index < sessionsSorted.length - 1"></v-divider>
                          </template>
                          <div
                            v-if="!sessionsLoading && sessionsSorted.length === 0"
                            class="text-subtitle-2 text-grey100"
                          >
                            No active sessions found.
                          </div>
                        </div>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-card>
    <v-snackbar
      v-model="successSnackbar"
      location="top right"
      color="success"
      rounded="pill"
      timeout="2500"
    >
      <div class="d-flex align-center ga-2">
        <v-icon size="18">mdi-check-circle-outline</v-icon>
        <span>{{ successMessage }}</span>
      </div>
    </v-snackbar>
</template>
