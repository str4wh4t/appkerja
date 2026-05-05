<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getUserMe, changePassword } from "@/services/graphql/auth.service";
import {
  updateOwnProfile,
  updateOwnAvatarMultipart,
  deleteOwnAvatar,
  type UsersOwnUpdateProfileInput,
} from "@/services/graphql/users.service";

const runtimeConfig = useRuntimeConfig();

const firstName = ref("");
const lastName = ref("");
const phone = ref("");
const username = ref("");
const email = ref("");
const avatarUrl = ref<string | null>(null);
/** SSO-linked accounts: hide local password change UI. */
const isSsoAccount = ref(false);

const avatarFileInput = ref<HTMLInputElement | null>(null);
const avatarLoading = ref(false);
const avatarError = ref("");

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const passwordLoading = ref(false);
const passwordError = ref("");
const passwordChangeFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

/** Align with backend UsersService password policy (ASCII symbols). */
const NEW_PASSWORD_SYMBOL_RE =
  /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;

const newPasswordRules = [
  (v: string) => !!String(v || "").trim() || "New password is required",
  (v: string) =>
    String(v || "").length >= 8 || "Password must be at least 8 characters",
  (v: string) => /[0-9]/.test(String(v || "")) || "Include at least one number",
  (v: string) =>
    NEW_PASSWORD_SYMBOL_RE.test(String(v || "")) || "Include at least one symbol",
];

const confirmPasswordRules = computed(() => [
  (v: string) => !!String(v || "").trim() || "Confirm your new password",
  (v: string) =>
    String(v || "") === newPassword.value ||
    "Must match the new password exactly",
]);

const profileLoading = ref(false);
const loadError = ref("");
const profileSaveError = ref("");
const profileDetailsFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const successSnackbar = ref(false);
const successMessage = ref("");

const displayName = computed(() => {
  const fn = firstName.value.trim();
  const ln = lastName.value.trim();
  if (fn || ln) return [fn, ln].filter(Boolean).join(" ").trim();
  return username.value || "User";
});

const initials = computed(() => {
  const src = displayName.value.trim() || username.value || "U";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
});

const applyMe = (me: {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
}) => {
  firstName.value = me.firstName ?? "";
  lastName.value = me.lastName ?? "";
  phone.value = me.phone ?? "";
  username.value = me.username ?? "";
  email.value = me.email ?? "";
  avatarUrl.value = me.avatarUrl ?? null;
  isSsoAccount.value = Boolean(me.googleId && String(me.googleId).trim());
};

const load = async () => {
  loadError.value = "";
  profileLoading.value = true;
  try {
    const res = await getUserMe();
    const me = res.data?.usersMe;
    if (!me?.id) {
      loadError.value = "Could not load your profile.";
      return;
    }
    applyMe(me);
  } catch (e: unknown) {
    loadError.value =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : "Could not load your profile.";
  } finally {
    profileLoading.value = false;
  }
};

const firstNameRules = [
  (v: string) => !!String(v || "").trim() || "First name is required",
  (v: string) =>
    String(v || "").trim().length <= 255 || "First name must be at most 255 characters",
];

const lastNameRules = [
  (v: string) =>
    String(v || "").trim().length <= 255 || "Last name must be at most 255 characters",
];

const phoneRules = [
  (v: string) => !!String(v || "").trim() || "Phone is required",
  (v: string) =>
    String(v || "").trim().length >= 8 || "Phone must be at least 8 characters",
  (v: string) =>
    String(v || "").trim().length <= 20 || "Phone must be at most 20 characters",
  (v: string) =>
    /^\+?[0-9][0-9\s-]{7,19}$/.test(String(v || "").trim()) ||
    "Invalid phone number",
];

const saveProfile = async () => {
  profileSaveError.value = "";
  const form = profileDetailsFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }
  const firstTrim = firstName.value.trim();
  const phoneTrim = phone.value.trim();
  profileLoading.value = true;
  try {
    const payload: UsersOwnUpdateProfileInput = {
      firstName: firstTrim,
      lastName: lastName.value.trim() || null,
      phone: phoneTrim,
    };
    await updateOwnProfile(payload);
    await load();
    successMessage.value = "Profile saved.";
    successSnackbar.value = true;
  } catch (e: unknown) {
    profileSaveError.value =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : "Failed to save profile.";
  } finally {
    profileLoading.value = false;
  }
};

const openAvatarPicker = () => {
  avatarError.value = "";
  avatarFileInput.value?.click();
};

const onAvatarSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  avatarError.value = "";

  const endpoint = String(runtimeConfig.public.graphqlEndpoint ?? "").trim();
  const token = import.meta.client ? localStorage.getItem("accessToken") : null;
  if (!endpoint) {
    avatarError.value = "GraphQL endpoint is not configured.";
    return;
  }

  avatarLoading.value = true;
  try {
    await updateOwnAvatarMultipart(endpoint, token, file, { isPublicUpload: true });
    await load();
    successMessage.value = "Profile photo updated.";
    successSnackbar.value = true;
  } catch (e: unknown) {
    avatarError.value =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : "Failed to upload photo.";
  } finally {
    avatarLoading.value = false;
  }
};

const resetAvatar = async () => {
  avatarError.value = "";
  avatarLoading.value = true;
  try {
    await deleteOwnAvatar();
    await load();
    successMessage.value = "Profile photo removed.";
    successSnackbar.value = true;
  } catch (e: unknown) {
    avatarError.value =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : "Failed to remove photo.";
  } finally {
    avatarLoading.value = false;
  }
};

const submitPasswordChange = async () => {
  passwordError.value = "";
  const form = passwordChangeFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }
  passwordLoading.value = true;
  try {
    await changePassword(currentPassword.value, newPassword.value);
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
    successMessage.value = "Password updated.";
    successSnackbar.value = true;
  } catch (e: unknown) {
    passwordError.value =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : "Failed to update password.";
  } finally {
    passwordLoading.value = false;
  }
};

onMounted(() => {
  void load();
});
</script>

<template>
  <div>
    <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4" rounded="md">
      {{ loadError }}
    </v-alert>

    <v-row class="ma-sm-n2 ma-n1">
        <v-col cols="12" :sm="isSsoAccount ? 12 : 6">
          <v-card elevation="10">
            <v-card-item>
              <h5 class="text-h5">Change profile</h5>
              <div class="text-subtitle-1 text-grey100 mt-2">
                Change your profile picture from here
              </div>
              <v-alert
                v-if="avatarError"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-4"
                rounded="md"
              >
                {{ avatarError }}
              </v-alert>
              <div class="text-center mt-6 mb-6">
                <v-avatar size="120" color="primary" variant="tonal" class="font-weight-bold text-h4">
                  <v-img v-if="avatarUrl" :src="avatarUrl" cover alt="" />
                  <span v-else>{{ initials }}</span>
                </v-avatar>
              </div>
              <input
                ref="avatarFileInput"
                type="file"
                class="d-none"
                accept="image/jpeg,image/png"
                @change="onAvatarSelected"
              />
              <div class="d-flex justify-center flex-wrap ga-2">
                <v-btn
                  color="primary"
                  class="px-4 rounded-pill"
                  :loading="avatarLoading"
                  @click="openAvatarPicker"
                >
                  Upload
                </v-btn>
                <v-btn
                  color="error"
                  variant="outlined"
                  class="px-4 rounded-pill"
                  :disabled="avatarLoading || profileLoading"
                  @click="resetAvatar"
                >
                  Remove photo
                </v-btn>
              </div>
              <div class="text-subtitle-1 text-grey100 text-center my-sm-6 my-4">
                JPEG or PNG
              </div>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col v-if="!isSsoAccount" cols="12" sm="6">
          <v-card elevation="10">
            <v-card-item>
              <h5 class="text-h5">Change password</h5>
              <v-alert
                v-if="passwordError"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-4"
                rounded="md"
              >
                {{ passwordError }}
              </v-alert>
              <v-form
                id="profile-change-password-form"
                ref="passwordChangeFormRef"
                validate-on="input lazy"
                class="mt-5"
                @submit.prevent="submitPasswordChange"
              >
                <div class="mb-3">
                  <v-text-field
                    v-model="currentPassword"
                    label="Current password"
                    color="primary"
                    variant="outlined"
                    density="compact"
                    type="password"
                    autocomplete="current-password"
                    hide-details="auto"
                    :rules="[(v: string) => !!String(v || '').trim() || 'Current password is required']"
                  />
                </div>
                <div class="mb-3">
                  <v-text-field
                    v-model="newPassword"
                    label="New password"
                    color="primary"
                    variant="outlined"
                    density="compact"
                    type="password"
                    autocomplete="new-password"
                    hide-details="auto"
                    hint="At least 8 characters, including one number and one symbol (!@#$ etc.)"
                    persistent-hint
                    :rules="newPasswordRules"
                  />
                </div>
                <div class="mb-3">
                  <v-text-field
                    v-model="confirmPassword"
                    label="Confirm password"
                    color="primary"
                    variant="outlined"
                    density="compact"
                    type="password"
                    autocomplete="new-password"
                    hide-details="auto"
                    :rules="confirmPasswordRules"
                  />
                </div>
              </v-form>
            </v-card-item>
            <v-card-actions class="pa-5 border-t">
              <v-btn
                color="success"
                variant="tonal"
                class="px-4 rounded-pill"
                type="submit"
                form="profile-change-password-form"
                :loading="passwordLoading"
              >
                Update password
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card elevation="10">
            <v-card-item>
              <h5 class="text-h5">Personal details</h5>
              <div class="text-subtitle-1 text-grey100 mt-2">
                Confirm your name, username, and phone to continue. Username and email are read-only here; edit name
                and phone, then save.
              </div>
              <div
                v-if="email"
                class="text-subtitle-1 text-grey100 d-flex align-center flex-wrap ga-1 mt-3"
              >
                Signing in as
                <span class="font-weight-medium text-body-2 text-high-emphasis text-wrap">{{ email }}</span>
              </div>
              <v-alert
                v-if="profileSaveError"
                type="error"
                variant="tonal"
                density="compact"
                class="mt-4"
                rounded="md"
              >
                {{ profileSaveError }}
              </v-alert>
              <div class="mt-5">
                <v-form ref="profileDetailsFormRef" validate-on="input lazy" @submit.prevent="saveProfile">
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <div class="mb-3">
                        <v-text-field
                          color="primary"
                          variant="outlined"
                          density="compact"
                          label="Username"
                          :model-value="username"
                          readonly
                          autocomplete="username"
                          hide-details="auto"
                        />
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="mb-3">
                        <v-text-field
                          color="primary"
                          variant="outlined"
                          density="compact"
                          label="Email"
                          :model-value="email"
                          readonly
                          autocomplete="email"
                          hide-details="auto"
                        />
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="mb-3">
                        <v-text-field
                          v-model="firstName"
                          label="First name"
                          color="primary"
                          variant="outlined"
                          density="compact"
                          autocomplete="given-name"
                          hide-details="auto"
                          hint="Required"
                          persistent-hint
                          :rules="firstNameRules"
                          @update:model-value="profileSaveError = ''"
                        />
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="mb-3">
                        <v-text-field
                          v-model="lastName"
                          label="Last name"
                          color="primary"
                          variant="outlined"
                          density="compact"
                          autocomplete="family-name"
                          hide-details="auto"
                          hint=""
                          persistent-hint
                          :rules="lastNameRules"
                          @update:model-value="profileSaveError = ''"
                        />
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="mb-3">
                        <v-text-field
                          v-model="phone"
                          label="Phone"
                          color="primary"
                          variant="outlined"
                          density="compact"
                          autocomplete="tel"
                          hide-details="auto"
                          hint="Required, at least 8 characters"
                          persistent-hint
                          :rules="phoneRules"
                          required
                          @update:model-value="profileSaveError = ''"
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-form>
              </div>
            </v-card-item>
            <v-card-actions class="pa-5 border-t">
              <v-spacer />
              <v-btn
                color="success"
                variant="tonal"
                class="px-4 rounded-pill"
                :loading="profileLoading"
                @click="saveProfile"
              >
                Save
              </v-btn>
              <v-btn
                color="secondary"
                variant="tonal"
                class="px-4 rounded-pill"
                :disabled="profileLoading"
                @click="load"
              >
                Reload
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

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
  </div>
</template>
