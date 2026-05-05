<script setup lang="ts">
import { ref } from 'vue';
// icons
import { LockIcon, UserIcon, MailIcon } from 'vue-tabler-icons';
const checkbox1 = ref(false);
</script>
<template>
    <v-label class="mb-2 font-weight-medium" for="lunm">Username</v-label>
    <v-text-field variant="outlined" type="text" id="lunm" placeholder="Username" color="primary">
        <template v-slot:prepend-inner>
            <UserIcon stroke-width="1.5" size="22" class="text-medium-emphasis" />
        </template>
    </v-text-field>
    <v-label class="mb-2 font-weight-medium" for="lmail">Email</v-label>
    <v-text-field variant="outlined" type="email" id="lmail" placeholder="Email" color="primary">
        <template v-slot:prepend-inner>
            <MailIcon stroke-width="1.5" size="22" class="text-medium-emphasis" />
        </template>
    </v-text-field>
    <v-label class="mb-2 font-weight-medium" for="lpwd">Password</v-label>
    <v-text-field variant="outlined" type="password" id="lpwd" placeholder="Password" color="primary">
        <template v-slot:prepend-inner>
            <LockIcon stroke-width="1.5" size="22" class="text-medium-emphasis" />
        </template>
    </v-text-field>
    <v-label class="mb-2 font-weight-medium" for="lcpwd">Confirm Password</v-label>
    <v-text-field variant="outlined" type="password" id="lcpwd"  color="primary" hide-details placeholder="Confirm Password">
        <template v-slot:prepend-inner>
            <LockIcon stroke-width="1.5" size="22" class="text-medium-emphasis" />
        </template>
    </v-text-field>
    <div class="my-3">
        <v-checkbox density="compact" v-model="checkbox1" hide-details color="primary" label="Check Me Out!"></v-checkbox>
    </div>
    <v-btn color="primary" class="mr-3" rounded="pill">Submit</v-btn>
    <v-btn color="error" class="mr-3" rounded="pill">Cancel</v-btn>
</template>
