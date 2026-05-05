<script setup lang="ts">
import { computed } from "vue";

const config = useRuntimeConfig();
const appName = computed(() => String(config.public.appName || "Sipemu"));
const appUrl = computed(() => String(config.public.appUrl || "/"));
</script>
<template>
  <div class="logo">
    <a :href="appUrl" class="app-brand text-decoration-none text-h5 font-weight-bold text-primary">
      {{ appName }}
    </a>
  </div>
</template>

<style scoped>
.app-brand {
  letter-spacing: 0.2px;
}
</style>
