<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
const rating = ref(4);

</script>

<template>

    <VCard elevation="0" class="bg-lightsecondary pa-4 mb-4">
        <div class="">
            <ClientOnly><v-rating color="warning" half-increments v-model="rating" size="small" density="compact" class="mb-2"> </v-rating></ClientOnly>
            <h5 class="text-h5 mb-3">Brooklyn Simmons</h5> 
            <p class="text-subtitle-1 text-grey200 font-weight-medium">"We're loving it. This is simply unbelievable! I like it more and more each day because it makes my life a lot easier."</p>
        </div>
    </VCard>
    <VCard elevation="0" class="bg-lightsecondary pa-4 mb-4">
        <div class="">
            <ClientOnly><v-rating color="warning" half-increments v-model="rating" size="small" density="compact" class="mb-2"> </v-rating></ClientOnly>
            <h5 class="text-h5 mb-3">Ralph Edwards</h5> 
            <p class="text-subtitle-1 text-grey200 font-weight-medium">"I'd be lost without it. It's incredible. It's is the real deal! Since I invested in it I made over 100,000 dollars profits."</p>
        </div>
    </VCard>
    <VCard elevation="0" class="bg-lightsecondary pa-4 mb-4">
        <div class="">
            <ClientOnly><v-rating color="warning" half-increments v-model="rating" size="small" density="compact" class="mb-2"> </v-rating></ClientOnly>
            <h5 class="text-h5 mb-3">Savannah Nguyen</h5> 
            <p class="text-subtitle-1 text-grey200 font-weight-medium">"I STRONGLY recommend it to EVERYONE interested in running a successful online business!"</p>
        </div>
    </VCard>
    <NuxtLink to="" class="text-primary text-subtitle-1 font-weight-medium">View all reviews</NuxtLink>
</template>
