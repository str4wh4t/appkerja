<script setup lang="ts">
import logolight from '/images/logos/logo-light.svg';

</script>
<template>
    <div class="logo">
        <NuxtLink to="/">
            <img :src="logolight" alt="home" />
        </NuxtLink>
    </div>
</template>
