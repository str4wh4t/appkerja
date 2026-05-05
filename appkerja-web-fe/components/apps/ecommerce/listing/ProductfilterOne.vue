<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useEcomStore } from '@/stores/apps/eCommerce';

const panel = ref([0, 1, 2, 3, 4]);
const priceSort = [
    {
        label: '$10 - $50',
        price: '50'
    },
    {
        label: '$50 - $100',
        price: '100'
    },
    {
        label: '$100 - $150',
        price: '151'
    },
    {
        label: '$150 - $200',
        price: '200'
    },
    {
        label: 'Over $200',
        price: '250'
    }
];

const store = useEcomStore();

//Reset Filter
store.filterReset();

const selectedGender = ref('');
store.SelectGender(selectedGender);

const selectedCategory = ref('all');
store.SelectCategory(selectedCategory);

const selectPrice = ref('');
store.SelectPrice(selectPrice);

const selectRating = ref(1);
const setColor = ref(1);
function selectColor(e: any) {
    setColor.value = e;
}

onMounted(() => {
    store.fetchProducts();
});

const getProducts = computed(() => {
    return store.products;
});
const getUniqueData = (data: any, attr: any) => {
    let newVal = data.map((curElem: any) => {
        return curElem[attr];
    });
    if (attr === 'colors') {
        newVal = newVal.flat();
    }

    return (newVal = [...Array.from(new Set(newVal))]);
};

const filterbyColors: any = computed(() => {
    return getUniqueData(getProducts.value, 'colors');
});

//Reset Filter Function
function filterReset() {
    store.SelectGender('');
    store.SelectCategory('all');
    store.SelectPrice('');
    store.sortByColor('All');
}

</script>
<template>
    
    <VCard elevation="10" class="mb-4 topfilter d-lg-block d-none">
        <v-card-text class="py-4 px-6">
            <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                <p class="text-grey100 text-subtitle-1 font-weight-medium pr-4">Filter by:</p>
                <v-menu :close-on-content-click="false" class="Category_popup" transition="scale-transition">
                    <template v-slot:activator="{ props }">
                        <div icon class="cursor-pointer" flat v-bind="props" size="small">
                            <div class="font-weight-semibold text-15 text-grey200 d-flex">Category <span
                                    class="mdi mdi-menu-down" style="font-size:20px"></span></div>
                        </div>
                    </template>
                    <v-sheet rounded="md" width="150" elevation="10" class="mt-5 dropdown-box">
                        <perfect-scrollbar style="height:260px">
                            <v-list class="py-0 theme-list" lines="two">
                                <v-list-item color="primary" class="pa-3">
                                    <v-row no-gutters>
                                        <v-col cols="12">
                                            <v-checkbox label="All" density="compact" v-model="selectedCategory"
                                                color="primary" value="all" hide-details>
                                            </v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox label="Kitchen" density="compact" v-model="selectedCategory"
                                                color="primary" value="kitchen" hide-details></v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox label="Electronics" density="compact" v-model="selectedCategory"
                                                color="primary" value="electronics" hide-details></v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox label="Books" density="compact" v-model="selectedCategory"
                                                color="primary" value="books" hide-details></v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox label="Fashion" density="compact" v-model="selectedCategory"
                                                color="primary" value="fashion" hide-details></v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox label="Toys" density="compact" v-model="selectedCategory"
                                                color="primary" value="toys" hide-details></v-checkbox>
                                        </v-col>
                                    </v-row>
                                </v-list-item>
                            </v-list>
                        </perfect-scrollbar>
                    </v-sheet>
                </v-menu>
                <v-divider vertical class="mx-5"></v-divider>
                <v-menu :close-on-content-click="false" class="Pricing_popup" transition="scale-transition">
                    <template v-slot:activator="{ props }">
                        <div icon class="cursor-pointer" flat v-bind="props" size="small">
                            <div class="font-weight-semibold text-15 text-grey200 d-flex">Pricing <span
                                    class="mdi mdi-menu-down" style="font-size:20px"></span></div>
                        </div>
                    </template>
                    <v-sheet rounded="md" width="180" elevation="10" class="mt-5 dropdown-box">
                        <perfect-scrollbar style="max-height:250px">
                            <v-list class="py-0 theme-list" lines="two">
                                <v-list-item color="primary" class="pa-3">
                                    <v-radio-group v-model="selectPrice" class="custom-radio-box">
                                        <v-radio v-for="pricing in priceSort" :key="pricing.label" :label="pricing.label"
                                            v-model="selectPrice" color="primary" :value="pricing.price" hide-details>
                                        </v-radio>
                                    </v-radio-group>
                                </v-list-item>
                            </v-list>
                        </perfect-scrollbar>
                    </v-sheet>
                </v-menu>
                <v-divider vertical class="mx-5"></v-divider>

                <v-menu :close-on-content-click="false" class="Gender_popup" transition="scale-transition">
                    <template v-slot:activator="{ props }">
                        <div icon class="cursor-pointer" flat v-bind="props" size="small">
                            <div class="font-weight-semibold text-15 text-grey200 d-flex">Gender <span
                                    class="mdi mdi-menu-down" style="font-size:20px"></span></div>
                        </div>
                    </template>
                    <v-sheet rounded="md" width="150" elevation="10" class="mt-5 dropdown-box">
                        <perfect-scrollbar style="max-height: 200px">
                            <v-list class="py-0 theme-list" lines="two">
                                <v-list-item color="primary" class="pa-3">
                                    <v-row no-gutters>
                                        <v-col cols="12">
                                            <v-checkbox label="Male" density="compact" v-model="selectedGender"
                                                color="primary" value="male" hide-details>
                                            </v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox label="Female" density="compact" v-model="selectedGender"
                                                color="secondary" value="female" hide-details></v-checkbox>
                                        </v-col>
                                        <v-col cols="12">
                                            <v-checkbox label="Kids" density="compact" v-model="selectedGender"
                                                color="error" value="kids" hide-details></v-checkbox>
                                        </v-col>
                                    </v-row>
                                </v-list-item>
                            </v-list>
                        </perfect-scrollbar>
                    </v-sheet>
                </v-menu>
                <v-divider vertical class="mx-5"></v-divider>

                <v-menu :close-on-content-click="false" class="Color_popup" transition="scale-transition">
                    <template v-slot:activator="{ props }">
                        <div icon class="cursor-pointer" flat v-bind="props" size="small">
                            <div class="font-weight-semibold text-15 text-grey200 d-flex">Color <span
                                    class="mdi mdi-menu-down" style="font-size:20px"></span></div>
                        </div>
                    </template>
                    <v-sheet rounded="md" width="200" elevation="10" class="mt-5 dropdown-box">
                        <perfect-scrollbar style="max-height: 200px">
                            <v-list class="py-0 theme-list" lines="two">
                                <v-list-item color="primary" class="pa-3">
                                    <div class="d-flex gap-2 flex-wrap v-col-11 px-0">
                                        <template v-for="(catcolor, i) in filterbyColors" :key="i"
                                            v-if="filterbyColors.length > 0">
                                            <v-avatar class="cursor-pointer" :color="catcolor" variant="flat" size="30"
                                                @click="store.sortByColor(catcolor)">
                                                <template v-if="store.color === catcolor">
                                                    <CheckIcon size="13" />
                                                </template>
                                            </v-avatar>
                                        </template>
                                    </div>
                                </v-list-item>
                            </v-list>
                        </perfect-scrollbar>
                    </v-sheet>
                </v-menu>
                </div>
                <div>
                    <v-btn color="primary" @click="filterReset()" size="large" rounded="pill">Reset Filters</v-btn>
                </div>
            </div>
        </v-card-text>
    </VCard>
</template>

