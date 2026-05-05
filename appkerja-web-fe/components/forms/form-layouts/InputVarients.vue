<script setup lang="ts"></script>
<template>
    <v-row>
        <v-col cols="12" lg="12">
            <v-label class="mb-2 font-weight-medium" for="si">Success Input</v-label>
            <v-text-field variant="outlined" placeholder="Success value" color="success" id="si"></v-text-field>
            <v-label class="mb-2 font-weight-medium" for="ei">Error Input</v-label>
            <v-text-field variant="outlined" color="error" id="ei"></v-text-field>
            <v-label class="mb-2 font-weight-medium" for="et">Input with Error text</v-label>
            <v-text-field variant="outlined" id="et" color="error" hint="Incorrect entry." persistent-hint></v-text-field>
        </v-col>
    </v-row>
</template>
