<script setup lang="ts">
import { ref } from 'vue';
import { profileImages } from '@/_mockApis/components/dashboards/dashboard1';
</script>
<template>
    <v-card elevation="10" class="roun-">
        <v-card-text class="position-relative">
            <div class="d-flex justify-space-between d-block">
                <div>
                    <h5 class="text-h5 mb-1 font-weight-semibold">
                        Latest Deal
                    </h5>
                    <div class="text-subtitle-1 text-grey100 pb-1 font-weight-medium">Last 7 days</div>
                </div>
                <div class="mt-1 text-right">
                    <v-chip color="success" class="bg-lightsuccess" variant="outlined" size="x-small">86.5%</v-chip>
                </div>
            </div>
            <div class="my-sm-14 my-8">
                <div class="d-flex align-center justify-space-between mb-2">
                    <h5 class="text-h6 font-weight-semibold">$98,500</h5>
                    <div class="text-subtitle-1 font-weight-semibold">$1,22,900</div>
                </div>
                <v-progress-linear model-value="80" height="7" bg-color="bglight" color="primary" rounded></v-progress-linear>
                <p class="text-subtitle-1 text-grey100 mt-2 font-weight-medium">Coupons used: 18/22</p>
            </div>
            <div class="pb-md-2">
                <h6 class="text-subtitle-1 font-weight-semibold mb-4">Recent Purchasers</h6>
                <v-avatar v-for="item in profileImages" :key="item.img" size="40" class="ms-n2 avatar-border">
                    <img :src="item.img" alt="profile" height="40" width="40" class="">
                </v-avatar>
                <v-avatar size="40" class="ms-n2 avatar-border bg-lightprimary text-subtitle-1 font-weight-semibold text-primary">
                    <div height="40" width="40">+8</div>
                </v-avatar>
            </div>
        </v-card-text>
    </v-card>
</template>
<style>
.avatar-border{
    border: 2px solid rgb(var(--v-theme-surface));
}
</style>