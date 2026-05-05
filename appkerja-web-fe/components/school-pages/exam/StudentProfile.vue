<template>
    <v-card elevation="10">
        <v-card-text>
            <div class="d-flex justify-center text-center">
                <div>
                    <v-avatar class="rounded-xl" size="110">
                        <img src="/images/profile/user2.jpg" height="110" width="110">
                    </v-avatar>
                    <h5 class="text-h5 mt-3 mb-1">Violet Mendoza</h5>
                    <v-chip size="small" color="primary">
                        Student
                    </v-chip>
                </div>
            </div>
            <div class="d-flex justify-space-between mt-12">
                <div class="d-flex align-items-center">
                    <v-avatar class="bg-lightsuccess" size="50">
                        <CheckIcon class="text-success" stroke-width="1.5" size="24" col />
                    </v-avatar>
                    <div class="ms-3">
                        <p class="text-h5 mb-1">1.23k</p>
                        <p class="text-subtitle-1 text-grey100">Tasks Done</p>
                    </div>
                </div>

                <div class="d-flex align-items-center">
                    <v-avatar class="bg-lightsuccess" size="50">
                        <CpuIcon class="text-success" stroke-width="1.5" size="24" col />
                    </v-avatar>

                    <div class="ms-3">
                        <p class="text-h5 mb-1">568</p>
                        <p class="text-subtitle-1 text-grey100">Projects Done</p>
                    </div>
                </div>
            </div>

            <div class="mt-12">
                <div class="pb-1 mb-2 border-bottom pb-3">
                    <h6 class="text-subtitle-1 font-weight-semibold">Details</h6>
                </div>

                <div>
                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Name:
                            <span class="text-subtitle-1 text-grey100 ms-1">Violet Mendoza</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Class:
                            <span class="text-subtitle-1 text-grey100 ms-1">12</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Section:
                            <span class="text-subtitle-1 text-grey100 ms-1">B</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Date Of Birth:
                            <span class="text-subtitle-1 text-grey100 ms-1">12/12/2002</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Parents :
                            <span class="text-subtitle-1 text-grey100 ms-1">Joshi David</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Phone:
                            <span class="text-subtitle-1 text-grey100 ms-1">+ 123 9988568</span>
                        </p>
                    </div>

                    <div class="py-3">
                        <p class="text-subtitle-1 font-weight-semibold mb-0">
                            Email:
                            <span class="text-subtitle-1 text-grey100 ms-1">davidzonar@gmail.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>