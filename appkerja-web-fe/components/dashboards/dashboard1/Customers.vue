<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';

/* Chart */
const chartOptions = computed(() => {
    return {
        series: [
            {
                name: 'monthly earnings',
                color: 'rgba(var(--v-theme-primary))',
                data: [25, 66, 20, 40, 12, 30],
            },
        ],
        chart: {
            fontFamily: `inherit`,
            type: "area",
            height: 103,
            sparkline: {
                enabled: true,
            },
            group: 'sparklines',

        },

        stroke: {
            curve: "smooth",
            width: 2,
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0,
                inverseColors: false,
                opacityFrom: 0.05,
                opacityTo: 0,
                stops: [20, 180],
            },
        },


        markers: {
            size: 0,
        },
        tooltip: {
            theme: "dark",
            fixed: {
                enabled: true,
                position: "right",
            },
            x: {
                show: false,
            },
        },
    };
});
</script>
<template>
    <v-card elevation="10" class="roun-">
        <v-card-text class="position-relative">
            <div class="d-flex justify-space-between d-block align-center">
                <div>
                    <h5 class="text-h5 mb-1 font-weight-semibold">
                        Customers
                    </h5>
                    <div class="text-subtitle-1 text-grey100 pb-1 font-weight-medium">Last 7 days</div>
                </div>
                <div class="text-right">
                    <h4 class="text-h5 mb-1 font-weight-semibold">6,380</h4>
                    <v-chip color="success" class="bg-lightsuccess" variant="outlined" size="x-small">+26.5%</v-chip>
                </div>
            </div>
            <div class="mt-10 mb-sm-12 mb-8">
                <ClientOnly><apexchart type="area" height="103" :options="chartOptions"
                    :series="chartOptions.series"> </apexchart></ClientOnly>
            </div>
            <div class="d-flex align-center justify-space-between mb-3">
                <div class="text-subtitle-1 text-grey100  font-weight-medium">April 07 - April 14</div>
                <div class="text-subtitle-1 text-grey100  font-weight-medium">6,380</div>
            </div>
            <div class="d-flex align-center justify-space-between pb-1">
                <div class="text-subtitle-1 text-grey100  font-weight-medium">Last Week</div>
                <div class="text-subtitle-1 text-grey100  font-weight-medium">4,298</div>
            </div>
        </v-card-text>
    </v-card>
</template>
