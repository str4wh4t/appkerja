<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
const select = ref('March 2023');
const items = ref(['March 2023', 'April 2023', 'May 2023']);

/* Chart */
const chartOptions = computed(() => {
    return {
        series: [
            {
                name: "BTC",
                data: [10, 30, 20, 30, 27, 45, 100, 70, 60, 40, 90]
            },
            {
                name: "ETH",
                data: [20, -25, 5, 10, -10, 25, -20, -25, -25, 15, -20]
            },
        ],

        chart: {
            fontFamily: `inherit`,
            foreColor: "#adb0bb",
            height: 250,
            type: "line",
            toolbar: {
                show: false,
            },
            offsetX: -5,
            stacked: true
        },

        legend: {
            show: false,
        },
        stroke: {
            width: 2,
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
                    show: false,
                    
                }
                
            },
            padding: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
                
            },
        },
        colors: ['rgba(var(--v-theme-primary))', "#5AC8FA"],
       
        markers: {
            size: 0,
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
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov"
            ],
            axisTicks: {
                show: false,
            }
            
        },
        
        yaxis: {
            labels: {
                show: false,
            },
            
        },
        tooltip: {
            theme: "dark",
        },
    };
});
</script>
<template>
    <v-card elevation="10">
        <v-card-text class="position-relative pb-3">
            <div class="d-sm-flex justify-space-between d-block align-center">
                <div>
                    <h5 class="text-h4 mb-1 font-weight-semibold">
                        Net Sells
                    </h5>
                    <div class="text-subtitle-1 text-grey100 pb-1 font-weight-medium">Payment received across all channels
                    </div>
                </div>
                <div class="my-sm-0 my-3">
                    <v-select v-model="select" :items="items" variant="outlined" density="compact" hide-details></v-select>
                </div>
            </div>
            <div>
                <ClientOnly><apexchart type="line" class="netsell" height="250" :options="chartOptions" :series="chartOptions.series"> </apexchart></ClientOnly>
            </div>

        </v-card-text>
    </v-card>
</template>

