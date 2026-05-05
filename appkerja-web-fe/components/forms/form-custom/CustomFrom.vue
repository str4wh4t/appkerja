<script setup lang="ts">
import { ref } from 'vue';
import {Volume2Icon, VolumeIcon } from 'vue-tabler-icons';
const select = ref('One');
const items = ref(['One', 'Two', 'Three', 'Four']);
const radios = ref('Male');
const checked = ref(true);
const range = ref([20, 40]);
const sel1 = ref('750');
const sel2 = ref('950');
const select1 = ref(['750', '850', '950']);
const select2 = ref(['950', '1050', '1150']);
const volume = ref(40);
const model = ref(true);

</script>
<template>
    <v-row>
        <v-col cols="12" sm="4">
            <v-label class="mb-2 font-weight-medium" for="fcname">Name</v-label>
            <v-text-field variant="outlined" id="fcname" placeholder="Enter Text" color="primary"></v-text-field>
            <v-label class="mb-2 font-weight-medium" for="fcseldrop">Select Dropdown</v-label>
            <v-select
                :items="items"
                item-title="items"
                item-value="abbr"
                return-object
                single-line
                variant="outlined"
                v-model="select"
                id="fcseldrop"
            ></v-select>
        </v-col>
        <v-col cols="12" sm="4">
            <v-label class="mb-2 font-weight-medium" for="fccnm">Company Name</v-label>
            <v-text-field variant="outlined" placeholder="Enter Text" id="fccnm" color="primary"></v-text-field>
            <v-label class="mb-2 font-weight-medium" for="fctime">Time</v-label>
            <v-text-field variant="outlined" placeholder="hh:mm" id="fctime"  type="time" color="primary"></v-text-field>
        </v-col>
        <v-col cols="12" sm="4">
            <v-label class="mb-2 font-weight-medium" for="fcindtype">Industry Type</v-label>
            <v-text-field variant="outlined" placeholder="Disabled Filled" id="fcindtype" color="primary"></v-text-field>
            <v-label class="mb-2 font-weight-medium" for="fcdt">Date</v-label>
            <v-text-field variant="outlined" type="date" id="fcdt" color="primary"></v-text-field>
        </v-col>
        
        <v-col cols="12">
            <v-label class="mb-2 font-weight-medium" for="gndr">Lorem ipsum dolor sit amet</v-label>
            <v-radio-group inline v-model="radios">
                <v-row>
                    <v-col cols="12" md="4"><v-radio label="Male" color="primary"  value="Male" id="gndr"></v-radio></v-col>
                    <v-col cols="12" md="4"><v-radio label="Female" color="primary" value="Female" id="gndr2"></v-radio></v-col>
                    <v-col cols="12" md="4"><v-radio label="Disabled" color="primary" value="Disabled" id="gndr3" disabled></v-radio></v-col>
                </v-row>
            </v-radio-group>
            <v-label class="mb-2 font-weight-medium" for="isdtype">Industry Type</v-label>
            <v-row>
                <v-col cols="12" md="4">
                    <v-checkbox v-model="checked" color="primary" label="Enter text" id="isdtype"></v-checkbox>
                </v-col>
                <v-col cols="12" md="4">
                    <v-checkbox label="Enter text" color="primary" id="isdtype2"></v-checkbox>
                </v-col>
                <v-col cols="12" md="4">
                    <v-checkbox label="Disabled" id="isdtype3" disabled></v-checkbox>
                </v-col>
            </v-row> 
            <v-row>
                <v-col cols="12" md="4">
                    <div class="mb-2 font-weight-medium text-subtitle-1" >Slider</div>
                    <v-range-slider v-model="range" strict color="primary" ></v-range-slider>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                :items="select1"
                                item-title="select1"
                                item-value="abbr"
                                return-object
                                single-line
                                variant="outlined"
                                v-model="sel1"
                               
                            ></v-select>
                        </v-col> 
                        <v-col cols="12" md="6">
                            <v-select
                                :items="select2"
                                item-title="select2"
                                item-value="abbr"
                                return-object
                                single-line
                                variant="outlined"
                                v-model="sel2"
                               
                            ></v-select>
                        </v-col>
                    </v-row>
                    <v-label class="mb-2 font-weight-medium" for="vlm">Volume</v-label>
                    <v-slider v-model="volume"  color="primary" id="vlm">
                        <template v-slot:prepend>
                            <v-btn size="small" variant="text" color="primary">
                                <Volume2Icon stroke-width="1.5" size="20" />
                            </v-btn>
                        </template>
                        <template v-slot:append>
                            <v-btn size="small" variant="text" color="primary">
                                <VolumeIcon stroke-width="1.5" size="20" />
                            </v-btn>
                        </template>
                    </v-slider>
                </v-col>
            </v-row> 
            <v-label class="mb-2 font-weight-medium mt-4" for="swtch">Switch</v-label>
            <v-row>
                <v-col cols="12" md="3" sm="6">
                    <v-switch v-model="model"  hide-details color="primary" label="Enter text" id="swtch" inset></v-switch>
                </v-col>
                <v-col cols="12" md="3" sm="6">
                    <v-switch hide-details color="primary" label="Enter text" id="swtch2" inset></v-switch>
                </v-col>
                <v-col cols="12" md="3" sm="6">
                    <v-switch  hide-details label="Disabled" disabled inset id="swtch3"></v-switch>
                </v-col>
                <v-col cols="12" md="3" sm="6">
                    <v-switch hide-details label="Disabled" v-model="model" color="primary" id="swtch4" disabled inset></v-switch>
                </v-col>
            </v-row>
            <v-row class="mt-6 ">
                <v-col cols="12" md="6">
                    <v-btn color="primary" class="mr-3" rounded="pill">add new</v-btn>
                    <v-btn color="primary"  class="mr-3" disabled rounded="pill">add new</v-btn>
                    <v-btn color="primary" variant="outlined"  class="mr-3" rounded="pill" >add new</v-btn>
                </v-col> 
                <v-col cols="12" md="6" class="d-flex justify-end">
                    <v-btn color="info" class="mr-3" rounded="pill">add new</v-btn>
                    <v-btn color="success" rounded="pill">add new</v-btn>
                </v-col>  
            </v-row>      
        </v-col>
    </v-row>
</template>
