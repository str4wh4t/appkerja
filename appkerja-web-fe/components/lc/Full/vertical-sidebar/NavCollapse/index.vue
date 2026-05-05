<script setup>
import { Icon } from '@iconify/vue';
const props = defineProps({ item: Object, level: Number });
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!---Item Childern -->
    <!-- ---------------------------------------------- -->
    <div class="mb-0">
        <v-list-group no-action>
            <!-- ---------------------------------------------- -->
            <!---Dropdown  -->
            <!-- ---------------------------------------------- -->
            <template v-slot:activator="{ props }">
                <v-list-item
                    v-bind="props"
                    :value="item.title"
                    density="compact"
                    :ripple="false"
                    :class="' bg-hover-' + item.BgColor"
                    :color="item.BgColor"
                >
                    <!---Icon  -->
                    <template v-slot:prepend>
                        <div :class="'navbox  bg-hover-' + item.BgColor" :color="item.BgColor" >
                            <span class="icon-box" v-if="level > 0">
                                <div class="sublink-dot" width="30"></div>
                            </span>
                            <span class="icon-box" v-else>
                                <Icon :icon="'solar:' + item.icon" height="20" width="20" :level="level" :class="'position-relative z-index-2 texthover-' + item.BgColor" />
                            </span>
                        </div>
                    </template>
                    <!---Title  -->
                    <v-list-item-title class="text-subtitle-1  font-weight-medium">{{ $t(item.title) }}</v-list-item-title>
                    <!---If Caption-->
                    <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
                        {{ item.subCaption }}
                    </v-list-item-subtitle>
                </v-list-item>
            </template>
            <!-- ---------------------------------------------- -->
            <!---Sub Item-->
            <!-- ---------------------------------------------- -->
            <div class="mb-2 sublinks">
                <template v-for="(subitem, i) in item.children" :key="i" v-if="item.children">
                    <LcFullVerticalSidebarNavCollapse :item="subitem" v-if="subitem.children" :level="level + 1" />
                    <LcFullVerticalSidebarDropDown :item="subitem" :level="level + 1" v-else></LcFullVerticalSidebarDropDown>
                </template>
            </div>
        </v-list-group>
    </div>
    <!-- ---------------------------------------------- -->
    <!---End Item Sub Header -->
    <!-- ---------------------------------------------- -->
</template>
