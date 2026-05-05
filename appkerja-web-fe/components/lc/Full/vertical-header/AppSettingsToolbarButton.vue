<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useCustomizerStore } from "@/stores/customizer";

const customizer = useCustomizerStore();
</script>

<template>
  <v-btn
    icon
    variant="text"
    size="small"
    class="custom-hover-primary"
    aria-label="Pengaturan"
    @click.stop="customizer.SET_APP_SETTINGS_DRAWER(true)"
  >
    <Icon icon="mdi:cog-outline" height="24" width="24" />
  </v-btn>
</template>
