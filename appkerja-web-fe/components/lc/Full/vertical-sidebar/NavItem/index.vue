<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps({ item: Object, level: Number });
</script>

<template>
    <!---Single Item-->
    <div class="mb-0">
        <v-list-item
            density="compact"
            :to="item.type === 'external' ? '' : item.to"
            :href="item.type === 'external' ? item.to : ''"
            rounded
            :class="'  bg-hover-' + item.BgColor"
            :color="item.BgColor"
            :ripple="false"
            :disabled="item.disabled"
            :target="item.type === 'external' ? '_blank' : ''"
            v-scroll-to="{ el: '#top' }"
        >
            <!---If icon-->
            <template v-slot:prepend>
                <div :class="'navbox  bg-hover-' + item.BgColor" :color="item.BgColor" >
                    <span class="icon-box">
                        <Icon :icon="'solar:' + item.icon" height="20" width="20" :level="level"  :class="'position-relative z-index-2 texthover-' + item.BgColor" />
                    </span>
                </div>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium" :color="item.BgColor">{{ $t(item.title) }}</v-list-item-title>
            <!---If Caption-->
            <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
                {{ item.subCaption }}
            </v-list-item-subtitle>
            <!---If any chip or label-->
            <template v-slot:append v-if="item.chip">
                <v-chip :color="item.chipColor" class="sidebarchip hide-menu"
                    :size="item.chipIcon ? 'x-small' : 'x-small'" :variant="item.chipVariant" :prepend-icon="item.chipIcon">
                    {{ item.chip }}
                </v-chip>
            </template>
        </v-list-item>
    </div>
</template>
