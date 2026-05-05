<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { BrandGithubIcon, BrandReactNativeIcon} from 'vue-tabler-icons';

</script>
<template>
    <v-row>
        <v-col cols="12">
            <v-card elevation="10" class="bg-surface">
                <v-card-item>
                    <h4 class="text-h5 mb-4">Teams</h4>
                    <div class="d-flex align-center mb-5">
                        <v-avatar size="40" class="bg-lightinfo">
                            <BrandGithubIcon size="20" stroke-width="1.5" class="text-info"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h5 class="text-subtitle-1 font-weight-semibold text-grey200 mb-1">Backend Developer</h5>
                            <p class="text-subtitle-1 font-weight-medium text-grey100">120 members</p>
                        </div> 
                    </div>
                    <div class="d-flex align-center mb-5">
                        <v-avatar size="40" class="bg-lightprimary">
                            <BrandReactNativeIcon size="20" stroke-width="1.5" class="text-primary"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h5 class="text-subtitle-1 font-weight-semibold text-grey200 mb-1">React Developer</h5>
                            <p class="text-subtitle-1 font-weight-medium text-grey100">86 members</p>
                        </div> 
                    </div>
                    <div>
                        <NuxtLink to="/" class="text-primary font-weight-semibold text-subtitle-1 text-decoration-none">View all</NuxtLink>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
