<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
// common components
import TaskColumn from './TaskColumn.vue'
import { useTaskStore } from '@/stores/apps/kanban/task';


const store = useTaskStore();

onMounted(() => {
    store.fetchTasks();
});

const getTasks = computed(() => {
    return store.tasks;
});

const columns = getTasks;

</script>

<template>
    
    <v-card elevation="10">
        <div class="pa-5">
            <h5 class="text-h5 font-weight-semibold mb-7">Kanban Application</h5>
            <v-row>
                <v-col cols="12" md="3" sm="6" class="d-flex" v-for="column in columns" :key="column.id">
                    <TaskColumn :column="column" />
                </v-col>
            </v-row>
        </div>
    </v-card>
</template>
