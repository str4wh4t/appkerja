<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { AttendanceData } from '@/_mockApis/components/school-pages/Attendance';

const select = ref('March');
const items = ref(['January', 'February', 'March']);
const entries = ref('10');
const entriesitems = ref(['10', '25', '50', '100']);

const page = ref(1);

</script>
<template>
    <div class="d-sm-flex justify-space-between d-block align-center mb-sm-8 mb-4">
        <h5 class="text-h5 font-weight-semibold">Attendence Sheet Of Section A</h5>
        <div class="my-sm-0 my-3">

            <v-select v-model="select" :items="items" variant="outlined" density="compact" hide-details></v-select>
        </div>
    </div>
    <div class="d-sm-flex justify-space-between d-block align-center mb-sm-8 mb-4">
        <div class="d-flex align-center text-subtitle-1 text-grey100">
            Show<v-select v-model="entries" :items="entriesitems" variant="outlined" density="compact" class="mx-2"
                hide-details></v-select>Entries
        </div>
        <div class="my-sm-0 my-3 d-flex align-center text-subtitle-1 text-grey100">
            Search:
            <v-text-field density="compact" class="ml-2" hide-details variant="outlined"
                style="min-width: 200px"></v-text-field>
        </div>
    </div>
    <div class="border-all-table attendence">
        <perfect-scrollbar>
        <v-table class="mt-5 ">
            <thead>
                <tr>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200">Students</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">1</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">2</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">3</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">4</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">5</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">6</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">7</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">8</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">9</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">10</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">11</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">12</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">13</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">14</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">15</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">16</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">17</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">18</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">19</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">20</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">21</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">22</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">23</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">24</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">25</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">26</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">27</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">28</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">29</th>
                    <th class="text-subtitle-1 font-weight-semibold text-grey200 text-center">30</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in AttendanceData" :key="item.avatar">
                    <!-- <td class="text-subtitle-1">{{ item.id }}</td> -->
                    <td>
                        <div class="d-flex align-center text-no-wrap">
                            <div>
                                <v-img :src="item.avatar" width="45px" class="rounded-circle img-fluid"></v-img>
                            </div>
                            <div class="ml-5">
                                <h6 class="text-subtitle-1 font-weight-semibold text-grey200">{{ item.name }}</h6>
                                <div class="text-subtitle-1 text-grey200 font-weight-medium text-no-wrap mt-1">Class: {{
                                    item.class }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day1" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day2" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day3" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day4" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day5" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day6" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day7" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day8" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day9" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day10" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day11" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day12" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day13" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day14" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day15" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day16" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day17" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day18" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day19" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day24" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day21" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day22" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day23" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day24" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day25" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day26" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day27" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day28" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day29" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-no-wrap">
                            <component :is="item.day30" stroke-width="1.5" size="24" />
                        </div>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </perfect-scrollbar>
    </div>
    <v-divider></v-divider>
    <div class="d-sm-flex align-center justify-space-between pt-3">
        <div class="text-grey100 font-weight-medium text-subtitle-1 text-sm-left text-center mb-sm-0 mb-2">Showing 1 to 8 of 8 entries</div>
        <div>
            <v-pagination v-model="page" density="compact" :length="4" rounded="circle"
                class="text-subtitle-1 text-grey100"></v-pagination>
        </div>
    </div>
</template>

<style>
.attendence .icon-tabler-check {
    color: rgb(var(--v-theme-success));
}

.attendence .icon-tabler-x {
    color: rgb(var(--v-theme-error));
}

.attendence .icon-tabler-minus {
    color: rgb(var(--v-theme-grey200));
    height: 10px;
    width: 10px;
    margin: 0 8px;
}</style>