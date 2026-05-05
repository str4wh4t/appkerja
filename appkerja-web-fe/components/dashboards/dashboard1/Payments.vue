<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
/* Chart */
const chartOptions = computed(() => {
    return {
        series: [
            {
                name: "Last Year ",
                data: [29, 52, 38, 47, 56, 41, 46],
            },
            {
                name: "This Year ",
                data: [71, 71, 71, 71, 71, 71, 71],
            },
        ],
        chart: {
            fontFamily: `inherit`,
            type: "bar",
            height: 150,
            stacked: true,
            toolbar: {
                show: false,
            },
        },

        grid: {
            show: false,
            borderColor: "rgba(0,0,0,0.1)",
            strokeDashArray: 1,
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
        },
        colors: ['rgba(var(--v-theme-primary))', "#D9D9D9"],
        plotOptions: {
            bar: {
                horizontal: false,
                // barHeight: "90%",
                columnWidth: "26%",
                borderRadius: [3],
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'all'
            },
        },
        dataLabels: {
            enabled: false,
        },

        xaxis: {
            categories: [["M"], ["T"], ["W"], ["T"], ["F"], ["S"], ["S"]],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            //For Change Text Color
            labels: {
                style: {
                    colors: 'rgba(var(--v-theme-grey100))'
                }
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
        legend: {
            show: false,
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
                        Payments
                    </h5>
                    <div class="text-subtitle-1 text-grey100 pb-1 font-weight-medium">Last 7 days</div>
                </div>
                <div class="text-right">
                    <h4 class="text-h5 mb-1 font-weight-semibold">12,389</h4>
                    <v-chip color="warning" class="bg-lightwarning" variant="outlined" size="x-small">-3.8%</v-chip>
                </div>
            </div>
            <div class="mb-4">
                <ClientOnly><apexchart type="bar" class="paymentchart" height="150" :options="chartOptions"
                    :series="chartOptions.series"> </apexchart></ClientOnly>
            </div>
            <div class="d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center">
                    <CircleIcon size="16" class="text-info" />
                    <div class="text-subtitle-1 text-grey100  font-weight-medium ml-1">Paypal</div>
                </div>
                <div class="text-subtitle-1 text-grey100  font-weight-medium">52%</div>
            </div>
            <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                    <CircleIcon size="16" class="text-grey100 text-disabled" />
                    <div class="text-subtitle-1 text-grey100 font-weight-medium ml-1">Credit Card</div>
                </div>
                <div class="text-subtitle-1 text-grey100  font-weight-medium">48%</div>
            </div>
        </v-card-text>
    </v-card>
</template>

<style type="text/css">
.paymentchart .apexcharts-bar-series.apexcharts-plot-series .apexcharts-series path {
    clip-path: inset(0 0 5% 0 round 20px);
}
</style>