<script setup>
import { ref, onMounted, computed } from 'vue';
import { useEcomStore } from '@/stores/apps/eCommerce';
import { useRoute } from 'vue-router';
import ProductCarouselOne from './ProducOneCurosel.vue';
import ProductReview from './ProductReviewOne.vue';
import ProductDetail from '../ProductDescription.vue';

const store = useEcomStore();
const route = useRoute();
const size = ref(['10', '09', '08', '07']);
const selectedSize = ref(['10']);
const setColor = ref(1);
onMounted(() => {
    store.fetchProducts();
});

const getProduct = computed(() => {
    return store.products[route.params.id - 1];
});
function selectColor(e) {
    setColor.value = e;
}

/*Size: varient*/
const sizev = ref('Medium');
const Sizeitems = ref(['Small', 'Medium', 'Large', 'X-Large']);

/*Color: varient*/
const colorv = ref('Red');
const coloritems = ref(['Yellow', 'Brown', 'Green', 'Black']);

const panel = ref([0]);

</script>
<template>
    <div v-if="getProduct" class="product-detail">
        <v-row>
            <v-col md="6" sm="12">
                <ProductCarouselOne />
            </v-col>
            <v-col md="6" sm="12" class="pl-lg-5">
                <div>
                    <h3 class="text-28 text-grey200 font-weight-semibold">
                        {{ getProduct.name }}
                    </h3>
                </div>
                <div class="text-medium-emphasis align-center d-flex mt-1 gap-2">
                    <v-icon icon="mdi-star" color="warning" size="20"></v-icon><span
                        class="font-weight-semibold text-grey200 text-h5 ml-n1">{{ getProduct.rating?.toFixed(1) }}</span>
                    <span class="font-weight-medium text-grey100 text-h5">({{ getProduct.rank }} reviews)</span>
                </div>
                <p class="px-0 h5 font-weight-medium my-4">{{ getProduct.description }}</p>

                <div class="d-flex align-center gap-2">
                    <p class="text-decoration-line-through text-h4">${{ getProduct.offerPrice }}</p>
                    <h4 class="text-h4 text-grey100">${{ getProduct.salePrice }}</h4>
                </div>
                <v-divider class="my-5"></v-divider>

                <div class="d-flex align-center  mb-6">
                    <h4 class="text-h5 me-6">Size:</h4>
                    <v-col sm="auto" class="py-0">
                        <v-select v-model="sizev" :items="Sizeitems" variant="outlined" density="comfortable"
                            class="font-weight-semibold text-h5 text-grey100 " hide-details></v-select>
                    </v-col>

                </div>
                <div class="d-flex align-center mb-6">
                    <h4 class="text-h5 me-3">Color:</h4>
                    <v-col sm="auto" class="py-0">
                        <v-select v-model="colorv" :items="coloritems" variant="outlined" density="comfortable"
                            class="font-weight-semibold text-h5 text-grey100" hide-details></v-select>
                    </v-col>
                </div>
                <div class="d-flex align-center mb-3">
                    <h4 class="text-h5 me-7">Qty:</h4>
                    <v-col sm="auto" class="py-0">
                        <v-btn-toggle divided variant="outlined" rounded="md">
                            <v-btn size="small" density="compact" class="border-right" color="secondary"
                                @click="store.decrementQty(getProduct.id)">
                                <MinusIcon size="16" class="text-grey100" />
                            </v-btn>
                            <v-btn size="small" density="compact" color="secondary"
                                class="text-h6 text-grey100 font-weight-semibold border-right">
                                {{ getProduct.qty }}
                            </v-btn>
                            <v-btn size="small" density="compact" color="secondary"
                                @click="store.incrementQty(getProduct.id)">
                                <PlusIcon size="16" class="text-grey100" />
                            </v-btn>
                        </v-btn-toggle>
                    </v-col>
                </div>
                <v-row class="mt-3">
                    <v-col cols="12" sm="6">
                        <v-btn block variant="outlined" size="x-large" rounded="pill" color="primary">Add to
                            Wishlist</v-btn>
                    </v-col>
                    <v-col cols="12" sm="6" class="mt-sm-0 mt-n3">
                        <v-btn block size="x-large" rounded="pill" color="primary" @click="store.AddToCart(getProduct)">Add
                            To Cart</v-btn>
                    </v-col>
                </v-row>
                <v-divider class="mt-6"></v-divider>
                <div class="product-overview">

                    <v-expansion-panels>
                        <v-expansion-panel elevation="0">
                            <v-expansion-panel-title class="text-h5 px-0 py-6">Description</v-expansion-panel-title>
                            <v-expansion-panel-text class="px-0 text-subtitle-1  text-grey200 font-weight-medium">
                                <ProductDetail />
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                        <v-divider></v-divider>
                        <v-expansion-panel elevation="0">
                            <v-expansion-panel-title class="text-h5 px-0 py-6">
                                <div class="align-center d-flex mt-1 gap-2">
                                    <span class="text-h5">{{ getProduct.rank }}
                                        reviews</span>
                                </div>
                            </v-expansion-panel-title>
                            <v-expansion-panel-text class="px-0 text-subtitle-1  text-grey200 font-weight-medium">
                                <ProductReview />
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                        <v-divider></v-divider>
                    </v-expansion-panels>

                </div>
            </v-col>
        </v-row>
    </div>
</template>
<style lang="scss">
.productCustomize tr td {
    padding: 15px 20px;
    vertical-align: center;
}

.product-detail {
    .v-btn-group--density-default.v-btn-group {
        height: 40px;

        .v-btn--size-small {
            min-width: 40px;
        }
    }
    
}
.product-overview{
    .v-expansion-panel-title__overlay{
        background: transparent;
    }
    .v-expansion-panel-text__wrapper {
    padding: 0px 0px 20px;
    }
    .v-expansion-panel--active:not(:first-child), .v-expansion-panel--active + .v-expansion-panel {
    margin-top: 0;
    }
}

</style>
