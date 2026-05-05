<template>
    <v-row>
        <v-col cols="12" md="6">
            <div class="mb-6">
                <v-label class="font-weight-medium mb-2" for="vitw">Twitter</v-label>
                <v-text-field color="primary" variant="outlined" id="vitw" type="text" placeholder="https://twitter.com/abc" hide-details />
            </div>
            <div class="mb-6">
                <v-label class="font-weight-medium mb-2" for="viggl">Google</v-label>
                <v-text-field color="primary" variant="outlined" id="viggl" type="text" placeholder="https://plus.google.com/abc" hide-details />
            </div>
            <div>
                <v-label class="font-weight-medium mb-2" for="viin">Instagram</v-label>
                <v-text-field color="primary" variant="outlined" id="viin" type="text" placeholder="https://instagram.com/abc" hide-details />
            </div>
        </v-col>
        <v-col cols="12" md="6">
            <div class="mb-6">
                <v-label class="font-weight-medium mb-2" for="vsfb1">Facebook</v-label>
                <v-text-field color="primary" variant="outlined" id="vsfb1" type="text" placeholder="https://facebook.com/abc" hide-details />
            </div>
            <div class="mb-6">
                <v-label class="font-weight-medium mb-2" for="vsln1">Linkedin</v-label>
                <v-text-field color="primary" variant="outlined" id="vsln1" type="text" placeholder="https://Linkedin.com/abc" hide-details />
            </div>
            <div>
                <v-label class="font-weight-medium mb-2" for="vsquora">Quora</v-label>
                <v-text-field color="primary" variant="outlined" id="vsquora" type="text" placeholder="https://Quora.com/abc" hide-details />
            </div>
        </v-col>
        <v-col cols="12" class="mb-2">
            <v-btn color="primary" rounded="pill">Submit</v-btn>
            <v-btn class="bg-lighterror text-error ml-4" rounded="pill">Cancel</v-btn>
        </v-col>
    </v-row>
</template>
