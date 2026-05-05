<script setup lang="ts">
import { ref } from 'vue';
/*Call Components*/
import ProfitExpanse from "@/components/dashboards/dashboard2/ProfitExpanse.vue";
import ProductSales from "@/components/dashboards/dashboard2/ProductSales.vue";
import NetSells from "@/components/widgets/charts/NetSells.vue";
import Payments from "@/components/dashboards/dashboard1/Payments.vue";
import Products from "@/components/dashboards/dashboard1/ProductsChart.vue";
import TraficDistribution from "@/components/widgets/charts/TraficDistributionChart.vue";
import Customers from "@/components/dashboards/dashboard1/Customers.vue";
import Payingchart from "@/components/widgets/charts/PayingChart.vue";
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
// theme breadcrumb
const page = ref({ title: 'Charts' });
const breadcrumbs = ref([
    {
        text: 'Home',
        disabled: false,
        href: '/'
    },
    {
        text: 'Charts',
        disabled: true,
        href: '#'
    }
]);
</script>
<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <!---Profit Expanse-->
        <v-col cols="12" sm="12" lg="8">
            <ProfitExpanse />
        </v-col>
        <!---Product Sales-->
        <v-col cols="12" sm="12" md="6" lg="4" class="d-flex">
            <ProductSales />
        </v-col>
        <!---Net Sales-->
        <v-col cols="12" sm="12" md="6" lg="6" class="d-flex">
            <NetSells />
        </v-col>
       <!-- Payment Card  -->
       <v-col cols="12" lg="3" sm="6"  class="d-flex">
          <Payments />
        </v-col>
        <!-- Product Card -->
        <v-col cols="12" lg="3" sm="6"  class="d-flex">
          <Products />
        </v-col>
        <!---Trafic Distribution-->
        <v-col cols="12" sm="12" lg="6" >
            <TraficDistribution />
        </v-col>
        <!-- Payingchart  -->
       <v-col cols="12" lg="3"  sm="6" class="d-flex">
            <Payingchart/>
        </v-col>
        <!-- Payment Card  -->
       <v-col cols="12" lg="3"  sm="6" class="d-flex">
          <Customers />
        </v-col>
    </v-row>
</template>
