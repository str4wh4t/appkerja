<template>
    <v-row >
        <v-col cols="12">
            <v-label class="font-weight-medium mb-2" for="vnm">Name</v-label>
            <VTextField  type="text" placeholder="John Deo" id="vnm" hide-details ></VTextField>
        </v-col>
        <v-col cols="12">
            <v-label class="font-weight-medium mb-2" for="vcnp">Company</v-label>
            <VTextField  type="text" placeholder="ACME Inc." id="vcnp" hide-details ></VTextField>
        </v-col>
        <v-col cols="12">
            <v-label class="font-weight-medium mb-2" for="veml">Email</v-label>
            <VTextField  type="email" placeholder="john.deo" id="veml" suffix="@example.com" hide-details ></VTextField>
        </v-col>
        <v-col cols="12">
            <v-label class="font-weight-medium mb-2" for="vph">Phone No</v-label>
            <VTextField  type="text" placeholder="412 2150 451" id="vph" hide-details ></VTextField>
        </v-col>
        <v-col cols="12">
            <v-label class="font-weight-medium mb-2" for="vmsg">Message</v-label>
             <VTextarea
                auto-grow
                placeholder="Hi, Do you  have a moment to talk Jeo ?"
                rows="2"
                color="primary"
                row-height="25"
                shaped
                hide-details
                id="vmsg"
            ></VTextarea>
        </v-col>
        <v-col cols="12" class="">
            <v-btn color="primary" rounded="pill">Send</v-btn>
        </v-col>
    </v-row>
</template>
