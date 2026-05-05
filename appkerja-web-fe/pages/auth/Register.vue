<script setup lang="ts">
/* Register form */
import RegisterForm from "@/components/auth/RegisterForm.vue";

definePageMeta({
  layout: "blank",
});
</script>
<template>
  <div class="login-app-wrapper">
    <div
      class="auth-login position-relative d-flex align-center justify-content-center px-lg-16 px-sm-8 px-3 rounded-xl"
    >
      <div
        class="auth-login-wrapper position-relative rounded-xl mx-lg-16 mx-4 mx-auto w-100"
      >
        <v-card elevation="0" class="overflow-hidden px-sm-3">
          <v-card-item class="px-sm-8 px-3">
            <LcFullLogo />
            <v-row class="justify-md-space-around align-center py-md-8">
              <v-col cols="12" lg="5" md="6" class="d-md-flex d-none">
                <img
                  src="/images/backgrounds/login-security.png"
                  class="w-100"
                  alt="login-background"
                />
              </v-col>
              <v-col cols="12" lg="5" md="6">
                <div class="mt-xl-0 mt-5 mw-100">
                  <h2 class="text-h2 font-weight-bold mb-2">
                    Welcome to Spike Admin
                  </h2>
                  <div class="text-h6 mb-6 font-weight-medium mt-3 mb-8">
                    Your Admin Dashboard
                  </div>
                  <RegisterForm />
                  <h6
                    class="text-subtitle-1 text-grey100 d-flex align-center mt-6 font-weight-medium"
                  >
                    Already have an Account?
                    <v-btn
                      class="pl-0 text-primary text-body-1 opacity-1 pl-2 font-weight-medium"
                      height="auto"
                      to="/auth/login"
                      variant="plain"
                      >Sign In</v-btn
                    >
                  </h6>
                </div>
              </v-col>
            </v-row>
          </v-card-item>
        </v-card>
      </div>
    </div>
  </div>
</template>
