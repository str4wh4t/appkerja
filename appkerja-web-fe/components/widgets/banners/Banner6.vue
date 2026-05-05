<template>
    <v-card elevation="10" class=" mt-6">
        <v-card-item class="text-center">
            <h5 class="text-h5 mb-6 font-weight-semibold">Mutual Friend Revealed</h5>
            <v-badge content="1" color="error" offset-x="18" offset-y="18">
                <v-avatar size="140">
                    <img src="/images/profile/user1.jpg" height="140" alt="image" />
                </v-avatar>
            </v-badge>

            <h5 class="text-h5 pt-3 mt-3 font-weight-semibold">Tommoie Henderson</h5>
            <h6 class="text-subtitle-1 text-13 mt-2 mb-4 text-grey100">
                Accept the request and<br> type a message
            </h6>
            <div class="mb-2">
                <v-btn size="large" color="primary" rounded="pill">accept</v-btn>
                <v-btn size="large" variant="outlined" class="ml-4" color="error" rounded="pill">remove</v-btn>
            </div>
        </v-card-item>
    </v-card>
</template>
