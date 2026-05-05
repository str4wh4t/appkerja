<script setup lang="ts">
import { ref } from 'vue';
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import { userReview } from '@/_mockApis/landingpage/lpPage';
import { testimonialSettings } from '@/_mockApis/landingpage/curoselData';
import { ArrowRightIcon, ArrowLeftIcon } from 'vue-tabler-icons';
const rating = ref(5)
</script>
<template>
    <div class="py-sm-15 py-7 bg-containerBg">
        <VContainer class="maxWidth">
            <div class="testimonials" data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000">
                <Carousel :settings="testimonialSettings" class="overflow-hidden">
                    <Slide v-for="card in userReview" :key="card.img">
                        <VCard elevation="0" class="text-center">

                            <div class="review-box py-4">
                                <div>
                                    <ClientOnly><VRating v-model="rating" hover size="x-large" density="compact" color="warning"></VRating></ClientOnly>
                                </div>
                                <p class="text-h1 font-weight-medium mt-6 col-sm-8">{{ card.review }}</p>
                                <div class="d-flex justify-center align-center mt-8 gap-3">
                                    <VAvatar size="64">
                                        <img :src="card.img" :alt="card.img" width="64" />
                                    </VAvatar>
                                    <div class="text-left mt-n1">
                                        <h6 class="text-h5 mb-1">{{ card.title }}</h6>
                                        <h6 class="text-h6 font-weight-medium text-grey100">{{ card.subtitle }}</h6>
                                        <ClientOnly><VRating v-model="rating" hover size="small" density="compact" color="warning"
                                            class="d-sm-none"></VRating></ClientOnly>
                                    </div>

                                </div>

                            </div>
                        </VCard>
                    </Slide>

                    <template #addons>
                        <Pagination class="mt-sm-8 mt-6" />
                        <Navigation class="navarrow mt-md-n3 d-md-block d-none">
                            <template #next>
                                <span class="mt-sm-0 mt-16">
                                    <ArrowRightIcon class="mt-md-0 mt-7 pa-sm-0 pa-0 arrow-light" size="25" stroke-width="1.5" />
                                </span>
                            </template>
                            <template #prev>
                                <span class="mt-sm-0 mt-16">
                                    <ArrowLeftIcon class=" mt-md-0 mt-7 pa-sm-0 pa-0 arrow-light" size="25" stroke-width="1.5" />
                                </span>
                            </template>
                        </Navigation>
                    </template>
                </Carousel>
            </div>
        </VContainer>
    </div>
</template>
