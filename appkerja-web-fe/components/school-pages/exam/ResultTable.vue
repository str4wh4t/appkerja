<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useResultsStore } from '@/stores/school-pages/exam_results';
import user1 from '/images/profile/user-1.jpg';
import contact from '@/_mockApis/components/school-pages/exam_results';
import { EyeIcon } from 'vue-tabler-icons';
const page1 = ref(1);
const store = useResultsStore();

onMounted(() => {
    store.fetchResults();
});
const getResults: any = computed(() => {
    return store.results;
});

const valid = ref(true);
const dialog = ref(false);
const search = ref('');
const rolesbg = ref(['error', 'success']);
const desserts = ref(contact);
const editedIndex = ref(-1);
const editedItem = ref({
        avatar: user1,
        userinfo: '',
        class:'',
        sec:'',
        Internalm:'',
        externalm: '',
        total: '',
        remarks: '',
        color:''
});
const defaultItem = ref({
    avatar: user1,
        userinfo: '',
        class:'',
        sec:'',
        Internalm:'',
        externalm: '',
        total: '',
        remarks: '',
        color:''
});

//Methods
const filteredList = computed(() => {
    return desserts.value.filter((user: any) => {
        return user.userinfo.toLowerCase().includes(search.value.toLowerCase());
    });
});

function editItem(item: any) {
    editedIndex.value = desserts.value.indexOf(item);
    editedItem.value = Object.assign({}, item);
    dialog.value = true;
}
function deleteItem(item: any) {
    const index = desserts.value.indexOf(item);
    confirm('Are you sure you want to delete this item?') && desserts.value.splice(index, 1);
}

function close() {
    dialog.value = false;
    setTimeout(() => {
        editedItem.value = Object.assign({}, defaultItem.value);
        editedIndex.value = -1;
    }, 300);
}
function save() {
    if (editedIndex.value > -1) {
        Object.assign(desserts.value[editedIndex.value], editedItem.value);
    } else {
        desserts.value.push(editedItem.value);
    }
    close();
}

//Computed Property
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'New Result' : 'Edit Result';
});
</script>
<template>
    <v-row>
        <v-col cols="12" lg="4" md="6">
            <v-text-field density="compact" v-model="search" label="Search Results" hide-details
                variant="outlined"></v-text-field>
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right">
            <v-dialog v-model="dialog" max-width="500">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" rounded="pill" class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Add Results
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title class="px-4 pt-6 justify-space-between d-flex align-center">
                        <span class="text-h5">{{ formTitle }}</span>
                        <v-btn @click="dialog = false" :ripple="false" density="compact" icon="mdi-close"></v-btn>
                    </v-card-title>
                    <v-card-text class="px-4">
                        <v-form class="dialog_form" ref="form" v-model="valid" lazy-validation>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.userinfo"
                                        label="Profile"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.class"
                                        label="Class"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.sec"
                                        label="Grade"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.Internalm"
                                        label="Internal Marks"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.externalm"
                                        label="External Marks"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.total" label="Total"
                                        type="text"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.remarks"
                                        label="Remarks" type="text"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12">
                                    <v-select
                                        variant="outlined"
                                        hide-details
                                        :items="rolesbg"
                                        v-model="editedItem.color"
                                        label="Role Background"
                                    ></v-select>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>

                    <div class="pa-4 d-flex justify-end gap-2">
                        <v-spacer></v-spacer>
                        <v-btn color="error" @click="close"  class=" px-3 rounded-pill">Cancel</v-btn>
                        <v-btn color="primary" :disabled="editedItem.userinfo == '' || editedItem.remarks == ''"
                        class="px-3 rounded-pill" @click="save" >Save</v-btn>
                    </div>
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
    <div class="border-table">
        <v-table class="mt-5 ">
            <thead>
                <tr>
                    <!-- <th class="text-subtitle-1 font-weight-semibold">Id</th> -->
                    <th class="text-subtitle-1 font-weight-semibold text-no-wrap">Examination Name</th>
                    <th class="text-subtitle-1 font-weight-semibold text-no-wrap">Grade</th>
                    <th class="text-subtitle-1 font-weight-semibold text-no-wrap">Internal Marks</th>
                    <th class="text-subtitle-1 font-weight-semibold text-no-wrap">External Marks</th>
                    <th class="text-subtitle-1 font-weight-semibold text-no-wrap">Total</th>
                    <th class="text-subtitle-1 font-weight-semibold text-no-wrap">Remarks</th>
                    <th class="text-subtitle-1 font-weight-semibold text-no-wrap">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredList" :key="item.id">
                    <!-- <td class="text-subtitle-1">{{ item.id }}</td> -->
                    <td>
                        <div class="d-flex align-center">
                            <div>
                                <v-img :src="item.avatar" width="45px" class="rounded-circle img-fluid"></v-img>
                            </div>

                            <div class="ml-5">
                                <h4 class="text-subtitle-1 font-weight-semibold text-no-wrap">{{ item.userinfo }}</h4>
                                <div class="text-subtitle-1 textSecondary text-no-wrap mt-1">Class: {{ item.class }}</div>
                            </div>
                        </div>
                    </td>
                    <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ item.sec }}</td>
                    <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ item.Internalm }}</td>
                    <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ item.externalm }}</td>
                    <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ item.total }}</td>

                    <td :class="'text-subtitle-1 textSecondary text-no-wrap mt-1 text-' + item.color ">{{ item.remarks }}</td>
    
                    <td>
                        <div class="d-flex align-center">
                            <v-tooltip text="Edit">
                                <template v-slot:activator="{ props }">
                                    <v-btn icon flat @click="editItem(item)" v-bind="props">
                                        <PencilIcon stroke-width="1.5" size="20" class="text-primary" />
                                    </v-btn>
                                </template>
                            </v-tooltip>
                            <v-tooltip text="Delete">
                                <template v-slot:activator="{ props }">
                                    <v-btn icon flat @click="deleteItem(item)" v-bind="props">
                                        <TrashIcon stroke-width="1.5" size="20" class="text-error" />
                                    </v-btn>
                                </template>
                            </v-tooltip>
                            <v-tooltip text="View Details">
                                <template v-slot:activator="{ props }">
                                    <v-btn icon flat v-bind="props" to="/school-pages/exam/result-details">
                                        <EyeIcon stroke-width="1.5" size="20" class="text-info" />
                                    </v-btn>
                                </template>
                            </v-tooltip>
                        </div>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </div>
    <v-divider></v-divider>
    <div class="d-sm-flex justify-md-space-between align-center mt-3">
        <div class="text-subtitle-1 text-grey100">
            Showing 1 to 6 of 20 entries
        </div>
        <div >
            <v-pagination v-model="page1" class="my-4 text-subtitle-1" :length="5"></v-pagination>
        </div>
    </div>
</template>
