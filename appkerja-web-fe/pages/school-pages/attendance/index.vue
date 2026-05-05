<script setup lang="ts">
import { ref } from 'vue';
import AttendenceSheet from '@/components/school-pages/attendence/AttendenceSheet.vue';
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
// theme breadcrumb
const page = ref({ title: 'Attendence Sheet' });
const breadcrumbs = ref([
    {
        text: 'Home',
        disabled: false,
        href: '/'
    },
    {
        text: 'Attendence Sheet',
        disabled: true,
        href: '#'
    }
]);
</script>
<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <v-card-text>
            <AttendenceSheet />
        </v-card-text>
    </v-card>
</template>
