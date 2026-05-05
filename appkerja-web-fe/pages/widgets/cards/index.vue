<script setup lang="ts">
import { ref } from 'vue';
/*Call Components*/
import TopCards from '@/components/widgets/cards/TopCards.vue';
import CongratsCard from '@/components/widgets/cards/CongtsCard.vue';
import ProfileBoxCards from '@/components/widgets/cards/ProfileBoxCards.vue';
import FigmaCard from "@/components/dashboards/dashboard2/FigmaCard.vue";
import UpcommingSchedule from "@/components/dashboards/dashboard2/UpcommingSchedule.vue";
import RecentTransaction from "@/components/widgets/cards/RecentTransactions.vue";
import PaymentGateway from "@/components/widgets/cards/PaymentGateway.vue";
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
// theme breadcrumb
const page = ref({ title: 'Cards' });
const breadcrumbs = ref([
    {
        text: 'Home',
        disabled: false,
        href: '/'
    },
    {
        text: 'Cards',
        disabled: true,
        href: '#'
    }
]);

</script>
<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <!-- Top cards -->
        <v-col cols="12">
            <TopCards />
        </v-col>
        <!---Congrats Card-->
        <v-col cols="12" sm="12" md="6" class="d-flex">
            <CongratsCard />
        </v-col>
        <!---Profile / Figma Card-->
        <v-col cols="12" sm="12" md="6" class="d-flex">
            <v-row>
                <v-col cols="12" sm="6">
                    <ProfileBoxCards />
                </v-col>
                <v-col cols="12" sm="6" class="d-flex">
                    <FigmaCard />
                </v-col>
            </v-row>
        </v-col>
        <!---Upcomming schedule-->
        <v-col cols="12" sm="12" lg="4" md="6">
            <UpcommingSchedule />
        </v-col>
        <!---UpcommingActivity-->
        <v-col cols="12" sm="12" lg="4" md="6" class="d-flex">
            <PaymentGateway />
        </v-col>
         <!---Recent Transaction-->
         <v-col cols="12" sm="12" lg="4" class="d-flex">
            <RecentTransaction />
        </v-col>
    </v-row>
</template>
