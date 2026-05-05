<script setup lang="ts">
import { ref, watch } from "vue";
import { useCustomizerStore } from "@/stores/customizer";
// import RtlLogo from '@/layouts/full/logo/RtlLogo.vue';
import Navigations from "@/components/landingpage/layout/Navigation.vue";
/*Mobile Sidebar*/
import MobileSidebar from "@/components/landingpage/layout/MobileSidebar.vue";
/*import tabler icons*/
import { Menu2Icon } from "vue-tabler-icons";
const appsdrawer = ref(false);
const customizer = useCustomizerStore();
</script>
<template>
  <div>
    <div>
      <!-- -----------------------------------------------
                            Start Header
                            ----------------------------------------------- -->
      <v-app-bar height="80" class="lp-header" flat>
        <v-container class="maxWidth py-sm-4 py-0">
          <v-toolbar class="d-flex align-center bg-surface">
            <div>
              <LcFullLogo />
            </div>
            <!-- Desktop view Navigation -->
            <div class="navigation d-lg-flex d-none ga-3">
              <Navigations />
            </div>
            <!-- Login  -->
            <v-btn
              class="custom-hover-primary bg-primary d-lg-flex d-none px-8 align-center login-shadow"
              rounded="pill"
              to="/auth/login"
              ><span class="text-white">Login</span></v-btn
            >
            <!-- Mobile Toggle Button -->
            <v-btn
              variant="text"
              class="hidden-lg-and-up"
              icon
              @click.stop="appsdrawer = !appsdrawer"
            >
              <Menu2Icon size="22" stroke-width="1.5" />
            </v-btn>
          </v-toolbar>
        </v-container>
      </v-app-bar>
      <!-- -----------------------------------------------
                            End Header
                            ----------------------------------------------- -->
    </div>

    <!----sidebar menu drawer start----->
    <v-navigation-drawer
      class="lp-drawer"
      v-model="appsdrawer"
      location="left"
      temporary
    >
      <MobileSidebar />
    </v-navigation-drawer>
  </div>
</template>
