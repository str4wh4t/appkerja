<script setup>
import { ref, onMounted, computed } from 'vue';
import { useEcomStore } from '@/stores/apps/eCommerce';
import { RouterLink, useRoute } from 'vue-router';
import ProductCarousel from './ProductCarousel.vue';
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
</script>
<template>
    <div v-if="getProduct" class="product-detail-two">
        <v-row>
            <v-col lg="6" sm="12" >
                <ProductCarousel />
            </v-col>
            <v-col lg="6" sm="12" class="pl-lg-5">
                <div>
                    <div class="d-flex align-center gap-2">
                        <v-chip color="success" variant="elevated" size="x-small" elevation="0" v-if="getProduct.isStock"> In Stock </v-chip>
                        <v-chip color="error" v-else> Out of Stock </v-chip>
                        <span class="text-subtitle-2">{{ getProduct.gender }}</span>
                    </div>

                    <h3 class="text-h4 my-2">
                        {{ getProduct.name }}
                    </h3>
                </div>
                <p class="px-0 h5 font-weight-medium my-4 text-grey100">{{ getProduct.description }}</p>

                <div class="d-flex align-center gap-2">
                    <p class="text-decoration-line-through text-h4 text-grey100">${{ getProduct.offerPrice }}</p>
                    <h4 class="text-h4">${{ getProduct.salePrice }}</h4>
                </div>

                <div class="text-medium-emphasis align-center d-flex mt-3 gap-2">
                    <ClientOnly><v-rating color="warning" half-increments v-model="getProduct.rating" size="small" density="compact"> </v-rating></ClientOnly>
                    <span class="text-subtitle-1 text-primary font-weight-medium">({{ getProduct.rank }} reviews)</span>
                </div>

                <v-divider class="my-5"></v-divider>

                <v-row>
                    <v-col cols="6" sm="2" class="d-flex align-center">
                        <h6 class="text-h6">Colors<span class="text-error">*</span></h6>
                    </v-col>
                    <v-col cols="6" sm="10">
                        <template v-for="(color, i) in getProduct.colors" :key="i">
                            <v-avatar @click="selectColor(i)" variant="flat" :color="color" size="x-small" class="mr-1 cursor-pointer">
                                <template v-if="setColor == i">
                                    <CheckIcon size="13" />
                                </template>
                            </v-avatar>
                        </template>
                    </v-col>
                    <v-col cols="6" sm="2" class="d-flex align-center">
                        <h6 class="text-h6">Quantity</h6>
                    </v-col>
                    <v-col cols="6" sm="10">
                        <v-btn-toggle divided variant="outlined" rounded="md">
                        <v-btn size="small" density="compact" class="border-right" color="secondary"
                            @click="store.decrementQty(getProduct.id)">
                            <MinusIcon size="16" class="text-grey100" />
                        </v-btn>
                        <v-btn size="small" density="compact" color="secondary"
                            class="text-h6 text-grey100 font-weight-semibold border-right">
                            {{ getProduct.qty }}
                        </v-btn>
                        <v-btn size="small" density="compact" color="secondary" @click="store.incrementQty(getProduct.id)">
                            <PlusIcon size="16" class="text-grey100" />
                        </v-btn>
                    </v-btn-toggle>
                    </v-col>
                </v-row>
                <v-divider class="my-5"></v-divider>
                <v-row class="mt-6">
                    <v-col cols="12" md="auto" sm="3">
                        <v-btn block size="large" rounded="pill" class="px-sm-12" color="primary" to="/apps/ecommerce/checkout" @click="store.AddToCart(getProduct)"
                            >Buy Now</v-btn
                        >
                    </v-col>
                    <v-col cols="12" md="auto" sm="3">
                        <v-btn block size="large" class="px-sm-8" rounded="pill" color="error" @click="store.AddToCart(getProduct)">Add To Cart</v-btn>
                    </v-col>
                </v-row>
                <div class="mt-8">
                    <h6 class="text-subtitle-1 font-weight-medium text-grey100">Dispatched in 2-3 weeks</h6>
                    <RouterLink to="/" class="text-subtitle-1 text-decoration-none font-weight-medium text-primary">Why the longer time for delivery?</RouterLink>
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
.product-detail-two {
    .v-btn-group--density-default.v-btn-group {
        height: 40px;

        .v-btn--size-small {
            min-width: 40px;
        }
    }
    
}
</style>
