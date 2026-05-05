<script setup lang="ts">
import { appsLink } from '@/_mockApis/headerData';
</script>
<template>
    <!-- ---------------------------------------------- -->
    <!-- apps link -->
    <!-- ---------------------------------------------- -->
    <div class="py-4">
        <v-row>
            <v-col cols="12" lg="6" v-for="(item, i) in appsLink" :key="i">
                <NuxtLink :to="item.href" class="text-decoration-none custom-text-primary">
                    <div class="d-flex align-center">
                        <v-avatar size="45" color="lightsecondary" rounded="md">
                            <img :src="item.avatar" width="24" height="24" :alt="item.avatar" />
                        </v-avatar>
                        <div class="ml-3">
                            <h6 class="text-subtitle-1 font-weight-semibold mb-1 custom-title text-grey200">{{ item.title }}</h6>
                            <p class="text-subtitle-2 text-grey100 font-weight-medium">{{ item.subtext }}</p>
                        </div>
                    </div>
                </NuxtLink>
            </v-col>
        </v-row>
    </div>
</template>
