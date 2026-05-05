<script setup lang="ts">
import { ref } from "vue";
import StudentProfile from "@/components/school-pages/students/StudentProfile.vue";
import StudentReport from "@/components/school-pages/students/StudentReport.vue";
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
// theme breadcrumb
const page = ref({ title: 'Students Details' });
const breadcrumbs = ref([
    {
        text: 'Home',
        disabled: false,
        href: '/'
    },
    {
        text: 'Students Details',
        disabled: true,
        href: '#'
    }
]);
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="12" lg="4">
        <StudentProfile/>
    </v-col>
    <v-col cols="12" sm="12" lg="8">
        <StudentReport/>
    </v-col>
  </v-row>
</template>
