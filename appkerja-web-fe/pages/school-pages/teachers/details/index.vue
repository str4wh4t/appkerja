<script setup lang="ts">
import { ref } from "vue";
import TeacherProfile from "@/components/school-pages/teachers/TeacherProfile.vue";
import TeacherSkills from "@/components/school-pages/teachers/TeacherSkills.vue";
// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
// theme breadcrumb
const page = ref({ title: 'Teacher Details' });
const breadcrumbs = ref([
    {
        text: 'Home',
        disabled: false,
        href: '/'
    },
    {
        text: 'Teacher Details',
        disabled: true,
        href: '#'
    }
]);
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="12" lg="4">
        <TeacherProfile/>
    </v-col>
    <v-col cols="12" sm="12" lg="8">
        <TeacherSkills/>
    </v-col>
  </v-row>
</template>
