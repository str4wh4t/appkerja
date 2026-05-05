<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  createUserRoleScope,
  getUserRoleScopeById,
  getUserRoleScopesPaginated,
  removeUserRoleScopeById,
  updateUserRoleScopeById,
  type UserRoleScopeRow,
} from "@/services/graphql/user-role-scopes.service";
import { getUserRolesPaginated, type UserRoleRow } from "@/services/graphql/user-roles.service";
import { getUnitsPaginated, type UnitRow } from "@/services/graphql/units.service";
import {
  getCurrentUserPermissionCodes,
  hasAnyPermission,
  hasPermission,
} from "@/services/graphql/user-permissions.service";

definePageMeta({
  middleware: ["auth"],
});

const SCOPE_UNITS = "units";

/** Backend caps pagination `limit` at 100; fetch all pages for selects. */
const SELECT_PAGE_SIZE = 100;

const scopeTypeOptions = [{ title: "Units", value: SCOPE_UNITS }];

function formatUserDisplay(user?: UserRoleRow["user"]): string {
  if (!user) return "—";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  const fn = user.fullname?.trim();
  if (fn) return fn;
  return user.username?.trim() || "—";
}

function pairLabelFromUserRole(ur?: UserRoleRow | null): string {
  if (!ur) return "—";
  const u = formatUserDisplay(ur.user ?? undefined);
  const r = ur.role?.name?.trim() || ur.role?.code?.trim() || "Role";
  return `${u} — ${r}`;
}

const isLoading = ref(false);
const errorMessage = ref("");
const rows = ref<UserRoleScopeRow[]>([]);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const tableSearch = ref("");
const sortBy = ref("id");
const descending = ref(true);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const actionLoading = ref(false);
const scopeFormError = ref("");
const successSnackbar = ref(false);
const successMessage = ref("");
const errorSnackbar = ref(false);
const errorSnackTitle = ref("");
const errorSnackDescription = ref("");

const showErrorSnack = (title: string, description?: string | null) => {
  errorSnackTitle.value = (title || "Something went wrong").trim();
  errorSnackDescription.value = String(description ?? "").trim();
  errorSnackbar.value = true;
};

const userRolesList = ref<UserRoleRow[]>([]);
const unitsList = ref<UnitRow[]>([]);
const unitLabelById = computed(() => {
  const m: Record<string, string> = {};
  for (const u of unitsList.value) {
    if (u?.id) {
      m[String(u.id)] = `${u.code} — ${u.name}`;
    }
  }
  return m;
});

const userRoleSelectItems = computed(() =>
  userRolesList.value.map((ur) => ({
    title: pairLabelFromUserRole(ur),
    value: ur.id,
  })),
);

const unitSelectItems = computed(() =>
  unitsList.value.map((u) => ({
    title: `${u.code} — ${u.name}`,
    value: String(u.id),
  })),
);

const createDialog = ref(false);
const viewDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);
const selectedScope = ref<UserRoleScopeRow | null>(null);
const permissionCodes = ref<Set<string>>(new Set());
const canCreate = computed(() =>
  hasPermission(permissionCodes.value, "user_role_scopes.create"),
);
const canUpdate = computed(() =>
  hasPermission(permissionCodes.value, "user_role_scopes.update"),
);
const canDelete = computed(() =>
  hasPermission(permissionCodes.value, "user_role_scopes.delete"),
);
const hasAnyAction = computed(() =>
  hasAnyPermission(permissionCodes.value, [
    "user_role_scopes.read",
    "user_role_scopes.update",
    "user_role_scopes.delete",
  ]),
);

const createScopeFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const editScopeFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const createForm = ref({
  userRoleId: null as number | null,
  scopeType: SCOPE_UNITS,
  scopeId: "" as string,
});

const editForm = ref({
  userRoleId: null as number | null,
  scopeType: SCOPE_UNITS,
  scopeId: "" as string,
});

const userRoleIdRules = [
  (v: unknown) =>
    (v !== null && v !== undefined && Number(v) > 0) || "Select a user — role pair",
];

const scopeTypeRules = [
  (v: string) => !!String(v || "").trim() || "Scope type is required",
];

const scopeIdRules = computed(() => [
  (v: string) => {
    if (createForm.value.scopeType === SCOPE_UNITS) {
      return !!String(v || "").trim() || "Select a unit";
    }
    return true;
  },
]);

const scopeIdRulesEdit = computed(() => [
  (v: string) => {
    if (editForm.value.scopeType === SCOPE_UNITS) {
      return !!String(v || "").trim() || "Select a unit";
    }
    return true;
  },
]);

const headers = ref([
  { title: "User — Role", key: "pairLabel", sortable: false },
  { title: "Scope type", key: "scopeType" },
  { title: "Scope", key: "scopeLabel", sortable: false },
  { title: "Created", key: "createdAt" },
  { title: "Actions", key: "actions", sortable: false, align: "center" as const },
]);

const tableRows = computed(() =>
  rows.value.map((row) => ({
    ...row,
    pairLabel: pairLabelFromUserRole(row.userRole),
    scopeLabel: String(row.scope || row.scopeId || "—"),
  })),
);

const loadScopes = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getUserRoleScopesPaginated(
      page.value,
      limit.value,
      String(tableSearch.value || "").trim(),
      sortBy.value,
      descending.value,
    );
    const payload = res.data?.userRoleScopesFindAllPaginated;
    rows.value = payload?.data ?? [];
    total.value = payload?.total ?? 0;
  } catch (error: unknown) {
    const msg =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : "Failed to load user role scopes.";
    errorMessage.value = msg;
  } finally {
    isLoading.value = false;
  }
};

const loadUserRolesForSelect = async () => {
  try {
    const all: UserRoleRow[] = [];
    let pageNum = 1;
    for (;;) {
      const res = await getUserRolesPaginated(pageNum, SELECT_PAGE_SIZE, undefined, "id", false);
      const p = res.data?.userRolesFindAllPaginated;
      if (!p?.data?.length) break;
      all.push(...p.data);
      if (!p.hasNextPage) break;
      pageNum += 1;
    }
    userRolesList.value = all;
  } catch (error: unknown) {
    showErrorSnack(
      "Failed to load user–role list",
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : "",
    );
  }
};

const loadUnitsForSelect = async () => {
  try {
    const all: UnitRow[] = [];
    let pageNum = 1;
    for (;;) {
      const res = await getUnitsPaginated(
        pageNum,
        SELECT_PAGE_SIZE,
        undefined,
        "code",
        true,
        false,
      );
      const p = res.data?.unitsFindAllPaginated;
      if (!p?.data?.length) break;
      all.push(...p.data);
      if (!p.hasNextPage) break;
      pageNum += 1;
    }
    unitsList.value = all;
  } catch (error: unknown) {
    showErrorSnack(
      "Failed to load units",
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : "",
    );
  }
};

const triggerServerSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(async () => {
    page.value = 1;
    await loadScopes();
  }, 350);
};

const onTableOptionsUpdate = async (options: {
  page: number;
  itemsPerPage: number;
  sortBy?: Array<{ key: string; order?: "asc" | "desc" }>;
}) => {
  let shouldReload = false;

  const nextPage = Number(options.page || 1);
  if (nextPage !== page.value) {
    page.value = nextPage;
    shouldReload = true;
  }

  const nextLimit = Number(options.itemsPerPage || limit.value);
  if (nextLimit !== limit.value) {
    limit.value = nextLimit;
    page.value = 1;
    shouldReload = true;
  }

  const firstSort = options.sortBy?.[0];
  const nextSortBy = firstSort?.key || "id";
  const nextDescending = firstSort?.order === "desc";
  if (nextSortBy !== sortBy.value || nextDescending !== descending.value) {
    sortBy.value = nextSortBy;
    descending.value = nextDescending;
    shouldReload = true;
  }

  if (shouldReload) {
    await loadScopes();
  }
};

const openCreateDialog = async () => {
  scopeFormError.value = "";
  createForm.value = {
    userRoleId: null,
    scopeType: SCOPE_UNITS,
    scopeId: "",
  };
  createDialog.value = true;
  await Promise.all([loadUserRolesForSelect(), loadUnitsForSelect()]);
};

watch(
  () => createForm.value.scopeType,
  () => {
    createForm.value.scopeId = "";
  },
);

watch(
  () => editForm.value.scopeType,
  () => {
    editForm.value.scopeId = "";
  },
);

const handleView = (row: UserRoleScopeRow) => {
  selectedScope.value = row;
  viewDialog.value = true;
};

const handleEdit = async (id: number) => {
  scopeFormError.value = "";
  actionLoading.value = true;
  try {
    await Promise.all([loadUserRolesForSelect(), loadUnitsForSelect()]);
    const res = await getUserRoleScopeById(id);
    const detail = res.data?.userRoleScopesFindOne;
    if (!detail) {
      throw new Error("Record not found.");
    }
    selectedScope.value = detail;
    editForm.value = {
      userRoleId: detail.userRoleId,
      scopeType: detail.scopeType || SCOPE_UNITS,
      scopeId:
        detail.scopeType === SCOPE_UNITS ? String(detail.scopeId) : String(detail.scopeId ?? ""),
    };
    editDialog.value = true;
  } catch (error: unknown) {
    showErrorSnack(
      "Failed to load record",
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : "",
    );
  } finally {
    actionLoading.value = false;
  }
};

const handleDeleteOpen = (row: UserRoleScopeRow) => {
  selectedScope.value = row;
  deleteDialog.value = true;
};

const submitCreate = async () => {
  scopeFormError.value = "";
  const form = createScopeFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) return;
  }
  const uid = createForm.value.userRoleId;
  if (!uid) {
    scopeFormError.value = "Select a user — role pair.";
    return;
  }
  actionLoading.value = true;
  try {
    await createUserRoleScope({
      userRoleId: uid,
      scopeType: createForm.value.scopeType.trim(),
      scopeId: createForm.value.scopeId.trim(),
    });
    createDialog.value = false;
    successMessage.value = "User role scope has been created.";
    successSnackbar.value = true;
    await loadScopes();
  } catch (error: unknown) {
    scopeFormError.value =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : "Failed to create.";
  } finally {
    actionLoading.value = false;
  }
};

const submitEdit = async () => {
  if (!selectedScope.value?.id) return;
  scopeFormError.value = "";
  const form = editScopeFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) return;
  }
  const uid = editForm.value.userRoleId;
  if (!uid) {
    scopeFormError.value = "Select a user — role pair.";
    return;
  }
  actionLoading.value = true;
  try {
    await updateUserRoleScopeById(selectedScope.value.id, {
      userRoleId: uid,
      scopeType: editForm.value.scopeType.trim(),
      scopeId: editForm.value.scopeId.trim(),
    });
    editDialog.value = false;
    successMessage.value = "User role scope has been updated.";
    successSnackbar.value = true;
    await loadScopes();
  } catch (error: unknown) {
    scopeFormError.value =
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : "Failed to save.";
  } finally {
    actionLoading.value = false;
  }
};

const confirmDelete = async () => {
  if (!selectedScope.value?.id) return;
  actionLoading.value = true;
  try {
    const res = await removeUserRoleScopeById(selectedScope.value.id);
    if (!res.data?.userRoleScopesRemove) {
      throw new Error("Failed to remove.");
    }
    deleteDialog.value = false;
    successMessage.value = "User role scope has been removed.";
    successSnackbar.value = true;
    await loadScopes();
  } catch (error: unknown) {
    showErrorSnack(
      "Failed to remove",
      error && typeof error === "object" && "message" in error
        ? String((error as { message?: string }).message)
        : "",
    );
  } finally {
    actionLoading.value = false;
  }
};

onMounted(async () => {
  permissionCodes.value = await getCurrentUserPermissionCodes();
  await loadScopes();
});

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="10">
        <v-card-text class="py-6 px-6">
          <h3 class="text-h4 font-weight-bold mb-2">User role scopes</h3>
          <p class="text-subtitle-1 text-medium-emphasis mb-4">
            Pair a user–role assignment with a scope (e.g. a unit). Scoped access uses the active tenant.
          </p>

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>

          <v-data-table-server
            class="border rounded-md crud-tbl"
            :headers="headers"
            :items="tableRows"
            :items-length="total"
            :loading="isLoading"
            :items-per-page="limit"
            :page="page"
            item-value="id"
            @update:options="onTableOptionsUpdate"
          >
            <template #top>
              <v-toolbar flat elevation="0" class="border-bottom px-2">
                <v-toolbar-title></v-toolbar-title>
                <v-spacer />
                <v-text-field
                  v-model="tableSearch"
                  prepend-inner-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                  density="compact"
                  variant="outlined"
                  style="max-width: 300px"
                  clearable
                  @update:model-value="triggerServerSearch"
                />
                <v-btn
                  v-if="canCreate"
                  color="success"
                  class="ml-3"
                  prepend-icon="mdi-plus"
                  variant="tonal"
                  density="compact"
                  height="40"
                  @click="openCreateDialog"
                >
                  Create Record
                </v-btn>
              </v-toolbar>
            </template>

            <template #item.createdAt="{ item }">
              {{ item.createdAt ? new Date(item.createdAt).toLocaleString() : "—" }}
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex align-center justify-center">
                <v-menu v-if="hasAnyAction" location="bottom end">
                  <template #activator="{ props }">
                    <v-btn icon size="small" variant="text" color="error" v-bind="props">
                      <v-icon size="18">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact" min-width="168" class="action-menu-compact">
                    <v-list-item
                      v-if="hasPermission(permissionCodes, 'user_role_scopes.read')"
                      density="compact"
                      min-height="30"
                      @click="handleView(item as UserRoleScopeRow)"
                    >
                      <template #prepend><v-icon size="16" color="info">mdi-eye</v-icon></template>
                      <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="canUpdate" density="compact" min-height="30" @click="handleEdit(Number(item.id))">
                      <template #prepend><v-icon size="16" color="warning">mdi-pencil</v-icon></template>
                      <v-list-item-title>Update</v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="canDelete" density="compact" min-height="30" @click="handleDeleteOpen(item as UserRoleScopeRow)">
                      <template #prepend><v-icon size="16" color="error">mdi-delete</v-icon></template>
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>

            <template #no-data>
              <div class="text-medium-emphasis py-4">No records to display.</div>
            </template>
          </v-data-table-server>

          <v-dialog v-model="createDialog" max-width="560">
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Create user role scope</v-card-title>
              <v-card-text class="pa-5">
                <v-alert
                  v-if="scopeFormError && createDialog"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  rounded="md"
                >
                  {{ scopeFormError }}
                </v-alert>
                <v-form
                  id="create-scope-form"
                  ref="createScopeFormRef"
                  validate-on="input lazy"
                  @submit.prevent="submitCreate"
                >
                  <div class="mb-3">
                    <v-select
                      v-model="createForm.userRoleId"
                      label="User — role"
                      :items="userRoleSelectItems"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Assignment from user_roles (user paired with role)"
                      persistent-hint
                      :rules="userRoleIdRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-select
                      v-model="createForm.scopeType"
                      label="Scope type"
                      :items="scopeTypeOptions"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :rules="scopeTypeRules"
                    />
                  </div>
                  <div v-if="createForm.scopeType === SCOPE_UNITS" class="mb-3">
                    <v-select
                      v-model="createForm.scopeId"
                      label="Unit"
                      :items="unitSelectItems"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Scope target when type is Units"
                      persistent-hint
                      :rules="scopeIdRules"
                    />
                  </div>
                </v-form>
              </v-card-text>
              <v-card-actions class="pa-5 border-t">
                <v-spacer />
                <v-btn
                  color="success"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  type="submit"
                  form="create-scope-form"
                  :loading="actionLoading"
                >
                  Save
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  :disabled="actionLoading"
                  @click="createDialog = false"
                >
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="viewDialog" max-width="520">
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">User role scope</v-card-title>
              <v-card-text class="pa-5">
                <v-row dense>
                  <v-col cols="5" class="text-body-1 text-medium-emphasis">User — role</v-col>
                  <v-col cols="7" class="text-body-1 font-weight-medium">
                    {{ selectedScope ? pairLabelFromUserRole(selectedScope.userRole) : "—" }}
                  </v-col>
                  <v-col cols="5" class="text-body-1 text-medium-emphasis">Scope type</v-col>
                  <v-col cols="7" class="text-body-1 font-weight-medium">
                    {{ selectedScope?.scopeType || "—" }}
                  </v-col>
                  <v-col cols="5" class="text-body-1 text-medium-emphasis">Scope</v-col>
                  <v-col cols="7" class="text-body-1 font-weight-medium">
                    {{
                      selectedScope?.scopeType === SCOPE_UNITS
                        ? unitLabelById[String(selectedScope.scopeId)] || selectedScope?.scopeId
                        : selectedScope?.scopeId || "—"
                    }}
                  </v-col>
                  <v-col cols="5" class="text-body-1 text-medium-emphasis">Created</v-col>
                  <v-col cols="7" class="text-body-1 font-weight-medium">
                    {{
                      selectedScope?.createdAt
                        ? new Date(selectedScope.createdAt).toLocaleString()
                        : "—"
                    }}
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="pa-5 border-t">
                <v-spacer />
                <v-btn color="secondary" variant="tonal" class="px-4 rounded-pill" @click="viewDialog = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="editDialog" max-width="560">
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Update user role scope</v-card-title>
              <v-card-text class="pa-5">
                <v-alert
                  v-if="scopeFormError && editDialog"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  rounded="md"
                >
                  {{ scopeFormError }}
                </v-alert>
                <v-form
                  id="edit-scope-form"
                  ref="editScopeFormRef"
                  validate-on="input lazy"
                  @submit.prevent="submitEdit"
                >
                  <div class="mb-3">
                    <v-select
                      v-model="editForm.userRoleId"
                      label="User — role"
                      :items="userRoleSelectItems"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :rules="userRoleIdRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-select
                      v-model="editForm.scopeType"
                      label="Scope type"
                      :items="scopeTypeOptions"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :rules="scopeTypeRules"
                    />
                  </div>
                  <div v-if="editForm.scopeType === SCOPE_UNITS" class="mb-3">
                    <v-select
                      v-model="editForm.scopeId"
                      label="Unit"
                      :items="unitSelectItems"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      :rules="scopeIdRulesEdit"
                    />
                  </div>
                </v-form>
              </v-card-text>
              <v-card-actions class="pa-5 border-t">
                <v-spacer />
                <v-btn
                  color="success"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  type="submit"
                  form="edit-scope-form"
                  :loading="actionLoading"
                >
                  Save
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  :disabled="actionLoading"
                  @click="editDialog = false"
                >
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="deleteDialog" max-width="460">
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Delete user role scope</v-card-title>
              <v-card-text class="pa-5">
                Remove this scope for
                <strong>{{ selectedScope ? pairLabelFromUserRole(selectedScope.userRole) : "—" }}</strong>
                ?
              </v-card-text>
              <v-card-actions class="pa-5 border-t">
                <v-spacer />
                <v-btn
                  color="warning"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  :loading="actionLoading"
                  @click="confirmDelete"
                >
                  Delete
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  :disabled="actionLoading"
                  @click="deleteDialog = false"
                >
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

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

          <v-snackbar
            v-model="errorSnackbar"
            location="top right"
            color="error"
            rounded="lg"
            timeout="4000"
            max-width="420"
          >
            <div class="d-flex align-start ga-3">
              <v-icon size="20">mdi-alert-circle-outline</v-icon>
              <div class="snackbar-error-text">
                <div class="text-body-1 font-weight-medium">{{ errorSnackTitle }}</div>
                <div
                  v-if="errorSnackDescription"
                  class="text-body-2 text-medium-emphasis mt-1"
                >
                  {{ errorSnackDescription }}
                </div>
              </div>
            </div>
          </v-snackbar>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.snackbar-error-text {
  max-width: 340px;
  word-break: break-word;
}

.action-menu-compact :deep(.v-list-item-title) {
  font-size: 0.8125rem;
  line-height: 1.2;
}
</style>
