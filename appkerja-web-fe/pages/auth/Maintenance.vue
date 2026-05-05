<script setup lang="ts">
definePageMeta({
  layout: "blank",
});
</script>
<template>
    <div class="d-flex justify-center align-center text-center h-100">
        <div>
            <img src="/images/backgrounds/maintenance.svg" width="500" alt="under_construction" />
            <h1 class="text-h1">Opps!!!</h1>
            <h4 class="text-h4 my-8">Website is Under Construction. Check back later!</h4>
            <v-btn rounded="pill" color="primary" class="mb-4" to="/">Go Back to Home</v-btn>
        </div>    
    </div>
</template>
