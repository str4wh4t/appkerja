<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { HeartIcon, PhotoIcon, UserCircleIcon, UsersIcon } from 'vue-tabler-icons';
import profileBg from '/images/backgrounds/profilebg.jpg';
import UserImage from '/images/profile/user6.jpg';

const tab = ref(null);
const items = shallowRef([
    { tab: 'Profile', icon: UserCircleIcon, href: '/apps/userprofile/two' },
    { tab: 'Followers', icon: HeartIcon, href: '/apps/userprofile/two/followers' },
    { tab: 'Friends', icon: UsersIcon, href: '/apps/userprofile/two/friends' },
    { tab: 'Gallery', icon: PhotoIcon, href: '/apps/userprofile/two/gallery' }
]);


</script>

<template>
    <v-card elevation="10" class="overflow-hidden" >
        <img :src="profileBg" alt="profile" class="w-100" />
        <div>
            <v-row class="mt-1">
                <v-col cols="12" lg="4" sm="12" class="order-sm-second">
                    <div class="px-4 py-1">
                        <v-row class="justify-center">
                            <v-col cols="4" class="text-center">
                                <FileDescriptionIcon size="20" class="text-grey100" />
                                <h4 class="text-h4 font-weight-semibold">938</h4>
                                <h6 class="text-h6 font-weight-medium text-grey100">Posts</h6>
                            </v-col>
                            <v-col cols="4" class="text-center">
                                <UserCircleIcon size="20" class="text-grey100" />
                                <h4 class="text-h4 font-weight-semibold">3,586</h4>
                                <h6 class="text-h6 font-weight-medium text-grey100">Followers</h6>
                            </v-col>
                            <v-col cols="4" class="text-center">
                                <UserCheckIcon size="20" class="text-grey100" />
                                <h4 class="text-h4 font-weight-semibold">2,659</h4>
                                <h6 class="text-h6 font-weight-medium text-grey100">Following</h6>
                            </v-col>
                        </v-row>
                    </div>
                </v-col>
                <v-col cols="12" lg="4" sm="12" class="d-flex justify-center order-sml-first">
                    <div class="text-center top-spacer">
                        <div class="avatar-border">
                            <v-avatar size="100" class="userImage">
                                <img :src="UserImage" width="100" alt="Mathew" />
                            </v-avatar>
                        </div>
                        <h5 class="text-h5 mt-3 font-weight-semibold">Mike Nielsen</h5>
                        <span class="text-h6 font-weight-regular">Designer</span>
                    </div>
                </v-col>
                <v-col cols="12" lg="4" class="d-flex align-center justify-center justify-lg-end order-sm-third text-sm-right text-center">
                    <div class="d-sm-flex align-center justify-sm-space-between justify-center px-sm-10 py-1 gap-3">
                        <div class="d-flex gap-3">
                        <v-btn icon variant="flat" size="x-small" color="primary" class="btn-brand-facebook"
                            ><BrandFacebookIcon size="16"
                        /></v-btn>
                        <v-btn icon variant="flat" size="x-small" color="info" class="btn-brand-twitter"
                            ><BrandTwitterIcon size="16"
                        /></v-btn>
                        <v-btn icon variant="flat" size="x-small" color="secondary" class="btn-brand-dribbble"
                            ><BrandDribbbleIcon size="16"
                        /></v-btn>
                        <v-btn icon variant="flat" size="x-small" color="error" class="btn-brand-youtube"
                            ><BrandYoutubeIcon size="16"
                        /></v-btn>
                        </div>
                        <v-btn  color="primary" class="px-6 mt-sm-0 mt-4" size="large">Add to Story</v-btn>
                    </div>
                </v-col>
                <v-col md="12" class="order-sm-last"> 
                    <v-tabs v-model="tab" color="primary" dark class="profiletab bg-lightinfo">
                        <v-tab v-for="item in items" :key="item.tab" :to="item.href" class="text-grey200">
                            <component :is="item.icon" size="18" stroke-width="1.5"
                                    class="mr-sm-2 text-h6 text-grey200 icon">
                                </component>
                                <span class="d-sm-flex d-none">{{ item.tab }}</span>
                        </v-tab>
                    </v-tabs>
                </v-col>
            </v-row>
        </div>
    </v-card>
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

.profiletab .v-slide-group__content {
    justify-content: end;
    .v-btn--variant-text .v-btn__overlay {
        background: transparent;
    }
}
.profiletab{
    .v-tab.v-tab{
        &.v-slide-group-item--active{
            color: rgb(var(--v-theme-primary)) !important;
            .icon{
                color: rgb(var(--v-theme-primary)) !important;
            }
        }
    }
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
}
</style>
