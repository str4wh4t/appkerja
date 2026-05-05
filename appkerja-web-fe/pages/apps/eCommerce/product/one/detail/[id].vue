<script setup lang="ts">
import { ref } from 'vue';
import ProductDetail from '@/components/apps/ecommerce/detail/one/ProductDetailOne.vue';
import RelatedProducts from '@/components/apps/ecommerce/detail/one/RelatedProductOne.vue';
</script>

<template>
    <!-- <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb> -->
    <v-row>
        <v-col cols="12">
            <v-card elevation="10">
                <v-card-text>
                    <ProductDetail />
                    <v-divider class="mt-10"></v-divider>
                    <RelatedProducts />
                </v-card-text>
            </v-card>
        </v-col>  
    </v-row>
</template>
