<script setup lang="ts">
import { textCardsData } from '@/_mockApis/components/dashboards/dashboard2';
import { Icon } from '@iconify/vue';
</script>
<template>
    <v-row class="d-flex">
        <v-col v-for="item in textCardsData.slice(0,3)" :key="item.title" cols="12" sm="4" class="d-flex">
            <v-card elevation="10" color="primary" >
                <v-card-text class="pl-5 pr-7">
                    <img :src="item.shape" alt="shape" class="shape">
                    <Icon :icon="'solar:' + item.icon" width="30" height="30"   class="mb-6"/>
                    <h5 class="text-h4 font-weight-semibold mb-2 text-white">{{ item.num }}<span class="text-subtitle-2 pl-1">{{ item.percent }}</span></h5>
                    <p  class="text-subtitle-1 opacity-50 font-weight-medium">{{ item.title }}</p>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>
<style scoped>
.shape {
    position: absolute;
    right: 0;
    top: 0px;
}
</style>