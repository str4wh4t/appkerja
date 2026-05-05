<script setup lang="ts">
import { BrandSkypeIcon, LanguageIcon, MailIcon, MapPinIcon, PhoneIcon, SchoolIcon } from 'vue-tabler-icons';

</script>
<template>
    <v-row>
        <v-col cols="12">
            <v-card elevation="10" class="bg-surface">
                <v-card-item>
                    <h4 class="text-h5">About me</h4>
                    <p class="my-5 text-subtitle-1 lh-md font-weight-medium">
                        Hello, I’m Mike Nielsen. I’m a professional who designs, develops, tests, and maintains software applications and systems.
                    </p>
                    <v-divider class="mb-4"></v-divider>
                    <h4 class="text-h5 mb-4">Contact</h4>
                    <div class="d-flex align-center mb-5">
                        <v-avatar size="40" class="bg-lighterror">
                            <PhoneIcon size="20" stroke-width="1.5" class="text-error"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h5 class="text-subtitle-1 font-weight-semibold text-grey200 mb-1">Call</h5>
                            <p class="text-subtitle-1 font-weight-medium text-grey100">(123) 456-7890</p>
                        </div> 
                    </div>
                    <div class="d-flex align-center mb-5">
                        <v-avatar size="40" class="bg-lightsuccess">
                            <MailIcon size="20" stroke-width="1.5" class="text-success"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h5 class="text-subtitle-1 font-weight-semibold text-grey200 mb-1">Email</h5>
                            <p class="text-subtitle-1 font-weight-medium text-grey100">jonathan@spike.com</p>
                        </div> 
                    </div>
                    <div class="d-flex align-center mb-5">
                        <v-avatar size="40" class="bg-lightprimary">
                            <BrandSkypeIcon size="20" stroke-width="1.5" class="text-primary"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h5 class="text-subtitle-1 font-weight-semibold text-grey200 mb-1">Skype</h5>
                            <p class="text-subtitle-1 font-weight-medium text-grey100">jonathan.doe</p>
                        </div> 
                    </div>
                    <v-divider class="mb-4"></v-divider>
                    <h4 class="text-h5 mb-4">Other</h4>
                    <div class="d-flex align-center mb-5">
                        <v-avatar size="40" class="bg-lightwarning">
                            <MapPinIcon size="20" stroke-width="1.5" class="text-warning"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h5 class="text-subtitle-1 font-weight-semibold text-grey200 mb-1">Location</h5>
                            <p class="text-subtitle-1 font-weight-medium text-grey100">Newyork, USA - 100001</p>
                        </div> 
                    </div>
                    <div class="d-flex align-center mb-5">
                        <v-avatar size="40" class="bg-lightsuccess">
                            <SchoolIcon size="20" stroke-width="1.5" class="text-success"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h5 class="text-subtitle-1 font-weight-semibold text-grey200 mb-1">Education</h5>
                            <p class="text-subtitle-1 font-weight-medium text-grey100">Saint Josef Institute of Science</p>
                        </div> 
                    </div>
                    <div class="d-flex align-center">
                        <v-avatar size="40" class="bg-lightindigo">
                            <LanguageIcon size="20" stroke-width="1.5" class="text-indigo"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h5 class="text-subtitle-1 font-weight-semibold text-grey200 mb-1">Language</h5>
                            <p class="text-subtitle-1 font-weight-medium text-grey100">English</p>
                        </div> 
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
