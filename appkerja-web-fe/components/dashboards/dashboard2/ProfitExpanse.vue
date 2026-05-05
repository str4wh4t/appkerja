<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
import { DotsVerticalIcon } from 'vue-tabler-icons';
const items = ref([
    { title: "Action" },
    { title: "Another action" },
    { title: "Something else here" },
]);

/* Chart */
const chartOptions = computed(() => {
    return {
        series: [
            {
                name: "Profit",
                data: [60, 40, 37, 35, 35, 20, 30],
            },
            {
                name: "Expenses",
                data: [15, 30, 15, 35, 25, 30, 30],
            },
        ],
        colors: ['rgba(var(--v-theme-primary))', "#fb977d"],
        chart: {
            type: "bar",
            fontFamily: `inherit`,
            foreColor: "#adb0bb",
            width: "100%",
            height: 300,
            stacked: true,
            toolbar: {
                show: !1,
            },
        },

        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "27%",
                borderRadius: 6,
            },
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            borderColor: 'rgba(var(--v-theme-borderColor))',
            padding: { top: 0, bottom: -8, left: 20, right: 20 },
        },
        tooltip: {
            theme: "dark",
        },
        toolbar: {
            show: false,
        },
        xaxis: {
            categories: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: 'rgba(var(--v-theme-grey100))',
                }
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: 'rgba(var(--v-theme-grey100))',
                }
            },
        },
        legend: {
            show: false,
        },
    };
});

</script>
<template>
    <v-card elevation="10">
        <v-card-item>
            <div class="d-flex align-center justify-space-between">
                <div>
                    <h5 class="text-h5 mb-1 font-weight-semibold">Profit & Expenses</h5>
                </div>
                <div>
                    <v-menu bottom left>
                        <template v-slot:activator="{ props }">
                            <v-btn icon color="inherit" v-bind="props" flat>
                                <DotsVerticalIcon stroke-width="1.5" size="24" class="text-grey100" />
                            </v-btn>
                        </template>
                        <v-list density="compact">
                            <v-list-item v-for="(item, i) in items" :key="i" :value="i">
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </div>
            </div>

            <v-row>
                <v-col cols="12" sm="7" class="pt-7">
                    <ClientOnly><apexchart type="bar" class="profit-expense" height="300" :options="chartOptions"
                        :series="chartOptions.series"> </apexchart></ClientOnly>
                </v-col>
                <v-col cols="12" sm="5" class="mt-8 pb-6">
                    <div class="d-flex align-center gap-4 mb-6 pb-3">
                        <v-avatar class=" bg-lighterror">
                            <img src="/images/svgs/biology.svg" height="24" width="24">
                        </v-avatar>
                        <div>
                            <h5 class="text-h5 font-weight-semibold">$63,489.50</h5>
                            <h6 class="text-subtitle-1 text-grey100">Total Earnings</h6>
                        </div>
                    </div>
                    <div class="d-flex align-center gap-4  mb-6 pb-3">
                        <v-avatar class=" bg-lightinfo ">
                            <img src="/images/svgs/erase.svg" height="24" width="24">
                        </v-avatar>
                        <div>
                            <h5 class="text-h5 font-weight-semibold">$48,820.00 <span
                                    class="text-subtitle-2 text-success">23%</span></h5>
                            <h6 class="text-subtitle-1 text-grey100">Profit this year </h6>
                        </div>
                    </div>
                    <div class="d-flex align-center gap-4  mb-6 pb-3">
                        <v-avatar class=" bg-lightsecondary">
                            <img src="/images/svgs/globe.svg" height="24" width="24">
                        </v-avatar>
                        <div>
                            <h5 class="text-h5 font-weight-semibold">$103,582.50</h5>
                            <h6 class="text-subtitle-1 text-grey100">Overall earnings</h6>
                        </div>
                    </div>
                    <v-btn color="primary" class="mt-2 px-6" size="large" rounded="pill">View Full Report</v-btn>
                </v-col>
            </v-row>
        </v-card-item>
    </v-card>
</template>

<style type="text/css">
.profit-expense .apexcharts-bar-series.apexcharts-plot-series .apexcharts-series path {
    clip-path: inset(0 0 5% 0 round 20px);
}
</style>