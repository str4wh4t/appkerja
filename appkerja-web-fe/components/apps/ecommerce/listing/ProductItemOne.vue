<script setup lang="ts">
import { ref } from 'vue';
import type { HeartIcon } from 'vue-tabler-icons';
const props = defineProps({
    name: String,
    image: String,
    desc: String,
    rating: Number,
    salePrice: Number,
    rank: Number,
    offerPrice: Number,
    goto: Number || String || Object || Array
});
const successsnackbar = ref(false);
const rate = ref(props.rating);
</script>

<template>
    <v-card variant="flat" class="rounded-md card-hover overflow-hidden bg-surface">
        <router-link :to="`/apps/ecommerce/product/one/detail/${goto}`">
            <img alt="product" :src="image" class="w-100 rounded-md" />
        </router-link>
        <div class="d-flex justify-end mr-3 mt-n6 position-absolute action-btn">
            <v-btn
                        icon
                        v-bind="props"
                        color="white"
                        size="small"
                        class="mr-3"
                        ><HeartIcon size="19" stroke-width="1.5" 
                    /></v-btn>
            <v-tooltip text="Add to Cart" location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn
                        icon
                        v-bind="props"
                        color="white"
                        size="small"
                        @click="$emit('handlecart', (successsnackbar = true))"
                        ><BasketIcon size="19" stroke-width="1.5" 
                    /></v-btn>
                </template>
            </v-tooltip>
        </div>
        <v-card-item class="pt-3 text-left">
            <h6 class="text-h6 font-weight-semibold">{{ name }}</h6>
            <div class="d-flex align-center justify-start mt-2">
                <v-icon icon="mdi-star" color="warning" size="18" class="mr-1"></v-icon><span class="font-weight-semibold text-grey200 text-subtitle-1">{{rating?.toFixed(1)}}</span>
                <span class="font-weight-medium text-grey100 text-subtitle-1 ml-1">({{ rank }})</span>
            </div>
            <div class="d-flex align-center justify-start gap-2 mt-2">
                    <h6 class="text-h6 font-weight-semibold">${{ salePrice }}</h6>
                    <p class="text-h6 text-decoration-line-through font-weight-semibold text-grey100">${{ offerPrice }}</p>
                </div>
        </v-card-item>
        <v-snackbar variant="flat" location="bottom right" color="success" rounded="md" class="text-white" v-model="successsnackbar">
            Item Added to The Cart
        </v-snackbar>
    </v-card>
</template>
<style lang="scss" scoped >
.descriptionH {
    height: 40px;
    overflow: hidden;
}
.action-btn{
    top: 40px;
    right: -100%!important;
    transition: all .3s ease-in-out;
    visibility: hidden;
    .v-btn{
        height: 36px;
        width: 36px;
    }   
}

.card-hover{
    &:hover{
        .action-btn{
            right: 0!important;
            visibility: visible;
        }
    }
}
</style>
