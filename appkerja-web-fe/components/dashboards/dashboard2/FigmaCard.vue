<script setup lang="ts">
import { profileImgData } from '@/_mockApis/components/dashboards/dashboard2';
</script>
<template>
    <v-card elevation="10">
        <div class="w-100 bg-lighterror">
            <v-card-item class="">
                <v-avatar rounded="lg" class="w-100 mt-2" size="135">
                    <img height="130" src="/images/backgrounds/gifts.png" />
                </v-avatar>
            </v-card-item>
        </div>
        <v-card-item class="">
            <NuxtLink to="/" class="text-h6 font-weight-semibold text-decoration-none color-inherit">Figma Tips and Tricks with Stephan</NuxtLink>
            <div class="text-subtitle-1 text-grey100 mt-2 mb-4">Checkout latest events going to happen in USA.</div>
            <div class="d-flex align-center pb-1">
                <v-avatar v-for="item in profileImgData" :key="item.img" size="32" class="mr-1">
                    <img :src="item.img" alt="profile" height="32" width="32">
                </v-avatar>
                <p class="text-subtitle-1 text-grey100 ml-2">+18</p>
            </div>
        </v-card-item>
    </v-card>
</template>