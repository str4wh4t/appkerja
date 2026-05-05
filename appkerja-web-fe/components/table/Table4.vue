
<script setup lang="ts">
import {basicTableData4,tableActionData} from '@/_mockApis/components/table/basicTables';
</script>
<template>
    <v-card elevation="0" class="mt-6 border">
        <div class="border-table">
        <v-table class="month-table">
            <thead>
                <tr>
                    <th class="text-subtitle-1 font-weight-semibold">Invoice</th>
                    <th class="text-subtitle-1 font-weight-semibold">Status</th>
                    <th class="text-subtitle-1 font-weight-semibold">Customer</th>
                    <th class="text-subtitle-1 font-weight-semibold">Progress</th>
                    <th class="text-subtitle-1 font-weight-semibold"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in basicTableData4" :key="item.name" class="month-item">
                    <td>
                        <h6 class="text-subtitle-1 font-weight-semibold text-no-wrap">{{ item.invoice}}</h6>
                    </td>
                    <td>
                        <v-chip rounded="pill" class="font-weight-medium py-4 pl-1 pr-2" :color="item.statuscolor" size="small">
                            <component :is="item.statusicon" stroke-width="2" size="18" class="mr-1"/>
                            {{ item.status }}
                        </v-chip>
                    </td>
                    <td>
                        <div class="d-flex align-center">
                            <v-avatar size="40">
                                <img :src="item.avatar" alt="avatar" height="40" />
                            </v-avatar>
                            <div class="ml-4">
                                <h6 class="text-subtitle-1 font-weight-semibold text-no-wrap">{{ item.name }}</h6>
                                <div class="text-subtitle-1 text-no-wrap font-weight-medium text-grey100">{{ item.handle }}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="d-flex align-center">
                            <v-progress-linear color="primary" rounded="sm" bg-color="lightprimary" :model-value="item.progress"></v-progress-linear>
                            <div >
                                <span class="text-subtitle-1  text-medium-emphasis ml-5">{{item.progress}}%</span>
                            </div>
                        </div>    
                    </td>
                    <td>
                        <v-btn size="30" icon variant="flat" class="grey100">
                            <v-avatar size="22">
                                <DotsVerticalIcon size="20" color="grey100" />
                            </v-avatar>
                            <v-menu activator="parent">
                                <v-list>
                                    <v-list-item
                                        value="action"
                                        v-for="list in tableActionData"
                                        :key="list.listtitle"
                                        hide-details
                                        min-height="38"
                                    >
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
        </v-table>
        </div>
    </v-card>
</template>

<style scoped>
.v-progress-linear{
    left: 0 !important;
    transform: none !important;
    position: relative;
    width: 70%;
}
</style>