<script setup lang="ts">
import { ref } from 'vue';
const rating = ref(4);

</script>

<template>
    <v-row>
        <v-col lg="4" class="align-streach">
            <v-card variant="outlined" elevation="0" class="text-center h-100 d-flex align-center justify-center">
                <div class="pa-7 py-9">
                    <h6 class="text-subtitle-1 font-weight-regular">Average Rating</h6>
                    <h1 class="text-primary text-h1 my-4">4/5</h1>
                    <div class="text-medium-emphasis align-center justify-center d-flex mb-3 gap-2">
                        <ClientOnly><v-rating color="warning" half-increments v-model="rating" density="compact"> </v-rating></ClientOnly>
                    </div>
                </div>
            </v-card>
        </v-col>
        <v-col lg="4" class="align-streach justify-center">
            <v-card variant="outlined" elevation="0" class="text-center justify-center h-100">
                <div class="pa-5">
                    <v-row class="align-center justify-space-between ">
                        <v-col cols="3" md="auto" sm="3">
                            <div class="text-no-wrap text-subtitle-2">1 Stars</div>
                        </v-col>
                        <v-col cols="6" md="8" sm="6" class="px-0">
                            <v-progress-linear model-value="15" color="primary" bg-color="lightprimary" rounded="md"></v-progress-linear>
                        </v-col>
                        <v-col cols="3" md="auto" sm="3" class="px-0">
                            <span class="text-subtitle-1">(125)</span>
                        </v-col>
                    </v-row>
                    <v-row class="align-center justify-space-between mt-0">
                        <v-col cols="3" md="auto" sm="3">
                            <div class="text-no-wrap text-subtitle-2">2 Stars</div>
                        </v-col>
                        <v-col cols="6" md="8" sm="6" class="px-0">
                            <v-progress-linear model-value="20" color="primary" bg-color="lightprimary" rounded="md"></v-progress-linear>
                        </v-col>
                        <v-col cols="3" md="auto" sm="3" class="px-0">
                            <span class="text-subtitle-1">(130)</span>
                        </v-col>
                    </v-row>
                    <v-row class="align-center justify-space-between mt-0">
                        <v-col cols="3" md="auto" sm="3">
                            <div class="text-no-wrap text-subtitle-2">3 Stars</div>
                        </v-col>
                        <v-col cols="6" md="8" sm="6" class="px-0">
                            <v-progress-linear model-value="40" color="primary" bg-color="lightprimary" rounded="md"></v-progress-linear>
                        </v-col>
                        <v-col cols="3" md="auto" sm="3" class="px-0">
                            <span class="text-subtitle-1">(160)</span>
                        </v-col>
                    </v-row>
                    <v-row class="align-center justify-space-between mt-0">
                        <v-col cols="3" md="auto" sm="3">
                            <div class="text-no-wrap text-subtitle-2">4 Stars</div>
                        </v-col>
                        <v-col cols="6" md="8" sm="6" class="px-0">
                            <v-progress-linear model-value="15" color="primary" bg-color="lightprimary" rounded="md"></v-progress-linear>
                        </v-col>
                        <v-col cols="3" md="auto" sm="3" class="px-0">
                            <span class="text-subtitle-1">(105)</span>
                        </v-col>
                    </v-row>
                    <v-row class="align-center justify-space-between mt-0">
                        <v-col cols="3" md="auto" sm="3">
                            <div class="text-no-wrap text-subtitle-2">5 Stars</div>
                        </v-col>
                        <v-col cols="6" md="8" sm="6" class="px-0">
                            <v-progress-linear model-value="50" color="primary" bg-color="lightprimary" rounded="md"></v-progress-linear>
                        </v-col>
                        <v-col cols="3" md="auto" sm="3" class="px-0">
                            <span class="text-subtitle-1">(325)</span>
                        </v-col>
                    </v-row>
                </div>
            </v-card>
        </v-col>
        <v-col lg="4" class="align-streach">
            <v-card variant="outlined" elevation="0" class="d-flex align-center justify-center h-100">
                <div class="pa-7 py-9">
                    <v-btn variant="outlined" size="large" color="primary">
                        <PencilIcon size="20" class="mr-1" /> Write a Review
                    </v-btn>
                </div>
            </v-card>
        </v-col>
    </v-row>
</template>
