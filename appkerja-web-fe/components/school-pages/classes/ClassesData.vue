<script setup lang="ts">
import { Book2Icon, ClockIcon } from 'vue-tabler-icons';
import { ref, onMounted, computed } from 'vue';
import { useClassesStore } from '@/stores/school-pages/classes';
import { format } from 'date-fns';
import { RouterLink } from 'vue-router';
const store = useClassesStore();
onMounted(() => {
    store.fetchPosts();
});

const getPosts = computed(() => {
    return store.classinfo;
});


const props = defineProps({ post: Object });

const linkTo = props.post?.title
    ?.toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');


const addclassdialog = ref(false);



</script>
<template>
    <div class="d-flex align-center ">
        <h5 class="text-h5 font-weight-semibold">Todays Classes</h5>
        <v-dialog v-model="addclassdialog" max-width="500" class="add-class">
            <template v-slot:activator="{ props }">
                <v-btn color="primary" v-bind="props" rounded="pill" class="ml-auto">
                    Add Classes
                </v-btn>
            </template>

            <v-card elevation="10" class="overflow-hidden">
                
                    <v-card-title class="px-4 pb-6 justify-space-between d-flex align-center pt-4">
                        <span class="text-h5">Add Classes</span>
                        <v-btn @click="addclassdialog = false" :ripple="false" density="compact" icon="mdi-close"></v-btn>
                    </v-card-title>
                   
                    <v-card-text class="px-4 pb-4">
                        <v-row>
                            <perfect-scrollbar suppressScrollX: true style="max-height: 500px;overflow-x: hidden;" class="pt-4">   
                                <v-row class="px-4"> 
                                <v-col cols="12">   
                                    <v-label class="mb-2 text-grey100">Class Name</v-label>
                                    <VTextField type="text" hide-details density="compact"></VTextField>
                                </v-col>
                                <v-col cols="12">
                                    <v-label class="mb-2 text-grey100">Class Profile</v-label>
                                    <v-file-input accept="image/*" hide-details variant="outlined"
                                        density="compact"></v-file-input>
                                </v-col>
                                <v-col cols="12">
                                    <v-label class="mb-2 text-grey100">Class Detail</v-label>
                                    <VTextField type="text" hide-details density="compact"></VTextField>
                                </v-col>
                                <v-col cols="12">
                                    <v-label class="mb-2 text-grey100">Class Lesson</v-label>
                                    <VTextField type="text" hide-details density="compact"></VTextField>
                                </v-col>
                                <v-col cols="12">
                                    <v-label class="mb-2 text-grey100">Time Duration</v-label>
                                    <VTextField type="text" hide-details density="compact"></VTextField>
                                </v-col>
                                <v-col cols="12">
                                    <v-label class="mb-2 text-grey100">Teacher Name</v-label>
                                    <VTextField type="text" hide-details density="compact"></VTextField>
                                </v-col>
                                <v-col cols="12">
                                    <v-label class="mb-2 text-grey100">Teacher Profile</v-label>
                                    <v-file-input accept="image/*" hide-details variant="outlined"
                                        density="compact"></v-file-input>
                                </v-col>
                            </v-row>
                        </perfect-scrollbar>    
                            <v-col cols="12">
                                <div class="mt-4 d-flex justify-end">
                                    <div class="ml-auto">
                                        <v-btn color="error" rounded="pill" class="mr-3"
                                            @click="addclassdialog = false">Cancel</v-btn>
                                        <v-btn color="primary" rounded="pill" class="">Add Class</v-btn>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                
               
            </v-card>
        </v-dialog>
    </div>
    <v-row class="mt-5">

        <template v-for="(post, i) in getPosts" :key="post?.id">
            <v-col cols="12" md="4" sm="6">
                <v-card elevation="10">
                    <!-- <NuxtLink :to="`/school-pages/classes/details/${post.id}`"> -->
                        <v-img :src="post?.img" height="240px" alt="post" cover class="align-start text-left">
                            <div class="pl-2 pt-3" v-if="post?.chip"><v-chip
                                    :class="'text-subtitle-1 font-weight-medium bg-' + post?.chipbg" size="small">{{
                                        post?.chip
                                    }}</v-chip></div>
                        </v-img>
                    <!-- </NuxtLink> -->
                    <v-card-text>
                        <div class="text-subtitle-1 text-grey100 mb-2">{{ post?.caption }}</div>
                        <h5 class="text-h5 mb-6">{{ post?.title }}</h5>
                        <div class="d-flex align-center mb-5">
                            <div class="d-flex align-center text-subtitle-1 text-grey100">
                                <ClockIcon stroke-width="1.5" size="15" class="text-grey100 mr-2" />{{ post?.lesson }}
                            </div>
                            <div class="mx-5 text-grey100">/</div>
                            <div class="d-flex align-center text-subtitle-1 text-grey100">
                                <Book2Icon stroke-width="1.5" size="15" class="text-grey100 mr-2" />{{ post?.hour }}
                            </div>
                        </div>
                        <div class="d-flex align-center">
                            <v-avatar  size="46">
                                <img :src="post?.profileimg" height="46" width="46">
                            </v-avatar>
                            <h5 class="text-subtitle-1 font-weight-medium ml-3">{{ post?.name }}</h5>
                        </div>
                    </v-card-text>
               
            </v-card>
        </v-col>
    </template>
</v-row>
</template>
