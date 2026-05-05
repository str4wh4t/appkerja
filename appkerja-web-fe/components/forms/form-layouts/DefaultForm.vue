<script setup lang="ts">
import { ref } from 'vue';
const select = ref('select');
const items = ref(['One', 'Two', 'Three', 'Four']);
const defaultcheckbox1 = ref(false);
const defaultcheckbox2 = ref(false);
const defaultcheckbox3 = ref(false);
const defaultcheckbox4 = ref(false);
const defaultcheckbox5 = ref(false);
const defaultcheckbox6 = ref(false);

</script>
<template>
    <v-row>
        <v-col cols="12" lg="12">
            <v-label class="mb-2 font-weight-medium" for="dt">Default Text</v-label>
            <v-text-field variant="outlined" color="primary" id="dt" model-value="George deo"></v-text-field>
            <v-label class="mb-2 font-weight-medium" for="de">Email</v-label>
            <v-text-field variant="outlined" color="primary" id="de"></v-text-field>
            <v-label class="mb-2 font-weight-medium" for="dp">Password</v-label>
            <v-text-field variant="outlined" type="password" id="dp" color="primary"></v-text-field>
            <v-label class="mb-2 font-weight-medium" for="do">Read Only</v-label>
            <v-text-field variant="outlined" color="primary" id="do" model-value="Hello World" readonly hide-details></v-text-field>
            <v-row class="my-3">
                <v-col cols="12" sm="8">
                    <v-row>
                        <v-col cols="12" lg="6" md="12">
                            <v-checkbox
                                density="compact"
                                v-model="defaultcheckbox1"
                                hide-details
                                color="primary"
                                label="Check this custom checkbox"
                            ></v-checkbox>
                            <v-checkbox
                                density="compact"
                                v-model="defaultcheckbox2"
                                hide-details
                                color="primary"
                                label="Check this custom checkbox"
                            ></v-checkbox>
                            <v-checkbox
                                density="compact"
                                v-model="defaultcheckbox3"
                                hide-details
                                color="primary"
                                label="Check this custom checkbox"
                            ></v-checkbox>
                        </v-col>
                        <v-col cols="12" lg="6" md="12">
                            <v-checkbox
                                density="compact"
                                v-model="defaultcheckbox4"
                                hide-details
                                color="primary"
                                label="Check this custom checkbox"
                            ></v-checkbox>
                            <v-checkbox
                                density="compact"
                                v-model="defaultcheckbox5"
                                hide-details
                                color="primary"
                                label="Check this custom checkbox"
                            ></v-checkbox>
                            <v-checkbox
                                density="compact"
                                v-model="defaultcheckbox6"
                                hide-details
                                color="primary"
                                label="Check this custom checkbox"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-label class="mb-2 font-weight-medium" for="sel">Select</v-label>
            <v-select
                v-model="select"
                :items="items"
                item-title="state"
                item-value="abbr"
                label="Select"
                return-object
                single-line
                variant="outlined"
                id="sel"
            ></v-select>
            <v-btn color="primary" rounded="pill">Submit</v-btn>
        </v-col>
    </v-row>
</template>
