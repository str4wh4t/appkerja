<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { HeartIcon, IdIcon, Layout2Icon, PhotoIcon, PlusIcon, UserCircleIcon, UsersIcon } from 'vue-tabler-icons';
import profileBg from '/images/backgrounds/profilebg-2.jpg';
import UserImage from '/images/profile/user6.jpg';

const tab = ref(null);
const items = shallowRef([
    { tab: 'My Profile', icon: UserCircleIcon, href: '/apps/userprofile/one' },
    { tab: 'Teams', icon: UsersIcon, href: '/apps/userprofile/one/teams' },
    { tab: 'Projects', icon: Layout2Icon, href: '/apps/userprofile/one/projects' },
    { tab: 'Connection', icon: IdIcon, href: '/apps/userprofile/one/connection' }
]);


</script>

<template>
    <img :src="profileBg" alt="profile" class="w-100" />
    <div class="mx-sm-5">
        <v-card elevation="10" class="overflow-hidden mt-sm-n13 mt-n5">
            <v-card-item class="pb-0">
                <v-row class="mt-1 justify-space-between">
                    <v-col cols="12" md="6" sm="9" class="pt-0">
                        <div class="d-sm-flex align-center justify-sm-start justify-center">
                            <div class="text-sm-left text-center">
                                <v-avatar size="100" class="userImage position-relative overflow-visible">
                                    <img :src="UserImage" width="100" alt="Mathew"  class="rounded-circle"/>
                                    <v-avatar size="26" class="bg-primary position-absolute plus">
                                        <PlusIcon size="16" stroke-width="2" />
                                    </v-avatar>
                                </v-avatar>

                            </div>
                            <div class="ml-sm-4 text-sm-left text-center">
                                <h5 class="text-h3 font-weight-semibold mb-1 my-sm-0 my-2">Mike Nielsen <v-chip color="primary"
                                        class="bg-lightprimary font-weight-semibold ml-2 mt-n1" variant="outlined"
                                        size="x-small">Admin</v-chip></h5>
                                <span class="text-h6 font-weight-medium text-grey100">Dream big. Think different. Do
                                    great!</span>
                                <div class="text-subtitle-1 font-weight-semibold text-grey200 d-flex align-center mt-1 justify-sm-start justify-center">
                                    <div class="bg-success pa-1 rounded-circle mr-2"></div>Active
                                </div>
                            </div>
                        </div>
                    </v-col>
                    <v-col cols="12" md="6" sm="3" class="d-flex align-center justify-center justify-sm-end order-sm-third">
                        <div class="">
                            <v-btn color="primary" size="large">Edit Profile</v-btn>
                        </div>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col md="12" class="profile-one">
                        <v-tabs v-model="tab" color="primary" dark class="profiletab ">
                            <v-tab v-for="item in items" :key="item.tab" :to="item.href" class="text-grey100 mr-sm-3">
                                <component :is="item.icon" size="20" stroke-width="1.5"
                                    class="mr-sm-2 text-h6 text-grey100 icon">
                                </component>
                                <span class="d-sm-flex d-none">{{ item.tab }}</span>
                            </v-tab>
                        </v-tabs>
                    </v-col>
                </v-row>

            </v-card-item>
        </v-card>
    </div>
</template>
<style lang="scss">
.avatar-border {
    background-image: linear-gradient(rgb(80, 178, 252), rgb(244, 76, 102));
    border-radius: 50%;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;

    .userImage {
        border: 4px solid rgb(var(--v-theme-surface));
    }
}

.top-spacer {
    margin-top: -95px;
}

.profile-one {
    .profiletab .v-slide-group__content {
        justify-content: start;

        .v-btn--variant-text .v-btn__overlay {
            background: transparent;
        }
    }

    .v-btn{
        &.v-tab-item--selected{
            color: rgb(var(--v-theme-primary)) !important;
            .icon{
                color: rgb(var(--v-theme-primary)) !important;
            }
        }
    }
}

.profiletab{
    .v-btn{
        &.v-tab-item--selected{
            color: rgb(var(--v-theme-primary)) !important;
            .icon{
                color: rgb(var(--v-theme-primary)) !important;
            }
        }
    }
}

.plus {
    bottom: 0;
    right: 0;
    border: 2px solid #fff;
}

@media (max-width: 1023px) {
    .order-sm-second {
        order: 2;
    }

    .order-sml-first {
        order: 1;
    }

    .order-sm-third {
        order: 3;
    }

    .order-sm-last {
        order: 4;
    }
}</style>
