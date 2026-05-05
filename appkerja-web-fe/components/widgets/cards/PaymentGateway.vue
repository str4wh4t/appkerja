<script setup lang="ts">
import { paymentGateways } from '@/_mockApis/components/widget/card';
</script>
<template>
    <v-card elevation="10" >
        <v-card-item>
            <v-card-title class="text-h5 font-weight-semibold">Payment Gateways</v-card-title>
            <v-card-subtitle class="text-subtitle-1 textSecondary">Platform For Income</v-card-subtitle>
            <div class="mt-10">
                <div class="d-flex align-center mb-7" v-for="list in paymentGateways" :key="list.title">
                    <v-avatar :class="'bg-light' + list.bgcolor" size="40">
                        <img :src="list.img" :alt="list.img" width="25" />
                    </v-avatar>
                    <div class="pl-4 mt-n1">
                        <h5 class="text-h6 font-weight-semibold">{{ list.title }}</h5>
                        <h6 class="text-subtitle-1 text-grey100 mt-1">{{ list.subtitle }}</h6>
                    </div>
                    <div :class="'ml-auto font-weight-medium text-subtitle-1 text-grey100 text-medium-' + list.disable">{{ list.rank }}</div>
                </div>
                <v-btn class="mt-10" block variant="outlined" size="large" color="primary" rounded="pill">View all transactions</v-btn>
            </div>
        </v-card-item>
    </v-card>
</template>
