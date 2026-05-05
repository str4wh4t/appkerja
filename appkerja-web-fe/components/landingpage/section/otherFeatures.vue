<script setup lang="ts">
import { listFeature } from '@/_mockApis/landingpage/lpPage';
</script>
<template>
    <div class="py-sm-16 py-10 bg-bglight">
        <div class="py-sm-16 py-10">
            <v-container class="maxWidth">
                <v-row class="justify-center">
                    <v-col cols="12">
                        <h5 class="text-h5 text-grey100 text-center font-weight-medium mb-6">Almost covered everything</h5>
                        <h2 class="sectionTitle text-center font-weight-bold mb-4">Other Amazing Features & Flexibility Provided
                        </h2>
                    </v-col>
                </v-row>
                <v-row class="mt-10">
                    <v-col cols="12" md="3" sm="4" class="pl-sm-3 pr-sm-2 d-flex" v-for="list in listFeature"
                        :key="list.title">
                        <v-card elevation="10">
                            <v-card-item class="pa-6">
                                <v-avatar size="50" :class="'rounded-md bg-light'+ list.bgcolor ">
                                    <component :is="list.icon" stroke-width="1.5" size="30" :class="'text-'+ list.bgcolor" />
                                </v-avatar>
                                <h4 class="text-h4 mt-6">{{ list.title }}</h4>
                                <h6 class="text-h6 text-grey100 font-weight-medium lh-md mt-2">{{ list.subtitle }}</h6>
                            </v-card-item>    
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>  
        </div>
    </div>
</template>