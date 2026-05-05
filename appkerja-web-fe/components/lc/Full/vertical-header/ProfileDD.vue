<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { CircleXIcon, MailIcon } from 'vue-tabler-icons';
import { profileDD } from '@/_mockApis/headerData';
import { Icon } from '@iconify/vue';
import { getActiveTenant, getUserMe } from "@/services/graphql/auth.service";

const { logoutClient: handleLogout } = useClientAuthLogout();
const menu = computed(() =>
  profileDD.filter((item) => !["My Notes", "My Tasks"].includes(item.title))
);

const userName = ref("User");
const userRole = ref("Authenticated User");
const userEmail = ref("-");
const userActiveTenant = ref("-");
const activeTenantName = ref("-");
const activeTenantAddress = ref("-");
/** Public avatar URL from `usersMe.avatarUrl` (same as profile page). */
const avatarUrl = ref<string | null>(null);
/** If the image fails to load, fall back to initials until URL changes. */
const avatarImageFailed = ref(false);

watch(avatarUrl, () => {
  avatarImageFailed.value = false;
});

const userInitials = computed(() => {
  const source = (userName.value || "User").trim();
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
});

const showAvatarImage = computed(
  () => Boolean(avatarUrl.value?.trim()) && !avatarImageFailed.value,
);

const setUserProfile = (user?: {
  fullname?: string | null;
  username?: string | null;
  email?: string | null;
  activeRoleCode?: string | null;
  activeTenantId?: string | null;
  avatarUrl?: string | null;
}) => {
  const displayName = user?.fullname || user?.username || "User";
  const username = user?.username || "user";
  userName.value = displayName;
  userEmail.value = user?.email || "-";
  userRole.value = username;
  userActiveTenant.value = user?.activeTenantId || "-";
  avatarUrl.value = user?.avatarUrl?.trim() ? user.avatarUrl.trim() : null;
};

const loadUserMe = async () => {
  if (!import.meta.client) return;
  const hasToken = Boolean(localStorage.getItem("accessToken"));
  if (!hasToken) return;

  try {
    const [userResponse, tenantResponse] = await Promise.all([
      getUserMe(),
      getActiveTenant(),
    ]);
    setUserProfile(userResponse.data?.usersMe);
    const tenant = tenantResponse.data?.authActiveTenant;
    if (tenant) {
      activeTenantName.value = tenant.name || "-";
      activeTenantAddress.value = tenant.address || "-";
    } else {
      activeTenantName.value = "-";
      activeTenantAddress.value = "-";
    }
  } catch {
    // Keep fallback values; avoid blocking header render.
  }
};

onMounted(() => {
  loadUserMe();
});
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu :close-on-content-click="true" class="profile_popup">
        <template v-slot:activator="{ props }">
            <div class=" text-left px-0 cursor-pointer" variant="text" v-bind="props">
                <div class="d-flex align-center">
                    <v-avatar size="32" color="primary" variant="tonal" class="font-weight-bold text-body-1">
                        <v-img
                          v-if="showAvatarImage"
                          :src="avatarUrl || ''"
                          cover
                          alt=""
                          @error="avatarImageFailed = true"
                        />
                        <span v-else>{{ userInitials }}</span>
                    </v-avatar>
                    <div class="ml-md-4 d-md-block d-none">
                        <h6 class="text-h6 d-flex align-center  font-weight-semibold">{{ userName }}</h6>
                        <span class="text-subtitle-2 font-weight-medium text-grey100">{{ userRole }}</span>
                    </div>
                </div>
            </div>
        </template>
        <v-sheet rounded="lg" width="385" elevation="10" class="mt-5">
            <div class="px-8 pt-6">
                <div class="d-flex align-center justify-space-between">
                    <h6 class="text-h5 font-weight-semibold">User Profile</h6>
                    <CircleXIcon size="22" class="text-grey100 cursor-pointer opacity-50" />
                </div>

                <div class="d-flex align-center mt-5 pb-6">
                    <v-avatar size="64" color="primary" variant="tonal" class="font-weight-bold text-h4">
                        <v-img
                          v-if="showAvatarImage"
                          :src="avatarUrl || ''"
                          cover
                          alt=""
                          @error="avatarImageFailed = true"
                        />
                        <span v-else>{{ userInitials }}</span>
                    </v-avatar>
                    <div class="ml-5">
                        <h6 class="text-h5 mb-n1">{{ userName }}</h6>
                        <span class="text-subtitle-1 font-weight-regular text-grey100 font-weight-medium">{{ userRole }}</span>
                        <div class="d-flex align-center mt-1">
                            <MailIcon size="18" stroke-width="1.5" class="text-grey100" />
                            <span class="text-subtitle-1 text-grey100 font-weight-medium ml-2">{{ userEmail }}</span>
                        </div>
                    </div>
                </div>
                <v-sheet
                    class="pa-4 mb-6 tenant-info-panel"
                    rounded="lg"
                >
                    <div class="tenant-row">
                        <span class="text-caption tenant-info-text">{{ activeTenantName }}</span>
                    </div>
                    <div class="tenant-row">
                        <span class="text-caption tenant-info-text">{{ activeTenantAddress }}</span>
                    </div>
                </v-sheet>
                <v-divider></v-divider>
            </div>
            <perfect-scrollbar style="height: calc(100vh - 240px); max-height: 240px">
                <v-list class="py-0 theme-list" lines="two">
                    <v-list-item v-for="item in menu" :key="item.title" class="py-4 px-8 custom-text-primary"
                        :to="item.href">
                        <template v-slot:prepend>
                            <v-avatar size="40" class="rounded-lg" :class="'bg-light' + item.bgcolor">
                                <v-icon
                                  v-if="item.href === '/account/profile'"
                                  icon="mdi-card-account-details-outline"
                                  size="25"
                                  :class="'text-' + item.bgcolor"
                                />
                                <Icon
                                  v-else
                                  :icon="'solar:' + item.avatar"
                                  width="25"
                                  height="25"
                                  :class="'text-' + item.bgcolor"
                                />
                            </v-avatar>
                        </template>
                        <div>
                            <h6 class="text-h6 font-weight-medium mb-1 custom-title">{{ item.title }}</h6>
                        </div>
                        <p class="text-subtitle-1 font-weight-regular text-grey100">{{ item.subtitle }}</p>
                    </v-list-item>
                </v-list>
            </perfect-scrollbar>
            <div class=" pb-6 px-8 text-center">
                <v-btn color="error" size="large" rounded="pill" block @click="handleLogout">Logout</v-btn>
            </div>
        </v-sheet>
    </v-menu>
</template>

<style scoped>
.tenant-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.tenant-info-panel {
  background-color: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
}

.tenant-info-text {
  line-height: 1.35;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.45);
}
</style>
