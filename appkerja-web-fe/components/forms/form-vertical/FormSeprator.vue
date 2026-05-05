<script setup lang="ts">
import { ref } from 'vue';
const show2 = ref(true);
const show3 = ref(true);

/*Location Select*/
const select = ref('');
const location = ref(['India', 'United Kingdom', 'Srilanka']);
const selectlng = ref('');
const lang = ref(['English', 'French']);
</script>
<template>
    <v-card elevation="10" >
        <v-card-item>
            <div class="d-sm-flex align-center justify-space-between">
                <v-card-title class="text-h5">Multi Column with Form Separator</v-card-title>
            </div>
        </v-card-item>
        <v-divider></v-divider>
        <!----Account Details---->
        <v-card-text class="pb-0">
            <h6 class="text-h6">Account Details</h6>
            <v-row class="mt-5 mb-3">
                <v-col cols="12" md="6">
                    <div class="mb-6">
                        <v-label class="font-weight-medium mb-2" for="vfsunm">Username</v-label>
                        <v-text-field color="primary" variant="outlined" id="vfsunm" type="text" placeholder="John Deo" hide-details />
                    </div>
                    <div class="">
                        <v-label class="font-weight-medium mb-2" for="vfpwd1">Password</v-label>
                        <v-text-field
                            color="primary"
                            variant="outlined"
                            :type="show2 ? 'text' : 'password'"
                            placeholder="john.deo"
                            hide-details
                            :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append-inner="show2 = !show2"
                            id="vfpwd1"
                        >
                        </v-text-field>
                    </div>
                </v-col>
                <v-col cols="12" md="6">
                    <div class="mb-6">
                        <v-label class="font-weight-medium mb-2" for="vfemp1">Email</v-label>
                        <v-text-field
                            color="primary"
                            variant="outlined"
                            type="email"
                            placeholder="john.deo"
                            suffix="@example.com"
                            id="vfemp1"
                            hide-details
                        />
                    </div>
                    <v-label class="font-weight-medium mb-2" for="vfcmpp">Confirm Password</v-label>
                    <v-text-field
                        color="primary"
                        variant="outlined"
                        :type="show3 ? 'text' : 'password'"
                        placeholder="john.deo"
                        hide-details
                        :append-inner-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append-inner="show3 = !show3"
                        id="vfcmpp"
                    >
                    </v-text-field>
                </v-col>
            </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <!----Personal Info---->
        <v-card-text class="pb-1">
            <h6 class="text-h6">Personal Info</h6>
            <v-row class="mt-5 mb-3">
                <v-col cols="12" md="6">
                    <div class="mb-6">
                        <v-label class="font-weight-medium mb-2" for="vffs">First Name</v-label>
                        <v-text-field color="primary" variant="outlined" id="vffs" type="text" placeholder="John Deo" hide-details />
                    </div>
                    <div class="mb-6">
                        <v-label class="font-weight-medium mb-2" for="vfcntry">Country</v-label>
                        <v-select
                            v-model="select"
                            :items="location"
                            item-title="state"
                            item-value="abbr"
                            label="Select"
                            return-object
                            single-line
                            variant="outlined"
                            hide-details
                            id="vfcntry"
                        ></v-select>
                    </div>
                    <div>
                        <v-label class="font-weight-medium mb-2" for="vfdob1">Birth Date</v-label>
                        <v-text-field color="primary" variant="outlined" id="vfdob1" type="date" hide-details></v-text-field>
                    </div>
                </v-col>
                <v-col cols="12" md="6">
                    <div class="mb-6">
                        <v-label class="font-weight-medium mb-2" for="vfname1">Last Name</v-label>
                        <v-text-field color="primary" variant="outlined" id="vfname1" type="text" placeholder="Deo" hide-details />
                    </div>
                    <div class="mb-6">
                        <v-label class="font-weight-medium mb-2" for="vflngg">Language</v-label>
                        <v-select v-model="selectlng" :items="lang" id="vflngg" single-line variant="outlined" hide-details></v-select>
                    </div>
                    <div>
                        <v-label class="font-weight-medium mb-2" for="vfphone1">Phone No</v-label>
                        <v-text-field color="primary" variant="outlined" id="vfphone1" type="text" placeholder="412 2150 451" hide-details />
                    </div>
                </v-col>
                <v-col cols="12">
                    <v-btn color="primary" rounded="pill">Submit</v-btn>
                    <v-btn class="bg-lighterror text-error ml-4" rounded="pill">Cancel</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
