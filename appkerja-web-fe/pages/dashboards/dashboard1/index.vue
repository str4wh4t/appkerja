<script setup lang="ts">
import { ref } from "vue";
import CongratsCard from "@/components/dashboards/dashboard1/CongratulationsCard.vue";
import Payments from "@/components/dashboards/dashboard1/Payments.vue";
import Products from "@/components/dashboards/dashboard1/ProductsChart.vue";
import LatestDeal from "@/components/dashboards/dashboard1/LatestDeals.vue";
import Customers from "@/components/dashboards/dashboard1/Customers.vue";
import ProductsTable from "@/components/dashboards/dashboard1/ProductsTable.vue";
import VisitFromUsa from "@/components/dashboards/dashboard1/VisitFromUsa.vue";
import LatestReviews from "@/components/dashboards/dashboard1/LatestReviews.vue";
import Snackbar from "@/components/dashboards/snackbar.vue";
</script>

<template>
  <!-- Loader -->
  <Snackbar />
  <!-- Loader -->
  <v-row>
    <!-- Congratulation Card -->
    <v-col cols="12" sm="12" lg="6">
      <CongratsCard />
    </v-col>
    <v-col cols="12" sm="12" md="12" lg="6">
      <v-row>
        <!-- Payment Card  -->
        <v-col cols="12" sm="6">
          <Payments />
        </v-col>
        <!-- Product Card -->
        <v-col cols="12" sm="6" class="d-flex">
          <Products />
        </v-col>
        <!-- LatestDeal Card -->
        <v-col cols="12" sm="6">
          <LatestDeal />
        </v-col>
        <!-- Customer Card -->
        <v-col cols="12" sm="6" class="d-flex">
          <Customers />
        </v-col>
      </v-row>
    </v-col>
    <!-- Products Table  -->
    <v-col cols="12" sm="12" lg="8">
      <ProductsTable />
    </v-col>
    <!-- Visit From USA  -->
    <v-col cols="12" sm="12" lg="4">
      <VisitFromUsa />
    </v-col>
    <!-- Latest reviews -->
    <v-col cols="12" sm="12" lg="12">
      <LatestReviews />
    </v-col>
  </v-row>
</template>
