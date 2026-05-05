<script setup lang="ts">
import { ref } from "vue";
import { LatestReviewData, tableActionData } from "@/_mockApis/components/dashboards/dashboard1";
import { SearchIcon } from "vue-tabler-icons";
const items = ref([
    { title: "Action" },
    { title: "Another action" },
    { title: "Something else here" },
]);
const page = ref(1);
</script>
<template>
    <VCard elevation="10">
        <v-card-text>
            <div class="d-sm-flex d-block justify-space-between d-block align-center mb-4">
                <div>
                    <h5 class="text-h5 mb-1 font-weight-semibold">
                        Latest Reviews
                    </h5>
                    <div class="text-subtitle-1 text-grey100 pb-1 font-weight-medium">Reviewd received across all channels
                    </div>
                </div>
                <div class="text-right my-sm-0 my-3">
                    <div class="d-flex align-center">
                        <div class="mr-3">
                            <v-text-field placeholder="Search" color="primary" density="compact" variant="outlined"
                                hide-details style="min-width: 230px;">
                                <SearchIcon size="20" stroke-width="1.5" class="mr-3" />
                            </v-text-field>
                        </div>
                        <v-btn size="40" variant="outlined" color="inputBorder" class="px-6">
                            <v-avatar size="22">
                                <DotsVerticalIcon size="20" color="grey100" />
                            </v-avatar>
                            <v-menu activator="parent">
                                <v-list>
                                    <v-list-item value="action" v-for="list in tableActionData" :key="list.listtitle"
                                        hide-details min-height="38">
                                        <v-list-item-title>
                                            <v-avatar size="20" class="mr-2">
                                                <component :is="list.icon" stroke-width="2" size="20" />
                                            </v-avatar>
                                            {{ list.listtitle }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-btn>
                    </div>
                </div>
            </div>
            <div class="border-table">
                <v-table class="mb-0">
                    <template v-slot:default>
                        <thead>
                            <tr>
                                <th class="pl-0"><v-checkbox color="primary" density="compact" hide-details></v-checkbox>
                                </th>
                                <th class="text-h6 font-weight-semibold">Products</th>
                                <th class="text-h6 font-weight-semibold">Customer</th>
                                <th class="text-h6 font-weight-semibold">Reviews</th>
                                <th class="text-h6 font-weight-semibold">Status</th>
                                <th class="text-h6 font-weight-semibold">Time</th>
                                <th class="text-h6 font-weight-semibold"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in LatestReviewData" :key="item.name" class="month-item">
                                <td class="pl-0">
                                    <v-checkbox color="primary" density="compact" hide-details></v-checkbox>
                                </td>
                                <td>
                                    <div class="d-flex align-center overflow-hidden">
                                        <img :src="item.img" alt="user" width="60" />
                                        <div class="mx-4" style="width: 130px;">
                                            <h6 class="text-h6 font-weight-semibold text-no-wrap text-truncate">
                                                {{ item.name }}
                                            </h6>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-center">
                                        <v-avatar size="32" class="mr-3">
                                            <img :src="item.profile" alt="profile" height="32" width="32" />
                                        </v-avatar>
                                        <div>
                                            <h6 class="text-h6 font-weight-semibold">{{ item.customername }}</h6>
                                            <div class="text-subtitle-1 text-grey200">{{ item.customeremail }}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div class="">
                                        <div class="ml-n1">
                                            <ClientOnly><v-rating v-model="item.review" hover density="comfortable" half-increments
                                                readonly size="x-small" color="warning"></v-rating></ClientOnly>
                                        </div>
                                        <p class="text-grey200 text-subtitle-1 font-weight-medium line-clamp mt-n1">{{
                                            item.reviewtext }}</p>
                                    </div>
                                </td>
                                <td>
                                    <v-chip :class="'font-weight-medium bg-light' + item.statuscolor" variant="outlined"
                                        size="x-small" :color="item.statuscolor">{{
                                            item.statustext
                                        }}</v-chip>
                                </td>
                                <td>
                                    <p class="text-subtitle-1 font-weight-medium text-grey200">{{ item.time }}</p>
                                </td>
                                <td class="text-right">
                                    <v-btn size="30" icon variant="flat" class="grey100">
                                        <v-avatar size="22">
                                            <DotsVerticalIcon size="20" color="grey100" />
                                        </v-avatar>
                                        <v-menu activator="parent">
                                            <v-list>
                                                <v-list-item value="action" v-for="list in tableActionData"
                                                    :key="list.listtitle" hide-details min-height="38">
                                                    <v-list-item-title>
                                                        <v-avatar size="20" class="mr-2">
                                                            <component :is="list.icon" stroke-width="2" size="20" />
                                                        </v-avatar>
                                                        {{ list.listtitle }}
                                                    </v-list-item-title>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </v-btn>
                                </td>
                            </tr>
                        </tbody>
                    </template>
                </v-table>
            </div>
            <v-divider></v-divider>
            <div class="d-sm-flex align-center justify-space-between pt-5">
                <div class="text-grey100 font-weight-medium text-subtitle-1 text-sm-left text-center mb-sm-0 mb-2">1-6 of 32</div>
                <div>
                    <v-pagination v-model="page"  :length="4" rounded="circle" density="compact" class="text-subtitle-1 text-grey100"></v-pagination>
                </div>
            </div>
        </v-card-text>
    </VCard>
</template>