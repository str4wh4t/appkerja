<script setup lang="ts">
/*form component*/
import TwoStepForm from "@/components/auth/TwoStepForm.vue";
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
                    Two Step Verification
                  </h2>
                  <div class="text-14 mb-6 font-weight-medium mt-3 mb-8">
                    We sent a verification code to your mobile. Enter the code
                    from the mobile in the field below.
                  </div>
                  <TwoStepForm />
                </div>
              </v-col>
            </v-row>
          </v-card-item>
        </v-card>
      </div>
    </div>
  </div>
</template>
