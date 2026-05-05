<script setup lang="ts">
// assets
import imageEmpty from '/images/products/empty-shopping-cart.svg';
//import imageDarkEmpty from '/images/e-commerce/empty-dark.svg';
</script>

<template>
    <v-row class="d-flex justify-conent-center">
        <v-col class="text-center" lg="12">
            <v-img :src="imageEmpty" alt="cover" class="mx-auto my-10"  height="350" />
            <h1 class="text-h1">There is no Product</h1>
            <p>Try checking your spelling or use more general terms</p>
        </v-col>
    </v-row>
</template>
