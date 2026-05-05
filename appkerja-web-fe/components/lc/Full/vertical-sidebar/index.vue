<script setup lang="ts">
import { onMounted, shallowRef } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import sidebarItems, { type menu } from './sidebarItem';
import {
  getCurrentUserPermissionCodes,
  hasPermission,
} from '@/services/graphql/user-permissions.service';
const customizer = useCustomizerStore();
const sidebarMenu = shallowRef<menu[]>([]);

const filterSidebarByPermissions = (
  items: menu[],
  permissionCodes: Set<string>,
): menu[] => {
  const filtered = items
    .map((item) => {
      if (item.header) return item;

      const children = item.children
        ? filterSidebarByPermissions(item.children, permissionCodes)
        : undefined;

      const allowedSelf = hasPermission(permissionCodes, item.requiredPermission);
      if (!allowedSelf) return null;

      if (item.children) {
        if (!children || children.length === 0) return null;
        return { ...item, children };
      }

      return item;
    })
    .filter((item): item is menu => item !== null);

  // Keep headers only when they still have at least one visible item after them.
  const withValidHeaders: menu[] = [];
  for (let i = 0; i < filtered.length; i += 1) {
    const current = filtered[i];
    if (!current.header) {
      withValidHeaders.push(current);
      continue;
    }

    let hasChildInSection = false;
    for (let j = i + 1; j < filtered.length; j += 1) {
      if (filtered[j].header) break;
      hasChildInSection = true;
      break;
    }
    if (hasChildInSection) withValidHeaders.push(current);
  }

  return withValidHeaders;
};

onMounted(async () => {
  try {
    const permissionCodes = await getCurrentUserPermissionCodes();
    sidebarMenu.value = filterSidebarByPermissions(sidebarItems, permissionCodes);
  } catch {
    // Keep UX usable if user profile query fails.
    sidebarMenu.value = filterSidebarByPermissions(sidebarItems, new Set<string>());
  }
});
</script>

<template>
    <v-navigation-drawer left v-model="customizer.Sidebar_drawer" elevation="10" rail-width="70" 
        app class="leftSidebar ms-lg-5 mt-sm-5 bg-containerBg" :rail="customizer.mini_sidebar" expand-on-hover width="270">
        <div class="pa-3 pl-3 pb-2">
            <LcFullLogo/>
        </div>
        <!-- ---------------------------------------------- -->
        <!---Navigation -->
        <!-- ---------------------------------------------- -->
        <perfect-scrollbar class="scrollnavbar bg-containerBg overflow-y-hidden">
            <v-list density="compact" class="py-2 px-2 bg-containerBg">
                <!---Menu Loop -->
                <template v-for="(item, i) in sidebarMenu" :key="'sidebar-' + i">
                    <!---Item Sub Header -->
                    <LcFullVerticalSidebarNavGroup :item="item" v-if="item.header" />
                    <!---If Has Child -->
                    <LcFullVerticalSidebarNavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
                    <!---Single Item-->
                    <LcFullVerticalSidebarNavItem :item="item" v-else class="leftPadding" />
                    <!---End Single Item-->
                </template>
                <!-- <Moreoption/> -->
            </v-list>
        </perfect-scrollbar>
    </v-navigation-drawer>
</template>
