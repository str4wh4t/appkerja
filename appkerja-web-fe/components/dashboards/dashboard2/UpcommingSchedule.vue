<script setup lang="ts">
import { ref } from "vue";
import { profileImgData } from '@/_mockApis/components/dashboards/dashboard2'
const items = ref([
    { title: "Action" },
    { title: "Another action" },
    { title: "Something else here" },
]);
/*tab*/
const tab = ref(null);
</script>
<template>
    <VCard elevation="10">
        <v-card-text>
            <div class="d-flex align-center  justify-space-between">
                <div>
                    <h5 class="text-h5 mb-1 font-weight-semibold">Upcoming Scheduls</h5>
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

            <v-row class="justify-center mt-3 upcomming-schedule tabs_group">
                <v-col cols="12" md="12">
                    <v-card elevation="0" rounded="md">
                        <v-tabs v-model="tab" bg-color="transparent" min-height="40" height="40" grow>
                            <v-tab value="Account" color="white" class="text-h6 " rounded="pill">1 to 3</v-tab>
                            <v-tab value="Notification" color="white" class="text-h6" rounded="pill">4 to 7</v-tab>
                            <v-tab value="Bills" color="white" class="text-h6" rounded="pill">8 to 10</v-tab>
                        </v-tabs>
                        <v-divider class="mt-1"></v-divider>

                    </v-card>

                    <v-window v-model="tab">
                        <v-window-item value="Account">
                            <perfect-scrollbar style="height: 360px" class="mt-6 pt-4">
                                <div class="d-flex">
                                    <div>
                                        <ul>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">8:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">8:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">9:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">9:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">10:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">10:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">11:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">11:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">12:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">12:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">13:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-0 text-subtitle-1 text-grey100">13:30</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="flex-grow-1 flex-shrink-0 mx-4">
                                        <v-card elevation="10" class="border-left-indigo mt-7 " rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">Marketing Meeting</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">08:30 - 10:00</span>
                                                </div>
                                                <div class="d-flex align-center mt-12 gap-3">
                                                    <div>
                                                        <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                            class="mr-n1">
                                                            <img :src="item.img" alt="profile" height="32" width="32">
                                                        </v-avatar>
                                                    </div>
                                                    <p class="text-subtitle-1 text-grey100 ">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                        <v-card elevation="10" class="border-left-success mt-7" rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">Applied mathematics</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">10:15 - 11:45</span>
                                                </div>
                                                <div class="d-flex align-center mt-12 gap-3">
                                                    <div>
                                                        <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                            class="mr-n1">
                                                            <img :src="item.img" alt="profile" height="32" width="32">
                                                        </v-avatar>
                                                    </div>
                                                    <p class="text-subtitle-1 text-grey100 ">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                        <v-card elevation="10" class="border-left-error mt-7" rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">SEO Session with Team</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">12:00 - 13:25</span>
                                                </div>
                                                <div class="d-flex align-center mt-12 gap-3">
                                                    <div>
                                                        <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                            class="mr-n1">
                                                            <img :src="item.img" alt="profile" height="32" width="32">
                                                        </v-avatar>
                                                    </div>
                                                    <p class="text-subtitle-1 text-grey100">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                    </div>
                                </div>
                            </perfect-scrollbar>
                        </v-window-item>
                        <v-window-item value="Notification">
                            <perfect-scrollbar style="height: 360px" class="mt-6 pt-4">
                                <div class="d-flex">
                                    <div>
                                        <ul>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">8:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">8:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">9:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">9:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">10:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">10:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">11:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">11:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">12:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">12:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">13:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-0 text-subtitle-1 text-grey100">13:30</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="flex-grow-1 flex-shrink-0 mx-4">
                                        <v-card elevation="10" class="border-left-indigo mt-7" rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">Marketing Meeting</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">08:30 - 10:00</span>
                                                </div>
                                                <div class="d-flex align-center gap-3 mt-12">
                                                    <div>
                                                        <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                            class="mr-n1">
                                                            <img :src="item.img" alt="profile" height="32" width="32">
                                                        </v-avatar>
                                                    </div>
                                                    <p class="text-subtitle-1 text-grey100">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                        <v-card elevation="10" class="border-left-success mt-7" rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">Applied mathematics</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">10:15 - 11:45</span>
                                                </div>
                                                <div class="d-flex align-center gap-3 mt-12">
                                                    <div>
                                                    <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                        class="mr-n1">
                                                        <img :src="item.img" alt="profile" height="32" width="32">
                                                    </v-avatar>
                                                </div>
                                                    <p class="text-subtitle-1 text-grey100 ">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                        <v-card elevation="10" class="border-left-error mt-7" rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">SEO Session with Team</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">12:00 - 13:25</span>
                                                </div>
                                                <div class="d-flex align-center gap-3 mt-12">
                                                    <div>
                                                    <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                        class="mr-n1">
                                                        <img :src="item.img" alt="profile" height="32" width="32">
                                                    </v-avatar>
                                                </div>
                                                    <p class="text-subtitle-1 text-grey100 ">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                    </div>
                                </div>
                            </perfect-scrollbar>
                        </v-window-item>
                        <v-window-item value="Bills">
                            <perfect-scrollbar style="height: 360px;" class="mt-6 pt-4">
                                <div class="d-flex">
                                    <div>
                                        <ul>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">8:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">8:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">9:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">9:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">10:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">10:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">11:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">11:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">12:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">12:30</p>
                                            </li>
                                            <li>
                                                <p class="mb-5 pb-3 text-subtitle-1 text-grey100">13:00</p>
                                            </li>
                                            <li>
                                                <p class="mb-0 text-subtitle-1 text-grey100">13:30</p>
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="flex-grow-1 flex-shrink-0 mx-4">
                                        <v-card elevation="10" class="border-left-indigo mt-7" rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">Marketing Meeting</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">08:30 - 10:00</span>
                                                </div>
                                                <div class="d-flex align-center gap-3 mt-12">
                                                    <div>
                                                    <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                        class="mr-n1">
                                                        <img :src="item.img" alt="profile" height="32" width="32">
                                                    </v-avatar>
                                                    </div>
                                                    <p class="text-subtitle-1 text-grey100">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                        <v-card elevation="10" class="border-left-secondary mt-7" rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">Applied mathematics</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">10:15 - 11:45</span>
                                                </div>
                                                <div class="d-flex align-center gap-3 mt-12">
                                                    <div>
                                                    <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                        class="mr-n1">
                                                        <img :src="item.img" alt="profile" height="32" width="32">
                                                    </v-avatar>
                                                </div>
                                                    <p class="text-subtitle-1 text-grey100">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                        <v-card elevation="10" class="border-left-info mt-7" rounded="md">
                                            <div class="pa-4">
                                                <h6 class="text-h6 font-weight-semibold">SEO Session with Team</h6>
                                                <div class="d-flex align-center mt-2">
                                                    <ClockIcon stroke-width="1.5" size="18" class="text-grey100" />
                                                    <span class="text-subtitle-1 ml-1 text-grey100">12:00 - 13:25</span>
                                                </div>
                                                <div class="d-flex align-center gap-3 mt-12">
                                                    <div>
                                                    <v-avatar v-for="item in profileImgData" :key="item.img" size="32"
                                                        class="mr-n1">
                                                        <img :src="item.img" alt="profile" height="32" width="32">
                                                    </v-avatar>
                                                </div>
                                                    <p class="text-subtitle-1 text-grey100">+18</p>
                                                </div>
                                            </div>
                                        </v-card>

                                    </div>
                                </div>
                            </perfect-scrollbar>
                        </v-window-item>
                    </v-window>
                </v-col>
            </v-row>
        </v-card-text>
    </VCard>
</template>
