<script setup lang="ts">
import { ref } from 'vue';
import { demosMegamenu, appsMegamenu, productsSlider, FrontPageMenu } from '@/_mockApis/landingpage/lpPage';
</script>
<template>
    <div class="py-md-16 bg-containerBg">
        <v-container class="maxWidth py-md-16" id="demos">
            <v-row class="justify-center">
                <v-col cols="12" lg="8" sm="10" data-aos="fade-up" data-aos-duration="500">
                    <div class="d-sm-flex align-center text-center justify-center">
                        <div class="d-flex flex-row-reverse justify-sm-start justify-center ml-sm-0 ml-3">
                            <v-avatar class="ml-n2 avtar-border" size="28">
                                <img src="/images/profile/user-3.jpg" height="28" alt="usericon" />
                            </v-avatar>
                            <v-avatar class="ml-n2 avtar-border" size="28">
                                <img src="/images/profile/user-2.jpg" height="28" alt="usericon" />
                            </v-avatar>
                            <v-avatar class="ml-n2 avtar-border" size="28">
                                <img src="/images/profile/user-1.jpg" height="28" alt="usericon" />
                            </v-avatar>
                        </div>
                        <h6 class="text-h5 ml-2 mt-2 mt-sm-0 text-grey100">52,589+</h6>
                        <h6 class="text-h5 ml-2 text-grey100">developers & agencies using our templates</h6>
                    </div>
                    <h2 class="text-center mt-6 sectionTitle font-weight-bold text-grey200">
                        Production Ready & Developer Friendly Vuetify Vue Admin Template
                    </h2>
                </v-col>
            </v-row>
            <div class="mt-sm-16 mt-10">
                <div class="product-slider position-relative lp_wrapper">
                    <div class="d-flex justify-center"><v-chip class="bg-primary text-white">Demos</v-chip></div>
                    <v-row class="mt-3 row-up">
                        <template v-for="demo in productsSlider" :key="demo.img">
                            <v-col cols="12" md="4" sm="6" v-if="demo.type">
                                <v-card class="border" elevation="0" variant="outlined" rounded="lg">
                                    <v-sheet class="text-center pa-5 pb-0 bg-light rounded-t-md">
                                        <div class="overflow-hidden position-relative rounded-t-md">
                                            <v-hover v-slot="{ isHovering, props }">
                                                <v-card class="mx-auto" v-bind="props" rounded="0">
                                                    <img :src="demo.img" :alt="demo.img" class="w-100" />
                                                    <v-overlay
                                                        :model-value="!!isHovering"
                                                        class="align-center justify-center"
                                                        scrim="rgba(0, 133, 219, 0.3)"
                                                        contained
                                                    >
                                                        <v-btn color="primary" rounded="pill" flat target="_blank" :href="demo.link"
                                                            >Live Preview</v-btn
                                                        >
                                                    </v-overlay>
                                                </v-card>
                                            </v-hover>
                                        </div>
                                    </v-sheet>
                                    <div class="pa-4">
                                        <h6 class="text-h6 font-weight-semibold">{{ demo.name }}</h6>
                                        <p class="text-subtitle-1 text-grey100 mt-1">Demo</p>
                                    </div>
                                </v-card>
                            </v-col>
                        </template>
                    </v-row>
                    <div class="d-flex justify-center mt-sm-12 mt-6"><v-chip class="bg-primary text-white">Apps</v-chip></div>
                    <v-row class="mt-3 row-up">
                        <template v-for="demo in productsSlider" :key="demo.img">
                            <v-col cols="12" md="4" sm="6" v-if="!demo.type">
                                <v-card class="border" elevation="0" variant="outlined" rounded="lg">
                                    <v-sheet class="text-center pa-5 pb-0 bg-light rounded-t-md">
                                        <div class="overflow-hidden position-relative rounded-t-md">
                                            <v-hover v-slot="{ isHovering, props }">
                                                <v-card class="mx-auto" v-bind="props" rounded="0">
                                                    <img :src="demo.img" :alt="demo.img" class="w-100" />
                                                    <v-overlay
                                                        :model-value="!!isHovering"
                                                        class="align-center justify-center"
                                                        scrim="rgba(0, 133, 219, 0.3)"
                                                        contained
                                                    >
                                                        <v-btn color="primary" rounded="pill" flat target="_blank" :href="demo.link"
                                                            >Live Preview</v-btn
                                                        >
                                                    </v-overlay>
                                                </v-card>
                                            </v-hover>
                                        </div>
                                    </v-sheet>
                                    <div class="pa-4">
                                        <h6 class="text-h6 font-weight-semibold">{{ demo.name }}</h6>
                                        <p class="text-subtitle-1 text-grey100 mt-1">Application</p>
                                    </div>
                                </v-card>
                            </v-col>
                        </template>
                    </v-row>

                    <div class="d-flex justify-center mt-sm-12 mt-6"><v-chip class="bg-primary text-white">Frontend Pages</v-chip></div>
                    <v-row class="mt-3 row-up">
                        <template v-for="demo in FrontPageMenu" :key="demo.img">
                            <v-col cols="12" md="4" sm="6">
                                <v-card
                                   class="border" elevation="0" variant="outlined" rounded="lg"
                                    data-aos="fade-up"
                                    data-aos-delay="600"
                                    data-aos-duration="1000"
                                >
                                    <v-sheet class="text-center pa-5 pb-0 bg-light rounded-t-md">
                                        <div class="overflow-hidden position-relative rounded-t-md">
                                            <v-hover v-slot="{ isHovering, props }">
                                                <v-card class="mx-auto" v-bind="props" rounded="0">
                                                    <img :src="demo.img" :alt="demo.img" class="w-100" />
                                                    <v-overlay
                                                        :model-value="!!isHovering"
                                                        class="align-center justify-center"
                                                        scrim="rgba(0, 133, 219, 0.3)"
                                                        contained
                                                    >
                                                        <v-btn color="primary" rounded="pill" flat target="_blank" :href="demo.link">Live Preview</v-btn>
                                                    </v-overlay>
                                                </v-card>
                                            </v-hover>
                                        </div>
                                    </v-sheet>
                                    <div class="pa-4">
                                        <h6 class="text-h6 font-weight-semibold">{{ demo.name }}</h6>
                                        <p class="text-subtitle-1 textSecondary mt-1">Frontend Pages</p>
                                    </div>
                                </v-card>
                            </v-col>
                        </template>
                    </v-row>
                </div>
            </div>
        </v-container>
    </div>
</template>
