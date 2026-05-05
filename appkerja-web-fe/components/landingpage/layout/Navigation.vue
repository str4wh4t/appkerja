<script setup lang="ts">
import { ref } from 'vue';
import QuickLinks from '@/components/landingpage/layout/PageMenuQuicklinks.vue';
import AppsLink from '@/components/landingpage/layout/PageMegamenu.vue';
import { demosMegamenu, appsMegamenu, FrontPageMenu } from '@/_mockApis/landingpage/lpPage';
import { HelpIcon, ChevronDownIcon } from 'vue-tabler-icons';
// Create a hover state object keyed by unique identifiers
const hoverStates = ref<Record<string, boolean>>(
    demosMegamenu.reduce(
        (acc, demo) => {
            acc[demo.img] = false;
            return acc;
        },
        {} as Record<string, boolean>
    )
);

// Update hover state based on the unique key
const setHoverState = (key: string, value: boolean) => {
    hoverStates.value[key] = value;
};
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- mega menu DD -->
    <!-- ---------------------------------------------- -->
    <v-menu open-on-hover open-delay=1  :close-on-content-click="false" class="lp_wrapper position-relative">
        <template v-slot:activator="{ props }">
            <v-btn class="hidden-sm-and-down nav-links custom-hover-primary" :ripple="false"  rounded="pill" variant="text"  v-bind="props"
                >Demos<ChevronDownIcon size="18" class="mt-1 ml-1" />
            </v-btn>
        </template>
        <v-sheet max-width="100%" width="1150" height="100%" elevation="10" rounded="xl" class="pa-8 mx-auto">
            <h5 class="text-h5">Different Demos</h5>
            <h6 class="text-subtitle-1 mt-1">Included with the package</h6>
            <div class="v-row mt-3">
                <v-col v-for="demo in demosMegamenu" :key="demo.img">
                    <v-sheet class="text-center position-relative">
                        <div class="overflow-hidden rounded-md border">
                            <v-card
                                class="mx-auto"
                                rounded="0"
                                @mouseenter="setHoverState(demo.img, true)"
                                @mouseleave="setHoverState(demo.img, false)"
                            >
                                <img :src="demo.img" :alt="demo.img" class="w-100" />
                                <v-overlay
                                    :model-value="hoverStates[demo.img]"
                                    class="align-center justify-center"
                                    scrim="rgba(55, 114, 255, 0.5)"
                                    contained
                                >
                                    <v-btn color="primary" size="small" rounded="pill"flat target="_blank" :href="demo.link">Live Preview</v-btn>
                                </v-overlay>
                            </v-card>
                        </div>
                    </v-sheet>
                    <p class="text-body-1 font-weight-semibold text-grey200 text-center mt-1">{{ demo.name }}</p>
                </v-col>
            </div>
            <div class="mt-8">
                <h5 class="text-h5">Different Apps</h5>
                <div class="v-row mt-3">
                    <v-col v-for="demo in appsMegamenu" :key="demo.img">
                        <v-sheet class="text-center position-relative">
                        <div class="overflow-hidden rounded-md border">
                            <v-card
                                class="mx-auto"
                                rounded="0"
                                @mouseenter="setHoverState(demo.img, true)"
                                @mouseleave="setHoverState(demo.img, false)"
                            >
                                <img :src="demo.img" :alt="demo.img" class="w-100" />
                                <v-overlay
                                    :model-value="hoverStates[demo.img]"
                                    class="align-center justify-center"
                                    scrim="rgba(55, 114, 255, 0.5)"
                                    contained
                                >
                                    <v-btn color="primary" size="small" rounded="pill"flat target="_blank" :href="demo.link">Live Preview</v-btn>
                                </v-overlay>
                            </v-card>
                        </div>
                    </v-sheet>
                        <p class="text-body-1 font-weight-semibold text-grey200 text-center mt-1">{{ demo.name }}</p>
                    </v-col>
                </div>
            </div>
        </v-sheet>
    </v-menu>
    <v-menu open-on-hover :close-on-content-click="false" class="lp_wrapper position-relative">
        <template v-slot:activator="{ props }">
            <v-btn class="hidden-sm-and-down nav-links custom-hover-primary font-weight-regular" rounded="pill" variant="text" v-bind="props"
                >Frontend Pages<ChevronDownIcon size="18" class="mt-1 ml-1" />
            </v-btn>
        </template>
        <v-sheet max-width="100%" width="1150" height="100%" elevation="10" rounded="md" class="pa-8 mx-auto">
            <h5 class="text-h5">Different Front Pages</h5>
            <p class="text-subtitle-1 font-weight-medium textSecondary mt-1">Included with the package</p>
            <div class="v-row mt-3">
                <v-col v-for="demo in FrontPageMenu.slice(0, 5)" :key="demo.img">
                    <v-sheet class="text-center position-relative">
                        <div class="overflow-hidden rounded-md border">
                            <v-card
                                class="mx-auto"
                                rounded="0"
                                @mouseenter="setHoverState(demo.img, true)"
                                @mouseleave="setHoverState(demo.img, false)"
                            >
                                <img :src="demo.img" :alt="demo.img" class="w-100" />
                                <v-overlay
                                    :model-value="hoverStates[demo.img]"
                                    class="align-center justify-center"
                                    scrim="rgba(55, 114, 255, 0.5)"
                                    contained
                                >
                                    <v-btn color="primary" size="small" rounded="pill"flat target="_blank" :href="demo.link">Live Preview</v-btn>
                                </v-overlay>
                            </v-card>
                        </div>
                    </v-sheet>
                    <p class="text-body-1 font-weight-medium text-center mt-1">{{ demo.name }}</p>
                </v-col>
            </div>
        </v-sheet>
    </v-menu>
    <v-menu open-on-hover open-delay=1  :close-on-content-click="false" class="lp_wrapper position-relative">
        <template v-slot:activator="{ props }">
            <v-btn class="hidden-sm-and-down custom-hover-primary nav-links" :ripple="false" rounded="pill" variant="text" color="primary" v-bind="props"
                >Pages<ChevronDownIcon size="18" class="mt-1 ml-1" />
            </v-btn>
        </template>
        <v-sheet width="900" height="400" elevation="10" rounded="xl" class="pa-4 pb-0 mx-auto">
            <div>
                <v-row>
                    <v-col cols="12" lg="8" class="d-flex py-0">
                        <div class="pa-4 pb-0 pr-0">
                            <AppsLink />
                        </div>
                        <v-divider vertical></v-divider>
                    </v-col>
                    <v-col cols="12" lg="4" class="py-0">
                        <div class="pa-4">
                            <h5 class="text-h5 mb-4">Quick Links</h5>
                            <QuickLinks />
                        </div>
                    </v-col>
                </v-row>
            </div>
        </v-sheet>
    </v-menu>
    <v-btn variant="text" color="primary" class="custom-hover-primary nav-links" rounded="pill" :ripple="false" href="https://wrappixel.github.io/premium-documentation-wp/nuxt/spike/index.html" target="_blank">Documentation</v-btn>
    <v-btn variant="text" color="primary" class="custom-hover-primary nav-links" rounded="pill" :ripple="false" href="https://support.wrappixel.com/" target="_blank">Support</v-btn>
    
</template>
