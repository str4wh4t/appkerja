<script setup lang="ts">
import { ref } from 'vue';
/*Location Select*/
const select = ref('');
const location = ref(['India', 'United Kingdom', 'Srilanka']);

/*Language Select*/
const selectlng = ref('');
const language = ref(['English', 'French']);
</script>
<template>
    <v-row >
        <v-col cols="12" md="6">
            <div class="mb-6">
                <v-label class="font-weight-medium mb-2" for="vpifn">First Name</v-label>
                <v-text-field color="primary" variant="outlined" id="vpifn" type="text" placeholder="John" hide-details />
            </div>
            <div class="mb-6">
                <v-label class="font-weight-medium mb-2" for="vpicnt">Country</v-label>
                <v-select v-model="select" :items="location" single-line variant="outlined" id="vpicnt" hide-details></v-select>
            </div>
            <div>
                <v-label class="font-weight-medium mb-2" for="vpodob">Birth Date</v-label>
                <v-text-field color="primary" variant="outlined" id="vpodob" type="date" hide-details></v-text-field>
            </div>
        </v-col>
        <v-col cols="12" md="6">
            <div class="mb-6">
                <v-label class="font-weight-medium mb-2" for="vplssnm">Last Name</v-label>
                <v-text-field color="primary" variant="outlined" id="vplssnm" type="text" placeholder="Doe" hide-details />
            </div>
            <div class="mb-6">
                <v-label class="font-weight-medium mb-2" for="vpilng">Language</v-label>
                <v-select v-model="selectlng" :items="language" id="vpilng" single-line variant="outlined" hide-details></v-select>
            </div>
            <div>
                <v-label class="font-weight-medium mb-2" for="vpiphno">Phone no</v-label>
                <v-text-field color="primary" variant="outlined" id="vpiphno" type="text" placeholder="123 4567 201" hide-details></v-text-field>
            </div>
        </v-col>
        <v-col cols="12" class="mb-2">
            <v-btn color="primary" rounded="pill">Submit</v-btn>
            <v-btn class="bg-lighterror text-error ml-4" rounded="pill">Cancel</v-btn>
        </v-col>
    </v-row>
</template>
