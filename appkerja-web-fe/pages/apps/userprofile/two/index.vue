<script setup lang="ts">
import { ref } from 'vue';

// components
import ProfileBanner from '@/components/apps/user-profile/ProfileBanner.vue';
import IntroCard from '@/components/apps/user-profile/IntroCard.vue';
import PhotosCard from '@/components/apps/user-profile/PhotosCard.vue';
import PostListing from '@/components/apps/user-profile/PostListing.vue';
import AddPost from '@/components/apps/user-profile/posts/AddPost.vue';

</script>

<template>
    <ProfileBanner />
    <v-row class="mt-4">
        <v-col cols="12" lg="4" md="4">
            <IntroCard />
            <PhotosCard />
        </v-col>
        <v-col cols="12" lg="8" md="8">
            <AddPost />
            <PostListing />
        </v-col>
    </v-row>
</template>
