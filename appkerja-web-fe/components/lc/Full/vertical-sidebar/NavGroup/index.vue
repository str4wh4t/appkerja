<script setup>
const props = defineProps({ item: Object });
</script>

<template>
    <v-list-subheader class="smallCap text-capitalize text-body-2 mt-4 d-flex align-items-center">
        <span class="mini-icon"><DotsIcon size="16" stroke-width="1.5" class="iconClass" /></span>
       <span class="mini-text font-weight-semibold pl-2 text-medium-emphasis text-uppercase text-body-2">{{ $t(props.item.header) }}</span> 
    </v-list-subheader>
</template>
