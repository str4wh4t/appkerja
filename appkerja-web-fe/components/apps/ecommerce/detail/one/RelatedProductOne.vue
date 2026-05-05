<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import ProductItemVue from '@/components/apps/ecommerce/listing/ProductItemOne.vue';
import { useEcomStore } from '@/stores/apps/eCommerce';
import { Carousel, Slide, Navigation } from "vue3-carousel";
import { RelatedSlider, RelatedSliderBreakpoints } from '@/_mockApis/apps/Slider';
import {ChevronLeftIcon, ChevronRightIcon } from "vue-tabler-icons";

const store = useEcomStore();

onMounted(() => {
    store.fetchProducts();
});

const getProducts = computed(() => {
    return store.products;
});
// const settings = ref({
//     itemsToShow: 1,
//     snapAlign: 'center'
// });
// const breakpoints = ref({
//     700: {
//         itemsToShow: 3,
//         snapAlign: 'center'
//     },
//     // 1024 and up
//     1024: {
//         itemsToShow: 4,
//         snapAlign: 'center'
//     },
//     2000: {
//         itemsToShow: 5,
//         snapAlign: 'start'
//     }
// });
function AddCart(p: any) {
    store.AddToCart(p);
}
</script>

<template>
    <h4 class="text-h4 my-7 font-weight-semibold">You might also like</h4>

    <carousel :settings="RelatedSlider" :breakpoints="RelatedSliderBreakpoints" class="related-Product">
        <slide v-for="product in getProducts" :key="product.id">
            <ProductItemVue :name="product.name" :image="product.image" :desc="product.description"
                :salePrice="product.salePrice" :offerPrice="product.offerPrice" :rating="product.rating" :rank="product.rank"  :goto="1"
                @handlecart="AddCart(product)" />
        </slide>
        <template #addons>
            <navigation class="navarrow mt-n9">
                <template #next>
                    <span>
                        <v-avatar size="36" class="bg-lightsecondary">
                        <ChevronRightIcon class="text-grey200" size="20" stroke-width="1.5" />
                    </v-avatar>
                    </span>
                </template>
                <template #prev>
                    <span>
                        <v-avatar size="36" class="bg-lightsecondary">
                        <ChevronLeftIcon class="text-grey200" size="20" stroke-width="1.5" />
                        </v-avatar>
                    </span>
                </template>
            </navigation>
        </template>
    </carousel>
</template>
<style lang="scss">
.related-Product {
    &.carousel{
        margin: 0 -12px;
    }
    .carousel__slide{
        padding: 0 12px;
    }
    .carousel__prev.navarrow{
        top: 0;
        right: 52px !important;
        left: unset;
    }
    .carousel__next.navarrow{
        top: 0;
        right: 5px !important;
    }
}
</style>
