<script setup lang="ts">
import { ProgressReportData } from '@/_mockApis/components/school-pages/detail_tables';
</script>
<template>
    <v-card elevation="10">
        <v-card-text>
            <h5 class="text-h5 font-weight-semibold">Progress Report</h5>
            <div class="border-table mt-5">
                <v-table class="month-table">
                    <thead>
                        <tr>
                            <th class="text-h6 text-no-wrap">Code</th>
                            <th class="text-h6 text-no-wrap">Subject Name</th>
                            <th class="text-h6 text-no-wrap">Marks</th>
                            <th class="text-h6 text-no-wrap">Grade</th>
                            <th class="text-h6 text-no-wrap">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in ProgressReportData" :key="item.code" class="month-item">
                            <td>
                                <h6 class="text-subtitle-1 font-weight-medium text-grey200">{{ item.code }}</h6>
                        </td>
                        <td class="text-subtitle-1 font-weight-medium text-grey200 text-no-wrap mt-1">{{ item.sub }}</td>
                            <td>
                                <div class="">
                                    <div class="text-subtitle-2 font-weight-medium text-grey200 mb-1">{{ item.marks }}</div>
                                    <v-progress-linear height="7" :color="item.statuscolor" :bg-color="'light' + item.statuscolor" rounded
                                        :model-value="item.marks"></v-progress-linear>
                                    
                                </div>
                            </td>
                            <td :class="'text-subtitle-1 font-weight-semibold  text-no-wrap mt-1 text-' + item.statuscolor">{{ item.grad }}</td>
                            <td :class="'text-subtitle-1 font-weight-semibold  text-no-wrap mt-1 text-' + item.remarkcolor">{{ item.remarks }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </div>
        </v-card-text>
    </v-card>
</template>

