<script setup lang="ts">
import { ref } from 'vue';
// icons
import { LockIcon,UserIcon,MailIcon } from 'vue-tabler-icons';
const checkbox1 = ref(false);
</script>
<template>
    <v-label class="mb-2 font-weight-medium" for="runm">Username</v-label>
    <v-text-field
        variant="outlined"
        type="text"
        placeholder="Username"
        color="primary"
        id="runm"
    >  
        <template v-slot:append-inner>
            <UserIcon stroke-width="1.5" size="22"  class="text-medium-emphasis" />
        </template>
    </v-text-field>
    <v-label class="mb-2 font-weight-medium" for="reml">Email</v-label>
    <v-text-field
        variant="outlined"
        type="email"
        placeholder="Email"
        color="primary"
        id="reml"
    >  
        <template v-slot:append-inner>
            <MailIcon stroke-width="1.5" size="22"  class="text-medium-emphasis" />
        </template>
    </v-text-field>
    <v-label class="mb-2 font-weight-medium" for="rpwd">Password</v-label>
    <v-text-field
        variant="outlined"
        type="password"
        placeholder="Password"
        color="primary"
        id="rpwd"
    >  
        <template v-slot:append-inner>
            <LockIcon stroke-width="1.5" size="22" class="text-medium-emphasis" />
        </template>
    </v-text-field>
    <v-label class="mb-2 font-weight-medium" for="crpwd">Confirm Password</v-label>
    <v-text-field
        variant="outlined"
        type="password"
        color="primary"
        hide-details
        placeholder="Confirm Password"
        id="crpwd"
    >
        <template v-slot:append-inner>
            <LockIcon stroke-width="1.5" size="22"  class="text-medium-emphasis"  />
        </template>
    </v-text-field>
     <div class="my-3">
        <v-checkbox density="compact" v-model="checkbox1" hide-details color="primary" label="Check Me Out!"></v-checkbox>
    </div>
    <v-btn color="primary" class="mr-3" rounded="pill">Submit</v-btn>
    <v-btn color="error" class="mr-3" rounded="pill">Cancel</v-btn>
</template>
