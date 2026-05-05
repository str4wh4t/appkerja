<script setup lang="ts">
import { ref } from 'vue';
const select = ref('select');
const gender = ref(['Male', 'Female']);
const inline = ref(null);
const country = ref(['USA', 'United Kingdom', 'India', 'Srilanka']);
</script>
<template>
    <v-row>
        <v-col cols="12" lg="12">
            <v-alert variant="tonal" type="warning" color="primary" class="mb-6"> Person Info </v-alert>

            <v-row>
                <v-col cols="12" md="6">
                    <v-label class="mb-2 font-weight-medium" for="fn">First Name</v-label>
                    <v-text-field variant="outlined" color="primary" id="fn"></v-text-field>
                    <v-label class="mb-2 font-weight-medium" for="sg">Select Gender</v-label>
                    <v-select :items="gender" item-title="gender" id="sg" item-value="abbr" return-object single-line variant="outlined"></v-select>
                </v-col>
                <v-col cols="12" md="6">
                    <v-label class="mb-2 font-weight-medium" for="ln">Last Name</v-label>
                    <v-text-field variant="outlined" color="primary" id="ln"></v-text-field>
                    <v-label class="mb-2 font-weight-medium" for="dob">Date of Birth</v-label>
                    <v-text-field color="primary" variant="outlined" id="dob" type="date" ></v-text-field>
                </v-col>
            </v-row>
            <v-label class="mb-2 font-weight-medium" for="mmb">Membership</v-label>
            <v-radio-group v-model="inline" inline >
                <v-radio label="Free" value="radio-1" color="primary" id="mmb"></v-radio>
                <v-radio label="Paid" value="radio-2" color="primary" id="mmb2"></v-radio>
            </v-radio-group>
            <!---Address--->
            <v-alert variant="tonal" type="warning" color="primary" class="mb-6"> Address </v-alert>
            <v-row>
                <v-col cols="12">
                    <v-label class="mb-2 font-weight-medium" for="str">Street</v-label>
                    <v-text-field variant="outlined" color="primary" id="str" hide-details></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-label class="mb-2 font-weight-medium" for="ct">City</v-label>
                    <v-text-field variant="outlined" color="primary" id="ct"></v-text-field>
                    <v-label class="mb-2 font-weight-medium" for="pc">Post Code</v-label>
                    <v-text-field variant="outlined" color="primary" id="pc"></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                    <v-label class="mb-2 font-weight-medium" for="stt">State</v-label>
                    <v-text-field variant="outlined" color="primary" id="stt"></v-text-field>
                    <v-label class="mb-2 font-weight-medium" for="cnt">Country</v-label>
                    <v-select
                        :items="country"
                        item-title="country"
                        item-value="abbr"
                        return-object
                        single-line
                        variant="outlined"
                        id="cnt"
                    ></v-select>
                </v-col>
            </v-row>
            
            <v-btn color="error" class="mr-3" rounded="pill">Cancel</v-btn>
            <v-btn color="primary" rounded="pill">Submit</v-btn>
        </v-col>
    </v-row>
</template>
