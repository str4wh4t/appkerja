<template>
    <v-card elevation="10" class="bg-lightprimary">
        <v-card-item class="">
            <img src="/images/svgs/info-shap.svg" alt="shape" class="shape">
            <v-avatar class="bg-info mb-8 " size="48">
                <img src="/images/svgs/idea.svg" height="24" width="24">
            </v-avatar>
            <div class="d-flex align-center justify-space-between mb-4">
                <h5 class="text-h6 font-weight-semibold">New Goals</h5>
                <div class="text-subtitle-1 text-primary font-weight-medium">83%</div>
            </div>
            <v-progress-linear model-value="70" height="7" color="primary" bg-color="lightprimary" rounded></v-progress-linear>
        </v-card-item>
    </v-card>
    <v-card elevation="10" class="mt-6">
        <v-card-item class="bg-lightwarning">
            <div class="d-flex justify-space-between">
                <v-avatar class="mb-8  bg-warning" size="68" rounded="xl">
                    <img src="/images/profile/user1.jpg" height="68" width="68">
                </v-avatar>
                <p class="text-subtitle-1 font-weight-semibold text-warning">#1 in DevOps</p>
            </div>
            
            <div class="">
                <h5 class="text-h6 font-weight-semibold">Adam Johnson</h5>
                <div class="text-subtitle-1 text-grey100 mt-1">Top Developer</div>
            </div>
        </v-card-item>
    </v-card>
</template>
<style scoped>
.shape {
    position: absolute;
    right: 0;
    top: 0px;
}
</style>