

<script setup lang="ts">
import {basicTableData3,tableActionData} from '@/_mockApis/components/table/basicTables';
</script>
<template>
    <v-card elevation="0" class="mt-6 border">
        <div class="border-table">
        <v-table class="month-table">
            <thead>
                <tr>
                    <th class="text-subtitle-1 font-weight-semibold">Customer</th>
                    <th class="text-subtitle-1 font-weight-semibold">Status</th>
                    <th class="text-subtitle-1 font-weight-semibold">Email Address</th>
                    <th class="text-subtitle-1 font-weight-semibold">Teams</th>
                    <th class="text-subtitle-1 font-weight-semibold"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in basicTableData3" :key="item.name" class="month-item">
                    <td>
                        <div class="d-flex align-center">
                            <v-avatar size="40">
                                <img :src="item.avatar" alt="avatar" height="40" />
                            </v-avatar>
                            <div class="ml-4">
                                <h6 class="text-subtitle-1 font-weight-semibold text-no-wrap">{{ item.name }}</h6>
                                <div class="text-subtitle-1 text-grey100 text-no-wrap mt-1">{{ item.handle }}</div>
                            </div>
                        </div>
                    </td>
                    <td>

                        <v-chip rounded="pill"  v-if="item.statusoffline" class="font-weight-bold pl-1 pr-2" :color="item.statuscolor" size="small">
                            <ClockHour4Icon size="15" class="mr-1" />
                            {{ item.status }}
                        </v-chip>

                        <v-chip rounded="pill" v-else class="font-weight-bold pl-1 pr-2" :color="item.statuscolor" size="small">
                            <CircleIcon size="15" class="mr-1" />
                            {{ item.status }}
                        </v-chip>
                        
                    </td>
                    <td>
                        <div class="text-subtitle-1 text-grey100">{{ item.email }}</div>
                    </td>
                    <td>
                        <div class="d-flex align-center">
                            <div class="d-flex">
                                <v-chip
                                    v-for="team in item.teams"
                                    :key="team.status"
                                    rounded="pill"
                                    :class="'font-weight-bold px-2 mr-2 bg-' + team.statuscolor"
                                    size="small"
                                >
                                    {{ team.status }}
                                </v-chip>
                            </div>
                        </div>
                    </td>

                    <td>
                        <v-btn size="30" icon variant="flat" class="grey100">
                            <v-avatar size="22">
                                <DotsIcon size="20" color="grey100" />
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
