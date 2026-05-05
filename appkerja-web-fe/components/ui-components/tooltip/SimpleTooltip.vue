<template>
    <div class="d-flex flex-column flex-sm-row gap-3 justify-center">
        <v-btn  color="primary" class="px-4 rounded-pill">
            Start
            <v-tooltip activator="parent" location="start">Tooltip</v-tooltip>
        </v-btn>
        <v-btn  color="primary" class="px-4 rounded-pill">
            End
            <v-tooltip activator="parent" location="end">Tooltip</v-tooltip>
        </v-btn>
        <v-btn  color="primary" class="px-4 rounded-pill">
            Top
            <v-tooltip activator="parent" location="top">Tooltip</v-tooltip>
        </v-btn>
        <v-btn  color="primary" class="px-4 rounded-pill">
            Bottom
            <v-tooltip activator="parent" location="bottom">Tooltip</v-tooltip>
        </v-btn>
    </div>
</template>
