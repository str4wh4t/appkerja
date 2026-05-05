<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { completeSsoOnboarding, getUserMe } from "@/services/graphql/auth.service";

definePageMeta({
  layout: "blank",
});

const router = useRouter();
const route = useRoute();
const { logoutClient: exitOnboarding } = useClientAuthLogout();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const firstName = ref("");
const lastName = ref("");
const username = ref("");
const phone = ref("");
const fullname = ref("");
const email = ref("");
const avatarUrl = ref<string | null>(null);
const loading = ref(false);
const profileLoaded = ref(false);
const loadError = ref("");
const usernameExternalError = ref("");
const phoneExternalError = ref("");
const firstNameExternalError = ref("");
const lastNameExternalError = ref("");

const displayLabel = computed(() => {
  const fn = fullname.value.trim();
  if (fn) return fn;
  const u = username.value.trim();
  if (u) return u;
  return email.value.trim() || "User";
});

const avatarInitials = computed(() => {
  const fn = firstName.value.trim();
  const ln = lastName.value.trim();
  if (fn && ln) return `${fn[0] || ""}${ln[0] || ""}`.toUpperCase();
  const src = displayLabel.value.trim() || "U";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase().slice(0, 2);
  }
  return src.slice(0, 2).toUpperCase();
});

const firstNameRules = [
  (v: string) => !!String(v || "").trim() || "First name is required",
  (v: string) =>
    String(v || "").trim().length <= 255 || "First name must be at most 255 characters",
];

const lastNameRules = [
  (v: string) =>
    String(v || "").trim().length <= 255 || "Last name must be at most 255 characters",
];

const usernameRules = [
  (v: string) => !!String(v || "").trim() || "Username is required",
  (v: string) =>
    String(v || "").trim().length >= 3 || "Username must be at least 3 characters",
  (v: string) =>
    String(v || "").trim().length <= 100 || "Username must be at most 100 characters",
  (v: string) =>
    /^[a-zA-Z0-9._-]+$/.test(String(v || "").trim()) ||
    "Only letters, numbers, dot, underscore, hyphen",
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

function clearSubmitFieldErrors() {
  usernameExternalError.value = "";
  phoneExternalError.value = "";
  firstNameExternalError.value = "";
  lastNameExternalError.value = "";
}

function assignServerMessage(message: string) {
  clearSubmitFieldErrors();
  if (/first name|firstname|nama depan|first_name/i.test(message)) {
    firstNameExternalError.value = message;
    return;
  }
  if (/last name|lastname|nama belakang/i.test(message)) {
    lastNameExternalError.value = message;
    return;
  }
  const usernameHints =
    /username|nama pengguna|user name|dipakai|taken|sudah|exists|unique/i.test(message);
  const lm = message.toLowerCase();
  if (usernameHints || lm.includes("username")) {
    usernameExternalError.value = message;
    return;
  }
  phoneExternalError.value = message;
}

const persistFullSession = (accessToken: string, refreshToken?: string | null) => {
  if (!import.meta.client) return;
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
  sessionStorage.removeItem("tokenPurpose");
};

const load = async () => {
  loadError.value = "";
  loading.value = true;
  try {
    const res = await getUserMe();
    const me = res.data?.usersMe;
    if (!me?.id) {
      loadError.value = "Could not load your profile. Please sign in again.";
      return;
    }
    if (!me.needsGoogleProfileCompletion) {
      if (import.meta.client) {
        sessionStorage.removeItem("tokenPurpose");
      }
      await router.replace("/dashboards/dashboard");
      return;
    }
    firstName.value = me.firstName ?? "";
    lastName.value = me.lastName ?? "";
    username.value = me.username ?? "";
    phone.value = me.phone ?? "";
    fullname.value = me.fullname?.trim() || "";
    email.value = me.email ?? "";
    avatarUrl.value = me.avatarUrl ?? null;
  } catch (e: unknown) {
    loadError.value =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : "Could not load your profile.";
  } finally {
    loading.value = false;
    profileLoaded.value = true;
  }
};

const submit = async () => {
  clearSubmitFieldErrors();
  const form = formRef.value;
  if (form) {
    const v = await form.validate();
    if (!v.valid) {
      return;
    }
  }
  const u = username.value.trim();
  const p = phone.value.trim();
  const fn = firstName.value.trim();
  const ln = lastName.value.trim();
  loading.value = true;
  try {
    const res = await completeSsoOnboarding({
      firstName: fn,
      lastName: ln.length > 0 ? ln : null,
      username: u,
      phone: p,
    });
    const login = res.data?.authCompleteSsoOnboarding;
    const access = login?.access_token;
    if (!access) {
      assignServerMessage("Unexpected response from server.");
      return;
    }
    persistFullSession(access, login?.refresh_token ?? null);
    const redirect = route.query.redirect;
    const raw = Array.isArray(redirect) ? redirect[0] : redirect;
    const target =
      typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
        ? raw
        : "/dashboards/dashboard";
    await router.push(target);
  } catch (e: unknown) {
    const msg =
      e && typeof e === "object" && "message" in e
        ? String((e as { message?: string }).message)
        : "Failed to save profile.";
    assignServerMessage(msg);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void load();
});
</script>

<template>
    <div class="authentication">
        <v-container fluid class="pa-3">
            <v-row class="h-100vh d-flex justify-center align-center">
                <v-col cols="12" class="d-flex align-center">
                    <div class="boxed-auth-wrap">
                        <v-card elevation="10" class="px-sm-1 px-0 mx-auto" max-width="450">
                            <v-card-item class="pa-sm-8">
                                <div class="d-flex justify-center mb-5">
                                    <LcFullLogo />
                                </div>
                                <div class="d-flex justify-center mb-5">
                                    <v-avatar size="96" rounded="circle" color="primary">
                                        <v-img v-if="avatarUrl" :src="avatarUrl" alt="" cover />
                                        <span v-else class="text-h6 font-weight-semibold text-white">{{
                                            avatarInitials
                                        }}</span>
                                    </v-avatar>
                                </div>
                                <h2 class="text-h5 font-weight-semibold text-center mb-1">
                                    Complete your profile
                                </h2>
                                <div class="text-body-2 text-medium-emphasis text-center mb-4">
                                    Confirm your name, username, and phone to continue.
                                </div>
                                <p
                                    v-if="loadError"
                                    class="text-error text-body-2 text-center mb-4"
                                    role="alert"
                                >
                                    {{ loadError }}
                                </p>
                                <v-progress-linear
                                    v-if="loading && !profileLoaded && !loadError"
                                    indeterminate
                                    height="4"
                                    rounded
                                    class="mb-4"
                                />
                                <v-form
                                    v-else-if="profileLoaded && (!loadError || username)"
                                    ref="formRef"
                                    validate-on="input lazy"
                                    class="mt-2"
                                    @submit.prevent="submit"
                                >
                                    <!-- Outlined fields: `label` on the control; hint / rules / server errors below -->
                                    <div class="mb-3">
                                        <v-text-field
                                            v-model="firstName"
                                            label="First name"
                                            color="primary"
                                            variant="outlined"
                                            density="compact"
                                            hide-details="auto"
                                            autocomplete="given-name"
                                            hint="Required"
                                            persistent-hint
                                            :rules="firstNameRules"
                                            :error-messages="
                                                firstNameExternalError ? [firstNameExternalError] : undefined
                                            "
                                            @update:model-value="firstNameExternalError = ''"
                                        />
                                    </div>
                                    <div class="mb-3">
                                        <v-text-field
                                            v-model="lastName"
                                            label="Last name"
                                            color="primary"
                                            variant="outlined"
                                            density="compact"
                                            hide-details="auto"
                                            autocomplete="family-name"
                                            hint=""
                                            persistent-hint
                                            :rules="lastNameRules"
                                            :error-messages="
                                                lastNameExternalError ? [lastNameExternalError] : undefined
                                            "
                                            @update:model-value="lastNameExternalError = ''"
                                        />
                                    </div>
                                    <div class="mb-3">
                                        <v-text-field
                                            v-model="username"
                                            label="Username"
                                            color="primary"
                                            variant="outlined"
                                            density="compact"
                                            hide-details="auto"
                                            autocomplete="username"
                                            hint="3–100 characters: letters, numbers, . _ -"
                                            persistent-hint
                                            :rules="usernameRules"
                                            :error-messages="
                                                usernameExternalError ? [usernameExternalError] : undefined
                                            "
                                            @update:model-value="usernameExternalError = ''"
                                        />
                                    </div>
                                    <div class="mb-3">
                                        <v-text-field
                                            v-model="phone"
                                            label="Phone"
                                            color="primary"
                                            variant="outlined"
                                            density="compact"
                                            hide-details="auto"
                                            autocomplete="tel"
                                            hint="Required, at least 8 characters"
                                            persistent-hint
                                            :rules="phoneRules"
                                            :error-messages="phoneExternalError ? [phoneExternalError] : undefined"
                                            @update:model-value="phoneExternalError = ''"
                                        />
                                    </div>
                                    <v-btn
                                        size="large"
                                        type="submit"
                                        color="primary"
                                        block
                                        rounded="pill"
                                        class="mt-8"
                                        :loading="loading"
                                    >
                                        Continue
                                    </v-btn>
                                </v-form>
                                <h6
                                    v-if="email"
                                    class="text-subtitle-1 text-grey100 d-flex justify-center align-center mt-6 flex-wrap text-center"
                                >
                                    Signing in as
                                    <span class="font-weight-medium pa-1 text-body-2 text-wrap">{{ email }}</span>
                                </h6>
                                <h6 class="text-subtitle-1 text-grey100 d-flex justify-center align-center mt-3">
                                    Wrong account?
                                    <v-btn
                                        class="pl-0 text-primary text-body-1 opacity-1 pl-2"
                                        height="auto"
                                        variant="plain"
                                        @click="exitOnboarding"
                                    >
                                        Exit
                                    </v-btn>
                                </h6>
                            </v-card-item>
                        </v-card>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
