<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Form } from 'vee-validate';
import { exchangeSsoToken, loginWithCredentials } from '@/services/graphql/auth.service';

/*Social icons*/
import google from '/images/svgs/google-icon.svg';

const router = useRouter();
const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const checkbox = ref(false);
const show1 = ref(false);
const password = ref('');
const username = ref('');
const loginError = ref('');
const usernameValidationError = ref('');
const passwordValidationError = ref('');
const isSsoProcessing = ref(false);
const usernameErrorMessages = computed(() =>
  [usernameValidationError.value, loginError.value].filter(Boolean)
);
const passwordErrorMessages = computed(() =>
  [passwordValidationError.value].filter(Boolean)
);
const passwordRules = ref([
    (v: string) => !!v || 'Password is required'
]);
const userOrEmailRules = ref([
    (v: string) => !!v || 'Username or E-mail is required',
    (v: string) => {
        const value = (v || '').trim();
        if (!value) return false;
        const isEmail = /.+@.+\..+/.test(value);
        const isUsername = /^[a-zA-Z0-9._-]{3,}$/.test(value);
        return isEmail || isUsername || 'Enter a valid username or e-mail';
    }
]);
const ssoLoginUrl = computed(() => String(runtimeConfig.public.ssoLoginUrl ?? '').trim());
const apiBaseUrl = computed(() => {
  const sso = ssoLoginUrl.value;
  const gql = String(runtimeConfig.public.graphqlEndpoint ?? '').trim();
  try {
    if (sso) return new URL(sso).origin;
    if (gql) return new URL(gql).origin;
  } catch {
    return '';
  }
  return '';
});

const getFirstQueryValue = (value: unknown): string => {
  if (Array.isArray(value)) return String(value[0] ?? '').trim();
  return typeof value === 'string' ? value.trim() : '';
};

const persistAuthSession = (
  accessToken: string,
  refreshToken?: string | null,
  tokenPurpose?: string | null,
) => {
  if (!import.meta.client) return;
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  if (tokenPurpose === 'google_onboarding') {
    sessionStorage.setItem('tokenPurpose', 'google_onboarding');
  } else {
    sessionStorage.removeItem('tokenPurpose');
  }
  sessionStorage.setItem('postLoginOverlay', '1');
};

const navigateAfterLogin = () => {
  router.push({ path: getSafeRedirectPath() });
};

const getRuleError = (value: string, rules: Array<(v: string) => boolean | string>) => {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      return typeof result === 'string' ? result : 'Invalid value';
    }
  }
  return '';
};

const handleSsoLogin = () => {
    if (!ssoLoginUrl.value || !import.meta.client) return;
    window.location.href = ssoLoginUrl.value;
};

const getSafeRedirectPath = () => {
  const redirect = route.query.redirect;
  const value = Array.isArray(redirect) ? redirect[0] : redirect;
  if (typeof value !== "string") return "/dashboards/dashboard";
  if (!value.startsWith("/")) return "/dashboards/dashboard";
  if (value.startsWith("//")) return "/dashboards/dashboard";
  return value;
};

async function validate() {
  loginError.value = '';
  usernameValidationError.value = '';
  passwordValidationError.value = '';

  usernameValidationError.value = getRuleError(username.value, userOrEmailRules.value);
  passwordValidationError.value = getRuleError(password.value, passwordRules.value);
  if (usernameValidationError.value || passwordValidationError.value) return;

  try {
    const response = await loginWithCredentials(username.value, password.value);
    const accessToken = response.data?.authLogin?.access_token;
    const refreshToken = response.data?.authLogin?.refresh_token;
    if (!accessToken) {
      loginError.value = 'Login response is invalid. Please check backend schema.';
      return;
    }

    persistAuthSession(accessToken, refreshToken);
    navigateAfterLogin();
  } catch (error: any) {
    loginError.value = error?.message || 'Login failed. Please try again.';
  }
}

const handleSsoCallback = async () => {
  const code = getFirstQueryValue(route.query.code);
  const success = getFirstQueryValue(route.query.success);
  const callbackError = getFirstQueryValue(route.query.error);

  if (callbackError) {
    loginError.value = callbackError;
    await router.replace({ path: route.path });
    return;
  }
  if (success && success !== 'true') {
    loginError.value = 'SSO login failed. Please try again.';
    await router.replace({ path: route.path });
    return;
  }
  if (!code) {
    return;
  }

  isSsoProcessing.value = true;
  loginError.value = '';
  try {
    if (!apiBaseUrl.value) {
      throw new Error('SSO API base URL is not configured.');
    }
    const result = await exchangeSsoToken(code, apiBaseUrl.value);
    if (!result?.access_token) {
      throw new Error('SSO exchange response is invalid.');
    }

    const purpose = result.token_purpose ?? null;
    persistAuthSession(result.access_token, result.refresh_token, purpose);
    await router.replace({ path: route.path });
    if (purpose === 'google_onboarding') {
      await router.push('/auth/complete-google-profile');
      return;
    }
    navigateAfterLogin();
  } catch (error: any) {
    loginError.value = error?.message || 'Failed to complete SSO login.';
    await router.replace({ path: route.path });
  } finally {
    isSsoProcessing.value = false;
  }
};

onMounted(async () => {
  if (import.meta.dev) {
    username.value = 'superadmin@local.com';
    password.value = 'superadmin123';
  }
  await handleSsoCallback();
});
</script>

<template>
    <v-row class="d-flex mb-3">
        <v-col cols="12">
            <v-btn
                variant="outlined"
                class="border text-gray200 font-weight-semibold google-btn"
                :disabled="!ssoLoginUrl"
                @click="handleSsoLogin"
                block
            >
                <img :src="google" height="24" width="24" alt="google" />
                <span class="google-btn-label">Continue with Google</span>
            </v-btn>
        </v-col>
    </v-row>
    <p v-if="!ssoLoginUrl" class="text-caption text-medium-emphasis mb-4">
        SSO link is not configured yet.
    </p>
    <div class="d-flex align-center text-center mb-6">
        <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
            <span class="bg-surface px-5 py-3 position-relative text-subtitle-1 text-grey100">or sign in with</span>
        </div>  
    </div>
    <Form @submit="validate" v-slot="{ isSubmitting }" class="mt-5">
<v-label class="text-subtitle-1 font-weight-semibold pb-2 text-grey200">Username or E-mail</v-label>
        <VTextField
            v-model="username"
            :rules="userOrEmailRules"
            :error-messages="usernameErrorMessages"
            @update:model-value="loginError = ''; usernameValidationError = ''"
            class="mb-8"
            required
            hide-details="auto"
        ></VTextField>
        <v-label class="text-subtitle-1 font-weight-semibold pb-2 text-grey200">Password</v-label>
        <VTextField
            v-model="password"
            :rules="passwordRules"
            :error-messages="passwordErrorMessages"
            @update:model-value="loginError = ''; passwordValidationError = ''"
            required
            hide-details="auto"
            :type="show1 ? 'text' : 'password'"
            :append-inner-icon="show1 ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="show1 = !show1"
            class="pwdInput"
        ></VTextField>
        <div class="d-flex flex-wrap align-center my-3 ml-n2">
            <!-- <v-checkbox v-model="checkbox" :rules="[(v:any) => !!v || 'You must agree to continue!']" required hide-details color="primary">
                <template v-slot:label class="">Remeber this Device</template>
            </v-checkbox>
            <div class="ml-sm-auto">
                <NuxtLink to="/auth/forgot-password" class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium"
                    >Forgot Password ?</NuxtLink
                >
            </div> -->
        </div>
        <v-btn class="mt-8" size="large" rounded="pill" color="primary" block type="submit" flat :loading="isSubmitting" :disabled="isSubmitting">
            Sign In
        </v-btn>
        <div class="text-center mt-4">
            <NuxtLink to="/" class="text-grey text-decoration-none">
                <v-icon size="16" icon="mdi-arrow-left" />
                Homepage
            </NuxtLink>
        </div>
    </Form>
    <p v-if="isSsoProcessing" class="text-caption text-medium-emphasis mt-4">
        Completing SSO login...
    </p>
</template>

<style scoped>
.google-btn {
    height: auto !important;
    min-height: 56px;
    border: 2px solid #111827 !important;
    background-color: #f3f4f6 !important;
}

.google-btn :deep(.v-btn__content) {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 12px;
    white-space: normal;
}

.google-btn-label {
    font-size: 1rem;
    font-weight: 600;
}
</style>
