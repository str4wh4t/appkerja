<script setup lang="ts">
import { ref } from "vue";
import { TeacherSkillData } from '@/_mockApis/components/school-pages/detail_tables';
import type { CircleCheckIcon } from "vue-tabler-icons";
/*tab*/
const tab = ref(null);
</script>
<template>
    <div class="upcomming-schedule">
        <v-tabs v-model="tab" bg-color="transparent" min-height="42" height="42">
            <v-tab value="Skill" color="white" class="text-h6 mr-3 v-btn--elevated" rounded="pill" >Teacher Skill</v-tab>
            <v-tab value="Salary" color="white" class="text-h6 v-btn--elevated" rounded="pill">Salary</v-tab>
        </v-tabs>
        <VCard elevation="10" class="mt-6">
            <v-card-text>
                <div class="justify-center">

                    <v-window v-model="tab">
                        <v-window-item value="Skill">

                            <h5 class="text-h5 font-weight-semibold pb-3">Teacher Skill</h5>
                            <v-divider></v-divider>
                            <div class="border-table mt-5">
                                <v-table class="month-table">
                                    <thead>
                                        <tr>
                                            <th class="text-h6 text-no-wrap">Code</th>
                                            <th class="text-h6 text-no-wrap">Subject Name</th>
                                            <th class="text-h6 text-no-wrap">Marks</th>
                                            <th class="text-h6 text-no-wrap">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in TeacherSkillData" :key="item.code" class="month-item">
                                            <td>
                                                <h6 class="text-subtitle-1 font-weight-medium text-grey200">{{ item.code }}</h6>
                                            </td>
                                            <td class="text-subtitle-1 font-weight-medium text-grey200 text-no-wrap mt-1">{{ item.sub }}
                                            </td>
                                            <td>
                                                <div class="">
                                                    <div class="text-subtitle-2 font-weight-medium text-grey200 mb-1">{{ item.marks }}</div>
                                                    <v-progress-linear height="7" :color="item.statuscolor" :bg-color="'light' + item.statuscolor" rounded
                                                        :model-value="item.marks"></v-progress-linear>

                                                </div>
                                            </td>
                                            <td
                                                :class="'text-subtitle-1 font-weight-semibold textSecondary text-no-wrap mt-1 text-' + item.statuscolor">
                                                {{ item.grad }}</td>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </div>


                        </v-window-item>
                        <v-window-item value="Salary">


                            <div class="mb-4 border-bottom pb-3">
                                <h5 class="text-h5 font-weight-semibold">Salary Report</h5>
                            </div>

                            <div class="d-flex justify-space-between mt-12 w-100">
                                <div class="text-subtitle-1 text-grey100 d-flex align-items-center">
                                    Standard
                                </div>

                                <div class="d-flex align-items-center">
                                    <div class="d-flex justify-content-end">
                                        <sup class="text-h5 mt-3 text-primary mr-1">$</sup>
                                        <h1 class="display-1 font-weight-light mb-0 text-primary">50</h1>
                                        <sub class="text-h4 mt-6 text-grey100 font-weight-regular">/ month</sub>
                                    </div>
                                </div>
                            </div>



                            <ul class="g-2 my-4">
                                <li class="mb-2 d-flex align-center">
                                    <CircleCheckIcon stroke-width="1.5" size="20" class="text-success"></CircleCheckIcon>
                                    <span class="text-subtitle-1 text-grey100 pl-2">3 Periods per day</span>
                                </li>

                                <li class="mb-2 d-flex align-center">
                                    <CircleCheckIcon stroke-width="1.5" size="20" class="text-success"></CircleCheckIcon>
                                    <span class="text-subtitle-1 text-grey100 pl-2">Included Documents</span>
                                </li>

                                <li class="mb-2 d-flex align-center">
                                    <CircleCheckIcon stroke-width="1.5" size="20" class="text-success"></CircleCheckIcon>
                                    <span class="text-subtitle-1 text-grey100 pl-2">Free Books</span>
                                </li>

                                <li class="mb-2 d-flex align-center">
                                    <CircleCheckIcon stroke-width="1.5" size="20" class="text-success"></CircleCheckIcon>
                                    <span class="text-subtitle-1 text-grey100 pl-2">Students Help Salary</span>
                                </li>
                            </ul>
                            <div class="d-flex align-center justify-space-between mb-2 mt-6">
                                <h5 class="text-h6 text-grey100">Days</h5>
                                <div class="text-subtitle-1 text-grey100">75% Completed</div>
                            </div>
                            <v-progress-linear model-value="75" height="7" color="primary" bg-color="lightprimary" rounded></v-progress-linear>
                            <div class="progress bg-light-primary mb-1">
                                <div class="progress-bar bg-primary w-75" role="progressbar" aria-valuenow="75"
                                    aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <span class="text-subtitle-1 text-grey100">4 days remaining</span>
                            <div class="d-grid w-100 mt-4 pt-2">
                                <v-btn color="primary"  class="mt-4 mb-2"> Pay Full Salary</v-btn>
                            </div>

                        </v-window-item>
                    </v-window>

                </div>
            </v-card-text>
        </VCard>
    </div>
</template>