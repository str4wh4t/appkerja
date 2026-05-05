<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import ProductBaseCard from '@/components/shared/ProductBaseCard.vue';
//Types
import type { Products } from '@/types/apps/EcommerceType';
import ProductItemVue from '@/components/apps/ecommerce/listing/ProductItemOne.vue';
import { useEcomStore } from '@/stores/apps/eCommerce';
import { orderBy, filter, includes } from 'lodash';

import ProductEmplty from '@/components/apps/ecommerce/listing/ProductEmplty.vue';
import ProductTopFilter from '@/components/apps/ecommerce/listing/ProductfilterOne.vue';
import ProductMobileFilter from '@/components/apps/ecommerce/listing/ProductFilters.vue';



const select = ref('March 2023');
const items = ref(['Most recent', 'April 2023', 'May 2023', 'June 2023']);
const page = ref(1);


// ecommmerce
const store = useEcomStore();

onMounted(() => {
    store.fetchProducts();
});

const getProducts = computed(() => {
    return store.products;
});

const selected = ref('Price:Low to High');
const searchValue = ref('');

const getVisibleProduct = (
    products: Products | any,
    sortBy: string,
    search: string | any,
    gender: string | unknown,
    category: string | unknown,
    colors: string | unknown,
    price: string | unknown,
    //price:string | unknown
) => {
    // SORT BY
    if (sortBy === 'Popularity') {
        products = orderBy(products, ['rating'], ['desc']);
    }
    if (sortBy === 'Price:High to Low') {
        products = orderBy(products, ['salePrice'], ['desc']);
    }
    if (sortBy === 'Price:Low to High') {
        products = orderBy(products, ['salePrice'], ['asc']);
    }
    if (sortBy === 'Fresh Arrivals') {
        products = orderBy(products, ['created'], ['asc']);
    }
    if (gender) {
        products = products.filter((product: Products | any) => {
            return product.gender.includes(gender);
        });
    }
    if (price) {
        products = products.filter((product: Products | any) => {
            return product.price.includes(price);
        });
    }
    if (category !== 'all') {
        products = products.filter((product: Products | any) => {
            return product.categories.includes(category);
        });
    }

    if (search) {
        products = products.filter((product: Products) => {
            return product.name.toLowerCase().includes(search.value.toLowerCase());
        });
    }

    //FILTER PRODUCTS BY COLORS
    if (colors !== 'All') {
        products = products.filter((_product: Products | any) => _product.colors.includes(colors));
    }

    //FILTER PRODUCTS BY PRICE
    // if (price !== 'All') {
    //   const minMax = price ? price.split('-') : '';
    //   products = products.filter((_product: Products | any) =>
    //     price ? _product.price >= minMax[0] && _product.price <= minMax[1] : true,
    //   );
    // }

    return products;
};

const filteredProducts = computed(() => {
    return getVisibleProduct(getProducts.value, selected.value, searchValue, store.gender, store.category, store.color,store.price);
});
const toggleSide = ref(false);

function AddCart(p: number) {
    store.AddToCart(p);
}
</script>

<template>
    <ProductTopFilter />
    <v-card elevation="10" class="inside-left-sidebar overflow-hidden">
        <ProductBaseCard>
            <template v-slot:rightpart>

                    <v-sheet class="pa-8">
                        <div class="d-sm-flex gap-2 align-center mb-5">
                            <h5 class="text-h5 d-sm-flex font-weight-semibold">Products</h5>
                            <v-sheet class="ml-sm-auto mt-sm-0 mt-3 searchbox">
                                <v-text-field variant="outlined" v-model="searchValue" prepend-inner-icon="mdi-magnify"
                                    placeholder="Search Product" hide-details density="compact"
                                    color="primary"></v-text-field>
                            </v-sheet>
                            <div class="my-sm-0 my-3">
                                <v-select v-model="select" :items="items" density="compact"
                                    class="bg-lightsecondary rounded-md font-weight-semibold text-h6 text-grey100"
                                    hide-details></v-select>
                            </div>
                        </div>
                        <v-row v-if="filteredProducts.length >= 1">
                            <v-col cols="12" md="3" sm="6" v-for="product in filteredProducts" :key="product.id">
                                <ProductItemVue :name="product.name" :image="product.image" :desc="product.description"
                                    :salePrice="product.salePrice" :rank="product.rank" :offerPrice="product.offerPrice"
                                    :rating="product.rating" :goto="product.id" @handlecart="AddCart(product)" />
                            </v-col>
                            <v-col cols="12" class="text-sm-right text-center">
                                <v-divider></v-divider>
                                <div class="d-flex justify-end mt-4">
                                    <v-pagination v-model="page" density="compact" :length="8" rounded="circle"
                                        class="text-subtitle-1 text-grey100"></v-pagination>
                                </div>
                            </v-col>
                        </v-row>
                        <ProductEmplty v-else />
                    </v-sheet>
                    
            </template>
            <!-- -------------------------------------- -->
            <!-- Mobile Sidebar -->
            <!-- -------------------------------------- -->
            <template v-slot:mobileLeftContent>
                <ProductMobileFilter />
            </template>
        </ProductBaseCard>
    </v-card>
</template>

<style scoped lang="scss">
.searchbox{
    min-width: 250px;
    @media screen and (max-width:600px) {
        min-width:auto;
        width: 100%;
    }
}
@media (max-width: 1279px) {
    .v-card {
        position: unset;
    }
}
</style>
