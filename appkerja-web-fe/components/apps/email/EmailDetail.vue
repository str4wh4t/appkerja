<!-- EmailDetail.vue -->
<script setup lang="ts">
import { useEmailStore } from "@/stores/apps/email";
import { Icon } from "@iconify/vue";
import type { EmailType } from "@/types/apps/EmailTypes";
const store = useEmailStore();
// Method to delete the selected email
const deleteEmail = () => {
  if (store.selectedEmail) {
    store.deleteEmail(store.selectedEmail.id);
  }
};

const toggleIcon = (email: EmailType): void => {
  store.toggleStarred(email.id); // Toggle the starred status
};
const toggleIconimportant = (email: EmailType): void => {
  store.toggleImportant(email.id); // Toggle the starred status
};
</script>

<template>
  <div v-if="store.selectedEmail" class="email-detail">
    <div class="d-flex align-center ga-1 pb-6">
      <v-btn
        icon
        rounded="circle"
        size="small"
        variant="text"
        color="primary"
        @click.stop="toggleIcon(store.selectedEmail)"
      >
        <icon
          v-if="store.selectedEmail.starred"
          icon="solar:star-bold"
          height="18"
          class="text-warning"
        />
        <icon v-else icon="solar:star-line-duotone" class="textPrimary" height="18" />
        <v-tooltip activator="parent" location="bottom">Star</v-tooltip>
      </v-btn>
      <v-btn
        icon
        rounded="circle"
        size="small"
        variant="text"
        color="primary"
        @click.stop="toggleIconimportant(store.selectedEmail)"
      >
      <icon
          v-if="store.selectedEmail.important"
          icon="solar:info-circle-bold"
          height="18"
          class="text-info"
        />
        <icon v-else icon="solar:info-circle-outline" class="textPrimary" height="18" />
        <v-tooltip activator="parent" location="bottom">Importnat</v-tooltip>
      </v-btn>
      <v-btn
        icon
        rounded="circle"
        size="small"
        variant="text"
        color="primary"
        @click="deleteEmail"
      >
        <icon icon="solar:trash-bin-minimalistic-linear" class="textPrimary" height="18" />
        <v-tooltip activator="parent" location="bottom">Delete</v-tooltip>
      </v-btn>
    </div>
    <div class="d-flex align-center justify-space-between mb-7">
      <div class="d-flex align-center ga-2">
        <v-avatar size="48">
          <img :src="store.selectedEmail.thumbnail" alt="user" width="48"
        /></v-avatar>
        <div>
          <h6 class="text-14 lh-normal">{{ store.selectedEmail.from }}</h6>
          <p class="text-14 lh-normal">{{ store.selectedEmail.To }}</p>
        </div>
      </div>
      <v-chip
        class="text-12"
        rounded="pill"
        :color="
          store.selectedEmail.label === 'Promotional'
            ? 'primary'
            : store.selectedEmail.label === 'Social'
            ? 'error'
            : store.selectedEmail.label === 'Health'
            ? 'success'
            : 'secondary'
        "
        variant="flat"
        size="small"
        label
        >{{ store.selectedEmail.label }}</v-chip
      >
    </div>
    <h5 class="text-20">{{ store.selectedEmail.subject }}</h5>
    <div class="email-content">
      <p class="opacity-80" v-html="store.selectedEmail.emailContent"></p>
    </div>
    <div v-if="store.selectedEmail.attchments != 0">
      <v-divider class="my-6"></v-divider>
      <h6 class="text-14 mb-3">Attachments</h6>
      <v-row>
        <v-col
          cols="12"
          md="4"
          v-for="item in store.selectedEmail.attchments"
          :key="item.id"
        >
          <div class="d-flex align-center ga-3">
            <v-avatar size="48" rounded="md" color="light">
              <img :src="item.image" alt="user" width="24" />
            </v-avatar>
            <div>
              <h5 class="text-14 lh-normal cursor-pointer hover-primary">
                {{ item.title }}
              </h5>
              <p class="text-14">{{ item.fileSize }}</p>
            </div>
          </div>
        </v-col>
      </v-row>
      <v-divider class="mt-6"></v-divider>
    </div>
    <div class="d-flex align-center ga-4 mt-6">
      <RouterLink
        to=""
        class="cursor-pointer link d-flex align-center ga-1 textPrimary hover-primary text-14"
        ><Icon icon="solar:undo-left-bold" height="16" />Reply</RouterLink
      >
      <RouterLink
        to=""
        class="cursor-pointer link d-flex align-center ga-1 textPrimary hover-primary text-14"
        ><Icon icon="solar:undo-right-bold" height="16" /> Forward</RouterLink
      >
    </div>
  </div>
  <div v-else>
    <v-alert color="error" variant="tonal" class="mb-4">
      <template v-slot:prepend>
        <v-icon class="text-24">mdi-alert-circle-outline</v-icon>
      </template>
      <div>Select an email to view its details.</div>
    </v-alert>
    <div class="mx-auto text-center">
      <img src="/images/backgrounds/empty_mail.png" alt="user" />
    </div>
  </div>
</template>
