<script setup lang="ts">
import { ref } from 'vue';
import { CircleIcon } from 'vue-tabler-icons';
import { recentTransaction } from '@/_mockApis/components/widget/card';
</script>
<template>
    <v-card elevation="10" >
        <v-card-item>
            <v-card-title class="text-h5 font-weight-semibold">Recent Transactions</v-card-title>
            <div class="recent-transaction mt-16 px-3">
                <div v-for="list in recentTransaction" :key="list.title">
                    <v-row class="d-flex mb-4">
                        <v-col cols="3" sm="3"  class="px-0 pt-0 pb-1 text-right">
                            <h6 class="text-subtitle-1 text-grey200 text-no-wrap font-weight-medium pr-2">{{ list.title }}</h6>
                        </v-col>
                        <v-col cols="1" sm="1" class="px-0 text-center pt-0 pb-1 mt-n1">
                            <CircleIcon size="13" stroke-width="2" :class="'text-' + list.textcolor" />
                            <div v-if="list.line" class="line mx-auto bg-borderColor"></div>
                        </v-col>
                        <v-col cols="7" sm="8" class="pt-0 pb-1">
                            <h6 v-if="list.boldtext" class="text-subtitle-1 text-grey200 font-weight-bold">{{ list.subtitle }}</h6>
                            <h6 v-else class="text-subtitle-1 text-grey200 font-weight-medium">{{ list.subtitle }}</h6>
                            <div class="mt-n1">
                                <NuxtLink :to="list.url" class="text-body-1 text-primary text-decoration-none" v-if="list.link">{{
                                    list.link
                                }}</NuxtLink>
                            </div>
                        </v-col>
                    </v-row>
                </div>
            </div>
        </v-card-item>
    </v-card>
</template>

<style lang="scss">
    @media screen and (max-width:1100px) and (min-width:1024px) {
        .recent-transaction{
            max-width: 40%;
        }
    }
    @media screen and (max-width:991px) and (min-width:767px) {
        .recent-transaction{
            max-width: 60%;
        }
    }
</style>