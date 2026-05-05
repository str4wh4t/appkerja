<script setup lang="ts">
import { ref } from 'vue';
// common components
import BlogPosts from '@/components/apps/blog/blogPosts.vue';
</script>

<template>
    <!-- ---------------------------------------------------- -->
    <!-- Table Basic -->
    <!-- ---------------------------------------------------- -->
    <v-row>
        <v-col cols="12">
          <BlogPosts/>
        </v-col>
    </v-row>
</template>
