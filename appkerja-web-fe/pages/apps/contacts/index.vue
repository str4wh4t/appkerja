<script setup lang="ts">
import { ref } from 'vue';
import EditableTable from '@/components/table/EditableTable.vue';
// theme breadcrumb
const page = ref({ title: 'Contact List' });
</script>

<template>
    <v-card elevation="10">
        <v-card-text>
            <h5 class="text-h5 font-weight-semibold mb-7">Contact List</h5>
                <EditableTable />
        </v-card-text>
    </v-card>
</template>
