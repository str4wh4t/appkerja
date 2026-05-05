<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getUserMe } from "@/services/graphql/auth.service";
import { getPermissionsFindAll, type PermissionRow } from "@/services/graphql/permissions.service";
import { assignRolePermissions, getRoleById, getRoles } from "@/services/graphql/roles.service";

/** Matches backend `SUPERADMIN_ROLE_CODE`. */
const SUPERADMIN_ROLE_CODE = "superadmin";

definePageMeta({
  middleware: ["auth"],
});

type RoleRow = {
  id?: number;
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
};

const isLoading = ref(false);
const isSuperAdmin = ref(false);
const errorMessage = ref("");
const rows = ref<RoleRow[]>([]);
/** Plain table headers: sorting disabled (`rolesFindAll` is not paginated). */
const headers = ref([
  { title: "ID", key: "id", sortable: false },
  { title: "Code", key: "code", sortable: false },
  { title: "Name", key: "name", sortable: false },
  { title: "Description", key: "description", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Actions", key: "actions", sortable: false, align: "center" as const },
]);

const assignDialog = ref(false);
const assignLoading = ref(false);
const assignSaving = ref(false);
const assignLoadError = ref("");
const assignSaveError = ref("");
const selectedRole = ref<RoleRow | null>(null);
const allPermissions = ref<PermissionRow[]>([]);
const selectedIds = ref<number[]>([]);
const assignTab = ref<"resources" | "pages" | "widgets" | "other">("resources");
const successSnackbar = ref(false);
const successMessage = ref("");

const ACTION_ORDER = ["create", "read", "update", "delete", "restore"];

const isPagePermission = (p: PermissionRow) =>
  p.resource === "pages" || /^page[_-]/i.test(p.resource);

const isWidgetPermission = (p: PermissionRow) => /widget/i.test(p.resource);

const isOtherPermission = (p: PermissionRow) =>
  p.action === "impersonate" || p.code.includes(".impersonate");

const actionSortIndex = (action: string) => {
  const i = ACTION_ORDER.indexOf(action);
  return i >= 0 ? i : 100 + action.localeCompare("");
};

/** Count of distinct resources per tab (not permission row count). */
const countDistinctResources = (predicate: (p: PermissionRow) => boolean) => {
  const keys = new Set<string>();
  for (const p of allPermissions.value) {
    if (predicate(p)) keys.add(p.resource);
  }
  return keys.size;
};

const tabCounts = computed(() => {
  const inResources = (p: PermissionRow) =>
    !isPagePermission(p) && !isWidgetPermission(p) && !isOtherPermission(p);
  return {
    resources: countDistinctResources(inResources),
    pages: countDistinctResources(isPagePermission),
    widgets: countDistinctResources(isWidgetPermission),
    other: countDistinctResources(isOtherPermission),
  };
});

const permissionsForActiveTab = computed(() => {
  const all = allPermissions.value;
  if (assignTab.value === "pages") return all.filter(isPagePermission);
  if (assignTab.value === "widgets") return all.filter(isWidgetPermission);
  if (assignTab.value === "other") return all.filter(isOtherPermission);
  return all.filter(
    (p) => !isPagePermission(p) && !isWidgetPermission(p) && !isOtherPermission(p),
  );
});

const groupedByResource = computed(() => {
  const map = new Map<string, PermissionRow[]>();
  for (const p of permissionsForActiveTab.value) {
    const list = map.get(p.resource) ?? [];
    list.push(p);
    map.set(p.resource, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => actionSortIndex(a.action) - actionSortIndex(b.action));
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
});

const resourceTitle = (resource: string) =>
  resource
    .split(/[_-]/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const actionLabel = (action: string) =>
  action
    .split(/[_-]/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const isSelected = (id: number) => selectedIds.value.includes(id);

const togglePermission = (id: number, checked: boolean | null) => {
  const on = Boolean(checked);
  const set = new Set(selectedIds.value);
  if (on) set.add(id);
  else set.delete(id);
  selectedIds.value = [...set];
};

const allIdsForResource = (list: PermissionRow[]) => list.map((p) => p.id);

const allSelectedForResource = (list: PermissionRow[]) => {
  const ids = allIdsForResource(list);
  return ids.length > 0 && ids.every((id) => selectedIds.value.includes(id));
};

const toggleSelectAllResource = (list: PermissionRow[]) => {
  const ids = allIdsForResource(list);
  const allOn = allSelectedForResource(list);
  const set = new Set(selectedIds.value);
  if (allOn) {
    for (const id of ids) set.delete(id);
  } else {
    for (const id of ids) set.add(id);
  }
  selectedIds.value = [...set];
};

const loadRoles = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await getRoles();
    rows.value = response.data?.rolesFindAll ?? [];
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load roles.";
  } finally {
    isLoading.value = false;
  }
};

const openAssignDialog = async (row: RoleRow) => {
  const id = Number(row.id);
  if (!Number.isFinite(id)) return;
  selectedRole.value = row;
  assignDialog.value = true;
  assignLoading.value = true;
  assignLoadError.value = "";
  assignSaveError.value = "";
  allPermissions.value = [];
  selectedIds.value = [];
  assignTab.value = "resources";
  try {
    const [permRes, roleRes] = await Promise.all([
      getPermissionsFindAll(),
      getRoleById(id),
    ]);
    allPermissions.value = (permRes.data?.permissionsFindAll ?? []) as PermissionRow[];
    const detail = roleRes.data?.rolesFindOne;
    if (!detail) {
      throw new Error("Role not found.");
    }
    selectedRole.value = { ...row, ...detail };
    selectedIds.value = [
      ...new Set(
        (detail.permissions ?? [])
          .map((p) => p.id)
          .filter((id): id is number => typeof id === "number"),
      ),
    ];
  } catch (error: any) {
    assignLoadError.value = error?.message || "Failed to load permissions.";
  } finally {
    assignLoading.value = false;
  }
};

const closeAssignDialog = () => {
  assignDialog.value = false;
  selectedRole.value = null;
  assignLoadError.value = "";
  assignSaveError.value = "";
};

const saveAssignPermissions = async () => {
  const id = Number(selectedRole.value?.id);
  if (!Number.isFinite(id)) return;
  assignSaving.value = true;
  assignSaveError.value = "";
  try {
    const res = await assignRolePermissions(id, selectedIds.value);
    if (!res.data?.rolesAssignPermissions?.id) {
      throw new Error("Failed to save role permissions.");
    }
    successMessage.value = "Role permissions have been updated.";
    successSnackbar.value = true;
    closeAssignDialog();
    await loadRoles();
  } catch (error: any) {
    assignSaveError.value = error?.message || "Failed to save permissions.";
  } finally {
    assignSaving.value = false;
  }
};

onMounted(async () => {
  try {
    const me = await getUserMe();
    const codes = (me.data?.usersMe?.roles ?? []).map((r) =>
      String(r?.code ?? "").toLowerCase(),
    );
    /** Same as backend: membership in `superadmin` role, not `activeRoleCode` (UI context). */
    isSuperAdmin.value = codes.includes(SUPERADMIN_ROLE_CODE);
  } catch {
    isSuperAdmin.value = false;
  }
  await loadRoles();
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="10">
        <v-card-text class="py-6 px-6">
          <h3 class="text-h4 font-weight-bold mb-2">Roles</h3>
          <p class="text-subtitle-1 text-medium-emphasis mb-4">
            Global roles list.
            <template v-if="isSuperAdmin">
              Manage permissions per role via Assign permissions (superadmin only).
            </template>
            <template v-else>
              Role permissions can only be managed when your active membership includes superadmin.
            </template>
          </p>

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>

          <v-data-table
            class="border rounded-md crud-tbl"
            :headers="headers"
            :items="rows"
            :loading="isLoading"
            item-value="id"
            hide-default-footer
            disable-sort
          >
            <template #item.description="{ item }">
              {{ item.description || "-" }}
            </template>
            <template #item.status="{ item }">
              <span
                class="font-weight-medium"
                :class="{
                  'text-success': Boolean(item.isActive),
                }"
              >
                {{ item.isActive ? "Active" : "Inactive" }}
              </span>
            </template>
            <template #item.actions="{ item }">
              <div class="d-flex align-center justify-center">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  :disabled="!item.id || !isSuperAdmin"
                  :title="isSuperAdmin ? 'Assign permissions' : 'Only users with the superadmin role'"
                  @click="openAssignDialog(item as RoleRow)"
                >
                  <v-icon size="20">mdi-account-details</v-icon>
                </v-btn>
              </div>
            </template>
            <template #no-data>
              <div class="text-medium-emphasis py-4">No roles to display.</div>
            </template>
          </v-data-table>

          <v-snackbar
            v-model="successSnackbar"
            location="top right"
            color="success"
            rounded="pill"
            timeout="2500"
          >
            <div class="d-flex align-center ga-2">
              <v-icon size="18">mdi-check-circle-outline</v-icon>
              <span>{{ successMessage }}</span>
            </div>
          </v-snackbar>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <v-dialog
    v-model="assignDialog"
    max-width="1120"
    scrollable
    @update:model-value="(v: boolean) => !v && closeAssignDialog()"
  >
    <v-card rounded="lg">
      <v-card-title
        class="d-flex align-center justify-space-between border-b py-4 px-6 bg-primary text-white"
      >
        <div>
          <div class="text-h6 font-weight-semibold text-white">Assign permissions</div>
          <div v-if="selectedRole" class="text-body-2" style="opacity: 0.9">
            {{ selectedRole.name }} ({{ selectedRole.code }})
          </div>
        </div>
        <v-btn icon variant="text" color="white" density="compact" @click="closeAssignDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-0">
        <v-progress-linear v-if="assignLoading" indeterminate color="primary" />
        <v-alert v-if="assignLoadError" type="error" variant="tonal" class="ma-4">
          {{ assignLoadError }}
        </v-alert>
        <v-alert v-if="assignSaveError" type="error" variant="tonal" class="ma-4">
          {{ assignSaveError }}
        </v-alert>

        <template v-if="!assignLoading && !assignLoadError">
          <!-- Same tab chrome as `pages/account/profile/index.vue`: transparent bar, fixed height, divider, padded window -->
          <v-tabs
            v-model="assignTab"
            bg-color="transparent"
            min-height="70"
            height="70"
            color="primary"
          >
            <v-tab value="resources" class="text-none">
              <v-icon class="mr-2" size="20">mdi-folder-outline</v-icon>
              Resources ({{ tabCounts.resources }})
            </v-tab>
            <v-tab value="pages" class="text-none">
              <v-icon class="mr-2" size="20">mdi-file-document-outline</v-icon>
              Pages ({{ tabCounts.pages }})
            </v-tab>
            <v-tab value="widgets" class="text-none">
              <v-icon class="mr-2" size="20">mdi-widgets-outline</v-icon>
              Widgets ({{ tabCounts.widgets }})
            </v-tab>
            <v-tab value="other" class="text-none">
              <v-icon class="mr-2" size="20">mdi-shield-account-outline</v-icon>
              Other permissions ({{ tabCounts.other }})
            </v-tab>
          </v-tabs>
          <v-divider />

          <div class="pa-sm-6 pa-4 pb-sm-6 pb-6">
            <v-window v-model="assignTab">
            <v-window-item value="resources">
              <div v-if="groupedByResource.length === 0" class="text-medium-emphasis py-8 text-center">
                No permissions in this category.
              </div>
              <v-row v-else dense>
                <v-col v-for="[resKey, perms] in groupedByResource" :key="resKey" cols="12" md="6">
                  <v-sheet border rounded="lg" class="h-100 d-flex flex-column overflow-hidden">
                    <div class="px-4 py-3 bg-surface border-b">
                      <div class="text-subtitle-1 font-weight-semibold text-truncate">
                        {{ resourceTitle(resKey) }}
                      </div>
                    </div>
                    <div class="px-4 py-3 flex-grow-1">
                      <button
                        type="button"
                        class="text-primary text-body-2 font-weight-medium mb-3 text-decoration-underline bg-transparent border-0 pa-0 cursor-pointer"
                        @click="toggleSelectAllResource(perms)"
                      >
                        {{ allSelectedForResource(perms) ? "Clear all" : "Select all" }}
                      </button>
                      <v-row dense>
                        <v-col v-for="p in perms" :key="p.id" cols="12" sm="6" md="4">
                          <v-checkbox
                            density="compact"
                            hide-details
                            color="primary"
                            :model-value="isSelected(p.id)"
                            :label="actionLabel(p.action)"
                            @update:model-value="(v) => togglePermission(p.id, v as boolean)"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item value="pages">
              <div v-if="groupedByResource.length === 0" class="text-medium-emphasis py-8 text-center">
                No page-type permissions yet.
              </div>
              <v-row v-else dense>
                <v-col v-for="[resKey, perms] in groupedByResource" :key="resKey" cols="12" md="6">
                  <v-sheet border rounded="lg" class="h-100 d-flex flex-column overflow-hidden">
                    <div class="px-4 py-3 bg-surface border-b">
                      <div class="text-subtitle-1 font-weight-semibold">{{ resourceTitle(resKey) }}</div>
                    </div>
                    <div class="px-4 py-3">
                      <button
                        type="button"
                        class="text-primary text-body-2 font-weight-medium mb-3 text-decoration-underline bg-transparent border-0 pa-0 cursor-pointer"
                        @click="toggleSelectAllResource(perms)"
                      >
                        {{ allSelectedForResource(perms) ? "Clear all" : "Select all" }}
                      </button>
                      <v-row dense>
                        <v-col v-for="p in perms" :key="p.id" cols="12" sm="6" md="4">
                          <v-checkbox
                            density="compact"
                            hide-details
                            color="primary"
                            :model-value="isSelected(p.id)"
                            :label="actionLabel(p.action)"
                            @update:model-value="(v) => togglePermission(p.id, v as boolean)"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item value="widgets">
              <div v-if="groupedByResource.length === 0" class="text-medium-emphasis py-8 text-center">
                No widget permissions yet.
              </div>
              <v-row v-else dense>
                <v-col v-for="[resKey, perms] in groupedByResource" :key="resKey" cols="12" md="6">
                  <v-sheet border rounded="lg" class="h-100 d-flex flex-column overflow-hidden">
                    <div class="px-4 py-3 bg-surface border-b">
                      <div class="text-subtitle-1 font-weight-semibold">{{ resourceTitle(resKey) }}</div>
                    </div>
                    <div class="px-4 py-3">
                      <button
                        type="button"
                        class="text-primary text-body-2 font-weight-medium mb-3 text-decoration-underline bg-transparent border-0 pa-0 cursor-pointer"
                        @click="toggleSelectAllResource(perms)"
                      >
                        {{ allSelectedForResource(perms) ? "Clear all" : "Select all" }}
                      </button>
                      <v-row dense>
                        <v-col v-for="p in perms" :key="p.id" cols="12" sm="6" md="4">
                          <v-checkbox
                            density="compact"
                            hide-details
                            color="primary"
                            :model-value="isSelected(p.id)"
                            :label="actionLabel(p.action)"
                            @update:model-value="(v) => togglePermission(p.id, v as boolean)"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-window-item>

            <v-window-item value="other">
              <div v-if="groupedByResource.length === 0" class="text-medium-emphasis py-8 text-center">
                No additional permissions.
              </div>
              <v-row v-else dense>
                <v-col v-for="[resKey, perms] in groupedByResource" :key="resKey" cols="12" md="6">
                  <v-sheet border rounded="lg" class="h-100 d-flex flex-column overflow-hidden">
                    <div class="px-4 py-3 bg-surface border-b">
                      <div class="text-subtitle-1 font-weight-semibold">{{ resourceTitle(resKey) }}</div>
                    </div>
                    <div class="px-4 py-3">
                      <button
                        type="button"
                        class="text-primary text-body-2 font-weight-medium mb-3 text-decoration-underline bg-transparent border-0 pa-0 cursor-pointer"
                        @click="toggleSelectAllResource(perms)"
                      >
                        {{ allSelectedForResource(perms) ? "Clear all" : "Select all" }}
                      </button>
                      <v-row dense>
                        <v-col v-for="p in perms" :key="p.id" cols="12" sm="6" md="4">
                          <v-checkbox
                            density="compact"
                            hide-details
                            color="primary"
                            :model-value="isSelected(p.id)"
                            :label="p.name"
                            @update:model-value="(v) => togglePermission(p.id, v as boolean)"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
          </div>
        </template>
      </v-card-text>

      <v-card-actions class="pa-5 border-t">
        <v-spacer />
        <v-btn
          color="success"
          variant="tonal"
          class="px-4 rounded-pill"
          :loading="assignSaving"
          :disabled="assignLoading || !!assignLoadError"
          @click="saveAssignPermissions"
        >
          Save
        </v-btn>
        <v-btn
          color="secondary"
          variant="tonal"
          class="px-4 rounded-pill"
          :disabled="assignSaving"
          @click="closeAssignDialog"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
