<script setup lang="ts">
import { useCustomizerStore } from '@/stores/customizer';
const customizer = useCustomizerStore();
</script>
// ===============================|| Blank Layout ||=============================== //
<template>
  <!-----RTL LAYOUT------->
  
  <v-locale-provider v-if="customizer.setRTLLayout" rtl>
    <v-app class="authpage" >
      <NuxtPage />
    </v-app>
  </v-locale-provider>

  <!-----LTR LAYOUT------->
  <v-locale-provider v-else>
    <v-app class="authpage" >
      <NuxtPage />
    </v-app>
  </v-locale-provider>

</template>

