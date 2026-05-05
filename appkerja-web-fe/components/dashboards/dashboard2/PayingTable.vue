<script setup lang="ts">
import { ref } from "vue";
import { projectTableData } from "@/_mockApis/components/dashboards/dashboard2";
const items = ref([
    { title: "Action" },
    { title: "Another action" },
    { title: "Something else here" },
]);
</script>
<template>
    <VCard elevation="10">
        <v-card-text>
            <div class="d-flex align-center  justify-space-between">
                <div>
                    <h5 class="text-h5 mb-1 font-weight-semibold">Top Employees</h5>
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
            <div class="month-table">
            <v-table class="mt-5 mb-0">
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-subtitle-1 font-weight-semibold text-grey200 text-no-wrap">Profile</th>
                            <th class="text-subtitle-1 font-weight-semibold text-grey200 text-no-wrap">Hour Rate</th>
                            <th class="text-subtitle-1 font-weight-semibold text-grey200 text-no-wrap">Skills</th>
                            <th class="text-subtitle-1 font-weight-semibold text-grey200 text-no-wrap">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in projectTableData" :key="item.leadname" :class="item.activestate"
                            class="month-item">
                            <td>
                                <div class="d-flex align-center">
                                    <v-avatar size="50">
                                        <img :src="item.img" alt="user" width="50" />
                                    </v-avatar>
                                    <div class="mx-4">
                                        <h4 class="text-subtitle-1 font-weight-bold text-no-wrap text-grey200">
                                            {{ item.leadname }}
                                        </h4>
                                        <h6 class="text-subtitle-1  text-no-wrap font-weight-medium mt-1 text-grey200">
                                            {{ item.leademail }}
                                        </h6>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <h5 class="text-subtitle-1  font-weight-medium text-no-wrap text-grey200">
                                    {{ item.projectname }}
                                </h5>
                            </td>
                            <td>
                                <h4 class="text-subtitle-1 text-no-wrap font-weight-medium text-grey200">{{ item.skill }}</h4>
                            </td>
                            <td>
                                <v-chip :class="'text-subtitle-1 font-weight-medium bg-light'+ item.statuscolor" variant="outlined" size="x-small" :color="item.statuscolor" >{{ item.statustext
                                }}</v-chip>
                            </td>
                            
                        </tr>
                    </tbody>
                </template>
            </v-table>
        </div>
        </v-card-text>
    </VCard>
</template>