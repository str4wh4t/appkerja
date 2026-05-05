<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';

import { Icon } from '@iconify/vue';
const select = ref('This Week');
const items = ref(['March 2023', 'April 2023', 'May 2023']);

/* Chart */
const chartOptions = computed(() => {
    return {
        series: [
            {
                name: "",
                data: [0, 20, 15, 19, 14, 25, 32]
            },
            {
                name: "",
                data: [0, 12, 19, 13, 26, 16, 25]
            },
        ],
      
        chart: {
            type: "line",
            fontFamily: `inherit`,
            foreColor: "#adb0bb",
            width: "100%",
            height: 260,
            toolbar: {
                show: false,
            },
            stacked: false
        },

        legend: {
            show: false,
        },
        stroke: {
            width: 3,
            curve: "smooth",  
        },
        grid: {
            borderColor: 'rgba(var(--v-theme-borderColor))',
           
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                },

            },
            padding: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            },
        },
        colors: ['rgba(var(--v-theme-primary))','#5AC8FA'],
       
        
        markers: {
            size: 0,
        },
        tooltip: {
            theme: "dark",
        },
        xaxis: {
            labels: {
                show: true,
                style: {
                    colors: 'rgba(var(--v-theme-grey100))',
                }
            },
            type: 'category',
            categories: [
                "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
            ],
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            },

        },
        yaxis: {
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
            labels: {
                style: {
                    colors: 'rgba(var(--v-theme-grey100))',
                }
            }
        }
    };
});
</script>
<template>
    <v-card elevation="10" >
        <v-card-text class="position-relative pb-0 border-bottom">
            <h5 class="text-h4 mb-1 font-weight-semibold">
                Congratulations Jonathan
            </h5>
            <div class="text-subtitle-1 text-grey100 pb-1 font-weight-medium">You have done 38% more sales</div>
            <div class="mt-6 d-sm-flex d-block">
                <ul class="list-unstyled mb-0">
                    <li class="d-flex align-center mb-5">
                        <v-avatar
                            class="bg-lightsuccess p-7 me-4 rounded-circle d-flex align-items-center justify-content-center"
                            size="48">
                            <Icon icon="solar:cart-3-line-duotone" height="24" width="24" class="text-success"/>
                        </v-avatar>
                        <div>
                            <h6 class="mb-1 text-h6 font-weight-semibold">64 new orders</h6>
                            <p class="text-subtitle-1 text-grey100  font-weight-medium">Processing</p>
                        </div>
                    </li>
                    <li class="d-flex align-center mb-5">
                        <v-avatar
                            class="bg-lightwarning p-7 me-4 rounded-circle d-flex align-items-center justify-content-center"
                            size="48">
                            <Icon icon="solar:pause-linear" height="24" width="24" class="text-warning"/>
                        </v-avatar>
                        <div>
                            <h6 class="mb-1 text-h6 font-weight-semibold">4 orders</h6>
                            <p class="text-subtitle-1 text-grey100  font-weight-medium">On hold</p>
                        </div>
                    </li>
                    <li class="d-flex align-center mb-5">
                        <v-avatar
                            class="bg-lightinfo p-7 me-4 rounded-circle d-flex align-items-center justify-content-center"
                            size="48">
                            <Icon icon="solar:delivery-linear" height="24" width="24" class="text-info"/>
                        </v-avatar>
                        <div>
                            <h6 class="mb-1 text-h6 font-weight-semibold">12 orders</h6>
                            <p class="text-subtitle-1 text-grey100  font-weight-medium">Delivered</p>
                        </div>
                    </li>
                </ul>
                <div class="man-working-on-laptop ml-auto mb-n1 mr-n8">
                    <img src="/images/backgrounds/man-working-on-laptop.png" class="w-100" alt="">
                </div>
            </div>
        </v-card-text>
        <v-card-text class="position-relative">
            <div class="d-sm-flex justify-space-between d-block align-center">
                <div>
                    <h5 class="text-h4 mb-1 font-weight-semibold">
                        Total Orders
                    </h5>
                    <div class="text-subtitle-1 text-grey100 pb-1 font-weight-medium">Weekly order updates</div>
                </div>
                <div class="my-sm-0 my-3">
                    <v-select v-model="select" :items="items" variant="outlined" density="compact" hide-details></v-select>
                </div>
            </div>
            <div>
                <ClientOnly><apexchart type="line" height="260" :options="chartOptions" :series="chartOptions.series"> </apexchart></ClientOnly>
            </div>

        </v-card-text>
    </v-card>
</template>