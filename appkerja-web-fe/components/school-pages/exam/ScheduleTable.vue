<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useScheduleStore } from '@/stores/school-pages/exam_schedule';
import user1 from '/images/profile/user-1.jpg';
import contact from '@/_mockApis/components/school-pages/exam_schedule';
import { EyeIcon } from 'vue-tabler-icons';
const page1 = ref(1);
const store = useScheduleStore();

onMounted(() => {
    store.fetchSchedule();
});
const getSchedule: any = computed(() => {
    return store.schedule;
});

const valid = ref(true);
const dialog = ref(false);
const showscehdule = ref(false);
const search = ref('');
const rolesbg = ref(['primary', 'secondary', 'error', 'success', 'warning']);
const desserts = ref(contact);
const editedIndex = ref(-1);
const editedItem = ref({
    class: '',
    sec: '',
    time: '',
    date: '',
    location: '',
});
const defaultItem = ref({
    class: '',
    sec: '',
    time: '',
    date: '',
    location: '',
});

const viewItems = ref({
    class: '',
    sec: '',
    time: '',
    date: '',
    location: '',
    blockno: '',
    sub1: '',
    sub2: '',
    sub3: '',
    sub4: '',
    sub5: '',
    sub6: '',
});

//Methods
const filteredList = computed(() => {
    return desserts.value.filter((user: any) => {
        return user.location.toLowerCase().includes(search.value.toLowerCase());
    });
});

function editItem(item: any) {
    editedIndex.value = desserts.value.indexOf(item);
    editedItem.value = Object.assign({}, item);
    dialog.value = true;
}

function viewItem(item: any) {
    editedIndex.value = desserts.value.indexOf(item);
    viewItems.value = Object.assign({}, item);
    showscehdule.value = true;
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
    return editedIndex.value === -1 ? 'New Schedule' : 'Edit Schedule';
});
</script>
<template>
    <v-row>
        <v-col cols="12" lg="4" md="6">
            <v-text-field density="compact" v-model="search" label="Search Schedule" hide-details
                variant="outlined"></v-text-field>
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right">
            <v-dialog v-model="dialog" max-width="500">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" rounded="pill" class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Add Schedule
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
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.class"
                                        label="Class"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.sec"
                                        label="Section"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.time"
                                        label="Time"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.date"
                                        label="Date"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field variant="outlined" hide-details v-model="editedItem.location"
                                        label="Location" type="Location"></v-text-field>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>

                    <div class="pa-4 d-flex justify-end gap-2">
                        <v-spacer></v-spacer>
                        <v-btn color="error" @click="close" rounded="pill">Cancel</v-btn>
                        <v-btn color="primary" :disabled="editedItem.class == '' || editedItem.date == ''" @click="save"
                        rounded="pill">Save</v-btn>
                    </div>
                </v-card>
            </v-dialog>
        </v-col>
        <!--view schedule modal dialog-->
        <v-dialog v-model="showscehdule" max-width="500">
            <v-card>
                <v-card-title class="px-4 pt-6 justify-space-between d-flex align-center">
                    <span class="text-h5">Exam Schedule</span>
                    <v-btn @click="showscehdule = false" :ripple="false" density="compact" icon="mdi-close"></v-btn>
                </v-card-title>
                <v-card-text class="px-4">
                    <v-form class="dialog_form" ref="form" v-model="valid" lazy-validation>
                        <div class="vertical-table rounded-md">
                            <v-table density="compact">
                                <tbody>
                                    <tr>
                                        <th class="text-subtitle-1 font-weight-semibold">Class</th>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ viewItems.class }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-subtitle-1 font-weight-semibold">Section</th>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ viewItems.sec }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-subtitle-1 font-weight-semibold">Time</th>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ viewItems.time }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-subtitle-1 font-weight-semibold">Date</th>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ viewItems.date }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-subtitle-1 font-weight-semibold">Location</th>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ viewItems.location }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-subtitle-1 font-weight-semibold">Block No.</th>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ viewItems.blockno }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-subtitle-1 font-weight-semibold " rowspan="6">Subjects</th>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">
                                            {{ viewItems.sub1 }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">
                                            {{ viewItems.sub2 }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">
                                            {{ viewItems.sub3 }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">
                                            {{ viewItems.sub4 }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">
                                            {{ viewItems.sub5 }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">
                                            {{ viewItems.sub6 }}
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </div>
                    </v-form>
                </v-card-text>

                <div class="pa-4 d-flex justify-end">
                    <v-spacer></v-spacer>
                    <v-btn color="error" class="px-4" @click="showscehdule = false" rounded="pill" >Cancel</v-btn>
                </div>
            </v-card>

        </v-dialog>

    </v-row>
    <div class="border-table">
        <v-table class="mt-5 ">
            <thead>
                <tr>
                    <!-- <th class="text-subtitle-1 font-weight-semibold">Id</th> -->
                    <th class="text-subtitle-1 font-weight-semibold">Exam</th>
                    <th class="text-subtitle-1 font-weight-semibold">Time</th>
                    <th class="text-subtitle-1 font-weight-semibold">Date</th>
                    <th class="text-subtitle-1 font-weight-semibold">Location</th>
                    <th class="text-subtitle-1 font-weight-semibold">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in filteredList" :key="item.id">
                    <td>
                        <div class="d-flex align-center">
                            <div>
                                <h4 class="text-subtitle-1 font-weight-semibold text-no-wrap">Class: {{ item.class }}</h4>
                                <div class="text-subtitle-1 textSecondary text-no-wrap mt-1">Section: {{ item.sec }}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ item.time }}</td>
                    <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ item.date }}</td>
                    <td class="text-subtitle-1 textSecondary text-no-wrap mt-1">{{ item.location }}</td>
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
                            <v-tooltip text="View">
                                <template v-slot:activator="{ props }">
                                    <v-btn icon flat @click="viewItem(item)" v-bind="props">
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
            Showing 1 to 10 of 16 entries
        </div>
        <div>
            <v-pagination v-model="page1" rounded="circle" density="compact" class="text-subtitle-1 text-grey100 my-4"  :length="5"></v-pagination>
        </div>
    </div>
</template>
