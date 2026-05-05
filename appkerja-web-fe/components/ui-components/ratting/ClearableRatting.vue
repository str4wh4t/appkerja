<script setup lang="ts">
import { ref } from "vue";
const rating3 = ref(3);
</script>
<template>
    <div >
        <ClientOnly><v-rating v-model="rating3" clearable density="compact" color="warning"></v-rating></ClientOnly>
    </div>
</template>
