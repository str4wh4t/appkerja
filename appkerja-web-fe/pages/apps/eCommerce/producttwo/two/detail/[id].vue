<script setup lang="ts">
import { ref } from 'vue';
import ProductDetailTwo from '@/components/apps/ecommerce/detail/ProductDetail.vue';
import RelatedProducts from '@/components/apps/ecommerce/detail/RelatedProducts.vue';
import ProductTab from '@/components/apps/ecommerce/detail/ProductTab.vue';
</script>

<template>
    <v-row>
        <v-col cols="12">
            <v-card elevation="10">
                <v-card-text><ProductDetailTwo/> </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12">
            <ProductTab />
        </v-col>
        <v-col cols="12">
            <RelatedProducts />
        </v-col>
    </v-row>
</template>
