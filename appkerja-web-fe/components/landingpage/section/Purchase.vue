<script setup lang="ts">
import { CertificateIcon } from 'vue-tabler-icons';
</script>
<template>
    <div class=" bg-containerBg">
        <div class="pt-8">
            <v-container class="maxWidth">
                <v-card elevation="0" class="bg-bgdark build-app position-realtive overflow-visible">
                    <v-card-item class="pb-md-8 pb-0">
                        <v-row class="justify-space-between">
                            <v-col cols="12" md="6" class="text-md-left text-center">
                                <h2 class="text-h1 text-white lh-md">Haven't found an answer to your question?
                                </h2>
                                <div class="d-flex justify-md-start justify-center mt-4 ">
                                    <span class="text-h5 text-white font-weight-regular">Connect with us either on discord or email us</span>
                                </div>

                                <div class="mt-sm-10 mt-6 d-sm-flex gap-3">
                                    <v-btn href="https://discord.com/invite/eMzE8F6Wqs" target="_blank" color="primary" size="large"
                                        class="m-btn-full px-6" rounded="pill">Ask on Discord</v-btn>
                                    <v-btn href="https://support.wrappixel.com/" target="_blank" 
                                        variant="outlined" rounded="pill"
                                        class="lp-btn-shadow m-btn-full  px-6 mt-sm-0 mt-4" size="large">Submit
                                        ticket</v-btn>
                                </div>
                                <img src="/images/landingpage/background/school.png"
                                    class="d-md-none d-block w-100" />
                            </v-col>

                        </v-row>
                    </v-card-item>
                </v-card>
            </v-container>
        </div>
    </div>
</template>
