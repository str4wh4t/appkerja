<script setup lang="ts">
import { format } from 'date-fns';
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useClassesStore } from '@/stores/school-pages/classes';
const store = useClassesStore();
const route = useRoute();
onMounted(() => {
    store.fetchPosts();
});

// const getProduct = computed(() => {
//     return store.classinfo[route.params.id - 1];
// });

</script>
<template>
    <!-- <div v-if="getProduct">
        <h5 class="text-h5 font-weight-semibold mb-6">Class Detail</h5>
        <v-row>
            <v-col cols="12">
                <v-img :src="getProduct.img" height="400px" alt="post" cover class="align-start text-left rounded-lg">
                    <div class="pl-2 pt-3" v-if="getProduct.chip"><v-chip
                            :class="'text-subtitle-1 font-weight-medium bg-' + getProduct.chipbg" size="small">{{
                                getProduct.chip
                            }}</v-chip></div>
                </v-img>
                <div class="mt-7">
                    <div class="text-subtitle-1 text-grey200 font-weight-medium mb-2">{{ getProduct.caption }}</div>
                    <h5 class="text-h2 mb-6">{{ getProduct.title }}</h5>
                    <p class="text-subtitle-1 text-grey100 mb-2">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type
                        and scrambled it to make a type specimen book. It has survived not only five centuries, but also the
                        leap into electronic typesetting, remaining essentially unchanged.<br>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type
                        and scrambled it to make a type specimen book. It has survived not only five centuries, but also the
                        leap into electronic typesetting, remaining essentially unchanged.

                    </p>
                </div>
            </v-col>
        </v-row>
    </div> -->
    </template>
