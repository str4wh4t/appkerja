<script setup lang="ts">
import { ref } from "vue";
import { UserCircleIcon, LockIcon } from "vue-tabler-icons";
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import ProfileAccountTab from "@/components/pages/profile/ProfileAccountTab.vue";
import ProfileSecurityTab from "@/components/pages/profile/ProfileSecurityTab.vue";

definePageMeta({
  middleware: ["auth"],
});

const tab = ref("Account");

const page = ref({ title: "My profile" });
const breadcrumbs = ref([
  { text: "Home", disabled: false, href: "/" },
  { text: "My profile", disabled: true, href: "#" },
]);
</script>

<template>
  <v-row class="justify-center">
    <v-col cols="12" md="12">
      <v-card elevation="10" rounded="md">
        <v-tabs v-model="tab" bg-color="transparent" min-height="70" height="70" color="primary">
          <v-tab value="Account" class="">
            <UserCircleIcon class="mr-2" size="20" />
            Account
          </v-tab>
          <v-tab value="Security" class="">
            <LockIcon class="mr-2" size="20" />
            Security
          </v-tab>
        </v-tabs>
        <v-divider />
        <v-card-text class="pa-sm-6 pa-3 pb-sm-6 pb-6">
          <v-window v-model="tab">
            <v-window-item value="Account">
              <ProfileAccountTab />
            </v-window-item>
            <v-window-item value="Security">
              <ProfileSecurityTab />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
