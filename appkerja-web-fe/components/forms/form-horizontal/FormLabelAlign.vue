<script setup lang="ts">
import { ref } from 'vue';
const show2 = ref(true);

/*Location Select*/
const select = ref('');
const location = ref(['India', 'United Kingdom', 'Srilanka']);
</script>
<template>
    <v-card elevation="10" >
        <v-card-item>
            <div class="d-sm-flex align-center justify-space-between">
                <v-card-title class="text-h5">Form Label Alignment</v-card-title>
            </div>
        </v-card-item>
        <v-divider></v-divider>
        <!----Account Details---->
        <v-card-text class="pb-0">
            <h6 class="text-h6">Account Details</h6>
            <div class="mt-6">
                <v-row class="align-center mb-3">
                    <v-col cols="12" sm="3" class="pb-sm-3 pb-0 text-right">
                        <v-label class=" font-weight-medium" for="fbnm">Username</v-label>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field color="primary" variant="outlined" id="fbnm" type="text" placeholder="John Deo" hide-details />
                    </v-col>
                </v-row>
                <v-row class="align-center mb-3">
                    <v-col cols="12" sm="3" class="pb-sm-3 pb-0 text-right">
                        <v-label class=" font-weight-medium" for="fbeml">Email</v-label>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field
                            color="primary"
                            variant="outlined"
                            type="email"
                            placeholder="john.deo"
                            suffix="@example.com"
                            hide-details
                            id="fbeml"
                        />
                    </v-col>
                </v-row>
                <v-row class="align-center mb-3">
                    <v-col cols="12" sm="3" class="pb-sm-3 pb-0 text-right">
                        <v-label class=" font-weight-medium" for="fbpwd">Password</v-label>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field
                            color="primary"
                            variant="outlined"
                            :type="show2 ? 'text' : 'password'"
                            placeholder="john.deo"
                            hide-details
                            :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                            @click:append-inner="show2 = !show2"
                            id="fbpwd"
                        >
                        </v-text-field>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>
        <v-divider></v-divider>
        <!----Personal Info---->
        <v-card-text class="pb-1">
            <h6 class="text-h6">Personal Info</h6>
            <div class="mt-6">
                <v-row class="align-center mb-3">
                    <v-col cols="12" sm="3" class="pb-sm-3 pb-0 text-right">
                        <v-label class=" font-weight-medium" for="fbfnm">Full Name</v-label>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field color="primary" variant="outlined" id="fbfnm" type="text" placeholder="John Deo" hide-details />
                    </v-col>
                </v-row>
                <v-row class="align-center mb-3">
                    <v-col cols="12" sm="3" class="pb-sm-3 pb-0 text-right">
                        <v-label class=" font-weight-medium" for="fblcnt">Country</v-label>
                    </v-col>
                    <v-col cols="12" sm="9">
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
                            id="fblcnt"

                        ></v-select>
                    </v-col>
                </v-row>
                <v-row class="align-center mb-3">
                    <v-col cols="12" sm="3" class="pb-sm-3 pb-0 text-right">
                        <v-label class=" font-weight-medium" for="fldob">Birth Date</v-label>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field color="primary" variant="outlined" id="fldob" type="date" hide-details></v-text-field>
                    </v-col>
                </v-row>
                <v-row class="align-center mb-3">
                    <v-col cols="12" sm="3" class="pb-sm-3 pb-0 text-right">
                        <v-label class=" font-weight-medium" for="flph">Phone No</v-label>
                    </v-col>
                    <v-col cols="12" sm="9">
                        <v-text-field color="primary" variant="outlined" id="flph" type="text" placeholder="123 4567 207" hide-details>
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row class="align-center mb-3">
                    <v-col cols="12" sm="9" offset-sm="3">
                        <v-btn color="primary" rounded="pill">Submit</v-btn>
                        <v-btn class="bg-lighterror text-error ml-4" rounded="pill">Cancel</v-btn>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>
    </v-card>
</template>
