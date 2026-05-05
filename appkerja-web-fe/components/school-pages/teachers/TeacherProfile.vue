<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
const editteacherprofile = ref(false);
const name = ref('John Mednath');
const gender = ref('female');
const teacherclass = ref('11 (Science)');
const teachersection = ref('B');
const teacherdob = ref('03/08/1993');
const idno = ref('498376');
const phoneno = ref('+ 123 9988568');
const email = ref('johnmednath@gmail.com');
const checkbox = ref(false);


</script>
<template>
    <v-card elevation="10">
        <v-card-text>
            <div class="d-flex justify-center text-center">
                <div>
                    <v-avatar class="rounded-xl" size="110">
                        <img src="/images/profile/2.jpg" height="110" width="110">
                    </v-avatar>
                    <h5 class="text-h5 mt-3 mb-1">John Mednath</h5>
                    <v-chip size="small" color="primary">
                        Teacher
                    </v-chip>
                </div>
            </div>
            <div class="d-flex  justify-space-between mt-12">
                <div class="d-flex align-items-center">
                    <v-avatar class="bg-lightsuccess" size="50">
                        <CheckIcon class="text-success" stroke-width="1.5" size="24" col />
                    </v-avatar>
                    <div class="ms-3">
                        <p class="text-h5 mb-1">1.23k</p>
                        <p class="text-subtitle-1 text-grey100">Tasks Done</p>
                    </div>
                </div>

                <div class="d-flex align-items-center">
                    <v-avatar class="bg-lightsuccess" size="50">
                        <CpuIcon class="text-success" stroke-width="1.5" size="24" col />
                    </v-avatar>

                    <div class="ms-3">
                        <p class="text-h5 mb-1">568</p>
                        <p class="text-subtitle-1 text-grey100">Projects Done</p>
                    </div>
                </div>
            </div>

            <div class="mt-12">
                <div class="pb-1 mb-2 border-bottom pb-3">
                    <h6 class="text-subtitle-1 font-weight-semibold">Details</h6>
                </div>

                <div>
                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Name:
                            <span class="text-subtitle-1 text-grey100 ms-1">John Mednath</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Gender:
                            <span class="text-subtitle-1 text-grey100 ms-1">Female</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Class:
                            <span class="text-subtitle-1 text-grey100 ms-1">11 (Science)</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Section:
                            <span class="text-subtitle-1 text-grey100 ms-1">B</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Date Of Birth:
                            <span class="text-subtitle-1 text-grey100 ms-1">03/08/1993</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Id No. :
                            <span class="text-subtitle-1 text-grey100 ms-1">498376</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Phone:
                            <span class="text-subtitle-1 text-grey100 ms-1">+ 123 9988568</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Email:
                            <span class="text-subtitle-1 text-grey100 ms-1">johnmednath@gmail.com</span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="mt-8">
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-dialog v-model="editteacherprofile" max-width="500" class="add-class">
                            <template v-slot:activator="{ props }">
                                <v-btn color="primary" rounded="pill" block v-bind="props" size="large" class="ml-auto">
                                    <EditIcon stroke-width="2" size="20" class="mr-2" /> Edit
                                </v-btn>
                            </template>
                            <v-card elevation="10" class="overflow-hidden">
                               
                                    <v-card-title class="px-4 pb-6 justify-space-between d-flex align-center pt-4">
                                        <span class="text-h5">Edit Teacher Details</span>
                                        <v-btn @click="editteacherprofile = false" :ripple="false" density="compact"
                                            icon="mdi-close"></v-btn>
                                    </v-card-title>
                                    <v-card-text class="px-4 pb-4">
                                          
                                        <v-row>
                                            <perfect-scrollbar suppressScrollX: true style="max-height: 500px;overflow-x: hidden;" class="pt-4"> 
                                            <v-row class="px-4">
                                             <v-col cols="12">
                                                <v-label class="mb-2 text-grey100">Name</v-label>
                                                <VTextField type="text" hide-details density="compact" v-model="name">
                                                </VTextField>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-label class="mb-2 text-grey100">Gender</v-label>
                                                <v-radio-group hide-details v-model="gender" column>
                                                    <v-radio label="Male" color="primary" density="compact"
                                                        value="male"></v-radio>
                                                    <v-radio label="Female" color="primary" density="compact"
                                                        value="female"></v-radio>
                                                </v-radio-group>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-label class="mb-2 text-grey100">Class</v-label>
                                                <VTextField type="text" hide-details density="compact"
                                                    v-model="teacherclass"></VTextField>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-label class="mb-2 text-grey100">Section</v-label>
                                                <VTextField type="text" hide-details density="compact"
                                                    v-model="teachersection"></VTextField>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-label class="mb-2 text-grey100">Date Of Birth</v-label>
                                                <VTextField type="text" hide-details density="compact" v-model="teacherdob">
                                                </VTextField>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-label class="mb-2 text-grey100">Id No.</v-label>
                                                <VTextField type="text" hide-details density="compact" v-model="idno">
                                                </VTextField>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-label class="mb-2 text-grey100">Phone</v-label>
                                                <VTextField type="text" hide-details density="compact" v-model="phoneno">
                                                </VTextField>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-label class="mb-2 text-grey100">Email</v-label>
                                                <VTextField type="text" hide-details density="compact" v-model="email">
                                                </VTextField>
                                            </v-col>
                                            <v-col cols="12" class="py-0">
                                                <v-checkbox v-model="checkbox" class="ml-n2"
                                                    hide-details color="primary">
                                                    <template v-slot:label class="">Are you sure want to update profile</template>
                                                </v-checkbox>
                                            </v-col>
                                         </v-row>
                                           
                                        </perfect-scrollbar>
                                        <v-col cols="12">
                                                <div class="mt-4 d-flex justify-end">
                                                    <div class="ml-auto">
                                                        <v-btn color="error" rounded="pill" class="mr-3"
                                                            @click="editteacherprofile = false">Cancel</v-btn>
                                                        <v-btn color="primary" rounded="pill" class="">Update Changes</v-btn>
                                                    </div>
                                                </div>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                               
                            </v-card>
                        </v-dialog>
                    </v-col>
                    <v-col cols="12" sm="6">
                    <v-btn color="error" size="large"  rounded="pill" block class="">
                        <TrashIcon stroke-width="2" size="20" class="mr-2"  /> Delete
                    </v-btn>
                </v-col>
            </v-row>
        </div>
    </v-card-text>
</v-card></template>
