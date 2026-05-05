<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';

/* Chart */
const chartOptions = computed(() => {
    return {
        series: [70, 18, 12],
        labels: ["2022", "2021", "2020"],
        chart: {
            height: 170,
            type: "donut",
            fontFamily: `inherit`,
            foreColor: "#adb0bb",
        },
        plotOptions: {
            pie: {
                startAngle: 0,
                endAngle: 360,
                donut: {
                    size: '85%',
                },
            },
        },
        stroke: {
            show: false,
        },

        dataLabels: {
            enabled: false,
        },

        legend: {
            show: false,
        },
        colors: ['rgba(var(--v-theme-primary))', "#FB977D", "#5AC8FA"],

        tooltip: {
            theme: "dark",
            fillSeriesColor: false,
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
                        Products
                    </h5>
                    <div class="text-subtitle-1 text-grey100 pb-1 font-weight-medium">Last 7 days</div>
                </div>
                <div class="text-right">
                    <h4 class="text-h5 mb-1 font-weight-semibold">432</h4>
                    <v-chip color="success" class="bg-lightsuccess" variant="outlined" size="x-small">+26.5%</v-chip>
                </div>
            </div>
            <div class="my-7">
                <ClientOnly><apexchart type="donut" class="paymentchart" height="170" :options="chartOptions"
                    :series="chartOptions.series"> </apexchart></ClientOnly>
            </div>
            <p class="text-subtitle-1 text-grey100 font-weight-medium text-center pb-1">$18k Profit more than last month</p>
        </v-card-text>
    </v-card>
</template>
