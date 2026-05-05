<script setup lang="ts">
import { ref } from "vue";
const rating = ref(3);
</script>
<template>
    <div>
        <ClientOnly><v-rating v-model="rating" density="compact" color="warning"></v-rating></ClientOnly>
    </div>
</template>
