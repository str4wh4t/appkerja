<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  createUnit,
  forceDeleteUnitById,
  getUnitById,
  getUnitsPaginated,
  deleteUnitById,
  restoreUnitById,
  updateUnitById,
  type UnitRow,
} from "@/services/graphql/units.service";
import {
  getCurrentUserPermissionCodes,
  hasAnyPermission,
  hasPermission,
} from "@/services/graphql/user-permissions.service";

definePageMeta({
  middleware: ["auth"],
});

const isLoading = ref(false);
const errorMessage = ref("");
const rows = ref<UnitRow[]>([]);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const tableSearch = ref("");
const sortBy = ref("createdAt");
const descending = ref(true);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let parentSearchTimer: ReturnType<typeof setTimeout> | null = null;
const actionLoading = ref(false);
const unitFormError = ref("");
const createUnitFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const editUnitFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const unitCodeRules = [
  (v: string) => !!String(v || "").trim() || "Code is required",
  (v: string) =>
    String(v || "").trim().length <= 50 || "Code must be at most 50 characters",
];

const unitNameRules = [
  (v: string) => !!String(v || "").trim() || "Name is required",
  (v: string) =>
    String(v || "").trim().length <= 100 || "Name must be at most 100 characters",
];

const unitDescriptionRules = [
  (v: string) =>
    String(v || "").trim().length <= 10000 || "Description is too long",
];

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
const createDialog = ref(false);
const viewDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);
const forceDeleteDialog = ref(false);
const selectedUnit = ref<UnitRow | null>(null);

const codeByUnitId = ref<Record<string, string>>({});
const parentSelectItems = ref<Array<{ title: string; value: string }>>([]);
const parentOptionsError = ref("");
const parentSearchLoading = ref(false);
/** Tracks VAutocomplete search input (see component `search` API). */
const parentSearchQuery = ref("");

const createForm = ref({
  code: "",
  name: "",
  description: "",
  parentId: null as string | null,
  isActive: true,
});
const editForm = ref({
  code: "",
  name: "",
  description: "",
  parentId: null as string | null,
  isActive: true,
});

const headers = ref([
  { title: "Code", key: "code" },
  { title: "Name", key: "name" },
  { title: "Parent", key: "parentLabel", sortable: false },
  { title: "Active", key: "isActive", sortable: false },
  { title: "Actions", key: "actions", sortable: false, align: "center" as const },
]);

const unitListScope = ref<"active" | "deleted">("active");
const isDeletedUnitList = computed(() => unitListScope.value === "deleted");
const permissionCodes = ref<Set<string>>(new Set());
const canCreate = computed(() => hasPermission(permissionCodes.value, "units.create"));
const canUpdate = computed(() => hasPermission(permissionCodes.value, "units.update"));
const canDelete = computed(() => hasPermission(permissionCodes.value, "units.delete"));
const canRestore = computed(() => hasPermission(permissionCodes.value, "units.restore"));
const canForceDelete = computed(() =>
  hasPermission(permissionCodes.value, "units.force_delete"),
);
const hasAnyActiveAction = computed(() =>
  hasAnyPermission(permissionCodes.value, ["units.read", "units.update", "units.delete"]),
);
const hasAnyDeletedAction = computed(() =>
  hasAnyPermission(permissionCodes.value, [
    "units.read",
    "units.restore",
    "units.force_delete",
  ]),
);

const mergeCodesFromUnits = (units: UnitRow[]) => {
  const next = { ...codeByUnitId.value };
  for (const u of units) {
    if (u?.id) next[u.id] = u.code || "";
  }
  codeByUnitId.value = next;
};

const buildParentItemRows = (units: UnitRow[], excludeUnitId?: string | null) => {
  let list = units.filter((u) => u?.id);
  if (excludeUnitId) {
    list = list.filter((u) => String(u.id) !== String(excludeUnitId));
  }
  return list.sort((a, b) =>
    String(a.code || "").localeCompare(String(b.code || ""), undefined, { sensitivity: "base" }),
  );
};

/**
 * On focus, VAutocomplete may set `search` to the selected item title (not the user's query).
 * That string is not suitable for backend `LIKE`; treat it as empty search.
 */
const effectiveParentApiSearch = (raw: string): string => {
  const q = String(raw ?? "").trim();
  if (!q) return "";
  const pid = editDialog.value
    ? editForm.value.parentId
    : createDialog.value
      ? createForm.value.parentId
      : null;
  if (!pid) return q;
  const known = parentSelectItems.value.find((i) => i.value === pid)?.title;
  if (known && q === known) return "";
  return q;
};

const refreshParentItems = async (
  search: string,
  opts?: { excludeUnitId?: string | null; preserveParentId?: string | null },
) => {
  parentOptionsError.value = "";
  parentSearchLoading.value = true;
  const q = String(search ?? "").trim();
  try {
    const res = await getUnitsPaginated(1, 100, q, "code", false, false);
    const fromApi = (res.data?.unitsFindAllPaginated?.data ?? []) as UnitRow[];
    const byId = new Map<string, UnitRow>();
    // Only merge current table rows when search is empty — do not mix server-side results with paged table data.
    if (q === "") {
      for (const u of rows.value) {
        if (u?.id) byId.set(String(u.id), u);
      }
    }
    for (const u of fromApi) {
      if (u?.id) byId.set(String(u.id), u);
    }
    let data = buildParentItemRows([...byId.values()], opts?.excludeUnitId);
    mergeCodesFromUnits(data);
    const items: Array<{ title: string; value: string }> = data.map((u) => ({
      title: `${u.code} — ${u.name}`,
      value: String(u.id),
    }));

    const preserve = opts?.preserveParentId;
    if (
      preserve &&
      (!opts?.excludeUnitId || String(preserve) !== String(opts.excludeUnitId)) &&
      !items.some((i) => i.value === preserve)
    ) {
      try {
        const one = await getUnitById(preserve);
        const u = one.data?.unitsFindOne as UnitRow | undefined;
        if (u?.id && (!opts?.excludeUnitId || String(u.id) !== String(opts.excludeUnitId))) {
          mergeCodesFromUnits([u]);
          items.unshift({
            title: `${u.code} — ${u.name}`,
            value: String(u.id),
          });
        }
      } catch {
        /* abaikan */
      }
    }

    parentSelectItems.value = items;
  } catch (e: any) {
    parentOptionsError.value = e?.message || "Failed to load parent list.";
    const byId = new Map<string, UnitRow>();
    if (q === "") {
      for (const u of rows.value) {
        if (u?.id) byId.set(String(u.id), u);
      }
    }
    const fallback = buildParentItemRows([...byId.values()], opts?.excludeUnitId);
    mergeCodesFromUnits(fallback);
    parentSelectItems.value = fallback.map((u) => ({
      title: `${u.code} — ${u.name}`,
      value: String(u.id),
    }));
  } finally {
    parentSearchLoading.value = false;
  }
};

const scheduleParentServerSearch = () => {
  if (parentSearchTimer) {
    clearTimeout(parentSearchTimer);
  }
  parentSearchTimer = setTimeout(async () => {
    if (!createDialog.value && !editDialog.value) return;
    const raw = parentSearchQuery.value == null ? "" : String(parentSearchQuery.value);
    const apiQ = effectiveParentApiSearch(raw);
    const exclude =
      editDialog.value && selectedUnit.value?.id ? String(selectedUnit.value.id) : undefined;
    let preserve: string | undefined;
    if (editDialog.value && editForm.value.parentId) {
      preserve = editForm.value.parentId;
    } else if (createDialog.value && createForm.value.parentId) {
      preserve = createForm.value.parentId;
    }
    await refreshParentItems(apiQ, { excludeUnitId: exclude, preserveParentId: preserve });
  }, 350);
};

watch(parentSearchQuery, () => {
  scheduleParentServerSearch();
});

watch([createDialog, editDialog], ([c, e]) => {
  if (!c && !e) {
    parentSearchQuery.value = "";
  }
});

const parentLabel = (row: UnitRow) => {
  if (!row.parentId) return "—";
  return codeByUnitId.value[row.parentId] || "—";
};

const tableRows = computed(() =>
  rows.value.map((u) => ({
    ...u,
    parentLabel: parentLabel(u),
  })),
);

const loadUnits = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await getUnitsPaginated(
      page.value,
      limit.value,
      String(tableSearch.value || "").trim(),
      sortBy.value,
      descending.value,
      isDeletedUnitList.value,
    );
    const payload = response.data?.unitsFindAllPaginated;
    rows.value = (payload?.data ?? []) as UnitRow[];
    total.value = payload?.total ?? 0;
    mergeCodesFromUnits(rows.value);
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load units.";
  } finally {
    isLoading.value = false;
  }
};

const triggerServerSearch = () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  searchDebounceTimer = setTimeout(async () => {
    page.value = 1;
    await loadUnits();
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
  const allowed = ["createdAt", "updatedAt", "code", "name"];
  const rawKey = firstSort?.key || "createdAt";
  const nextSortBy = allowed.includes(rawKey) ? rawKey : "createdAt";
  const nextDescending = firstSort?.order === "desc";
  if (nextSortBy !== sortBy.value || nextDescending !== descending.value) {
    sortBy.value = nextSortBy;
    descending.value = nextDescending;
    shouldReload = true;
  }

  if (shouldReload) {
    await loadUnits();
  }
};

watch(unitListScope, async () => {
  page.value = 1;
  await loadUnits();
});

const openViewFromRow = (item: UnitRow) => {
  selectedUnit.value = { ...item };
  viewDialog.value = true;
};

const handleView = async (id: string) => {
  actionLoading.value = true;
  try {
    const response = await getUnitById(id, isDeletedUnitList.value);
    const detail = response.data?.unitsFindOne;
    if (!detail) {
      throw new Error("Unit not found.");
    }
    selectedUnit.value = detail as UnitRow;
    mergeCodesFromUnits([detail as UnitRow]);
    viewDialog.value = true;
  } catch (error: any) {
    showErrorSnack("Failed to load unit details", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

const handleEdit = async (id: string) => {
  unitFormError.value = "";
  actionLoading.value = true;
  try {
    const response = await getUnitById(id, false);
    const detail = response.data?.unitsFindOne;
    if (!detail) {
      throw new Error("Unit not found.");
    }
    const row = detail as UnitRow;
    selectedUnit.value = row;
    mergeCodesFromUnits([row]);
    parentSearchQuery.value = "";
    editForm.value = {
      code: row.code || "",
      name: row.name || "",
      description: row.description || "",
      parentId: row.parentId ? String(row.parentId) : null,
      isActive: Boolean(row.isActive),
    };
    await refreshParentItems("", {
      excludeUnitId: String(row.id),
      preserveParentId: row.parentId ? String(row.parentId) : undefined,
    });
    editDialog.value = true;
  } catch (error: any) {
    showErrorSnack("Failed to load unit for editing", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

const handleDelete = (id: string) => {
  selectedUnit.value = rows.value.find((u) => String(u.id) === id) ?? null;
  deleteDialog.value = true;
};

const handleForceDeleteOpen = (id: string) => {
  selectedUnit.value = rows.value.find((u) => String(u.id) === id) ?? null;
  forceDeleteDialog.value = true;
};

const handleRestore = async (id: string) => {
  if (!id) return;
  actionLoading.value = true;
  try {
    const res = await restoreUnitById(id);
    if (!res.data?.unitsRestore?.id) {
      throw new Error("Failed to restore unit.");
    }
    successMessage.value = "Unit has been restored.";
    successSnackbar.value = true;
    await loadUnits();
    await refreshParentItems("");
  } catch (error: any) {
    showErrorSnack("Failed to restore unit", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

const openCreateDialog = async () => {
  unitFormError.value = "";
  parentSearchQuery.value = "";
  createForm.value = {
    code: "",
    name: "",
    description: "",
    parentId: null,
    isActive: true,
  };
  createDialog.value = true;
  await refreshParentItems("", {});
};

const submitCreate = async () => {
  unitFormError.value = "";
  const form = createUnitFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }
  actionLoading.value = true;
  try {
    await createUnit({
      code: createForm.value.code.trim(),
      name: createForm.value.name.trim(),
      description: createForm.value.description.trim() || undefined,
      parentId: createForm.value.parentId ? createForm.value.parentId : undefined,
      isActive: createForm.value.isActive,
    });
    createDialog.value = false;
    successMessage.value = "Unit has been created.";
    successSnackbar.value = true;
    await loadUnits();
    await refreshParentItems("");
  } catch (error: any) {
    unitFormError.value = error?.message || "Failed to create unit.";
  } finally {
    actionLoading.value = false;
  }
};

const submitEdit = async () => {
  if (!selectedUnit.value?.id) return;
  unitFormError.value = "";
  const form = editUnitFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }
  actionLoading.value = true;
  try {
    await updateUnitById(String(selectedUnit.value.id), {
      code: editForm.value.code.trim() || undefined,
      name: editForm.value.name.trim() || undefined,
      description: editForm.value.description.trim() || undefined,
      parentId: editForm.value.parentId ?? null,
      isActive: editForm.value.isActive,
    });
    successMessage.value = "Unit has been updated.";
    successSnackbar.value = true;
    editDialog.value = false;
    await loadUnits();
    await refreshParentItems("");
  } catch (error: any) {
    unitFormError.value = error?.message || "Failed to save changes.";
  } finally {
    actionLoading.value = false;
  }
};

const confirmDelete = async () => {
  if (!selectedUnit.value?.id) return;
  actionLoading.value = true;
  try {
    await deleteUnitById(String(selectedUnit.value.id));
    deleteDialog.value = false;
    successMessage.value = "Unit has been deleted.";
    successSnackbar.value = true;
    await loadUnits();
    await refreshParentItems("");
  } catch (error: any) {
    showErrorSnack("Failed to delete unit", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

const confirmForceDelete = async () => {
  if (!selectedUnit.value?.id) return;
  actionLoading.value = true;
  try {
    const res = await forceDeleteUnitById(String(selectedUnit.value.id));
    if (!res.data?.unitsForceDelete) {
      throw new Error("Failed to force delete unit.");
    }
    forceDeleteDialog.value = false;
    successMessage.value = "Unit has been permanently deleted.";
    successSnackbar.value = true;
    await loadUnits();
    await refreshParentItems("");
  } catch (error: any) {
    showErrorSnack("Failed to force delete unit", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

onMounted(async () => {
  permissionCodes.value = await getCurrentUserPermissionCodes();
  await Promise.all([loadUnits(), refreshParentItems("")]);
});

onBeforeUnmount(() => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
  if (parentSearchTimer) {
    clearTimeout(parentSearchTimer);
  }
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="10">
        <v-card-text class="py-6 px-6">
          <h3 class="text-h4 font-weight-bold mb-2">Units</h3>
          <p class="text-subtitle-1 text-medium-emphasis mb-4">
            Units per tenant: unique code, optional parent hierarchy, and soft delete.
          </p>

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>

          <div class="d-flex flex-wrap align-center justify-center ga-3 mb-4">
            <v-btn-toggle
              v-model="unitListScope"
              mandatory
              divided
              variant="outlined"
              color="primary"
            >
              <v-btn value="active" prepend-icon="mdi-office-building-outline"> All </v-btn>
              <v-btn value="deleted" prepend-icon="mdi-delete-outline"> Trashed </v-btn>
            </v-btn-toggle>
          </div>

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
                  v-if="!isDeletedUnitList && canCreate"
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

            <template #item.isActive="{ item }">
              <v-chip
                size="small"
                :color="item.isActive ? 'success' : 'default'"
                variant="tonal"
              >
                {{ item.isActive ? "Yes" : "No" }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex align-center justify-center">
                <v-menu
                  v-if="
                    (isDeletedUnitList && hasAnyDeletedAction) ||
                    (!isDeletedUnitList && hasAnyActiveAction)
                  "
                  location="bottom end"
                >
                  <template #activator="{ props }">
                    <v-btn icon size="small" variant="text" color="error" v-bind="props">
                      <v-icon size="18">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact" min-width="168" class="action-menu-compact">
                    <template v-if="isDeletedUnitList">
                      <v-list-item
                        v-if="hasPermission(permissionCodes, 'units.read')"
                        density="compact"
                        min-height="30"
                        @click="openViewFromRow(item)"
                      >
                        <template #prepend><v-icon size="16" color="info">mdi-eye</v-icon></template>
                        <v-list-item-title>View</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="canRestore" density="compact" min-height="30" @click="handleRestore(String(item.id || ''))">
                        <template #prepend><v-icon size="16" color="success">mdi-restore</v-icon></template>
                        <v-list-item-title>Restore</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="canForceDelete" density="compact" min-height="30" @click="handleForceDeleteOpen(String(item.id || ''))">
                        <template #prepend><v-icon size="16" color="error">mdi-delete-forever</v-icon></template>
                        <v-list-item-title>Force Delete</v-list-item-title>
                      </v-list-item>
                    </template>
                    <template v-else>
                      <v-list-item
                        v-if="hasPermission(permissionCodes, 'units.read')"
                        density="compact"
                        min-height="30"
                        @click="handleView(String(item.id || ''))"
                      >
                        <template #prepend><v-icon size="16" color="info">mdi-eye</v-icon></template>
                        <v-list-item-title>View</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="canUpdate" density="compact" min-height="30" @click="handleEdit(String(item.id || ''))">
                        <template #prepend><v-icon size="16" color="warning">mdi-pencil</v-icon></template>
                        <v-list-item-title>Update</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="canDelete" density="compact" min-height="30" @click="handleDelete(String(item.id || ''))">
                        <template #prepend><v-icon size="16" color="error">mdi-delete</v-icon></template>
                        <v-list-item-title>Delete</v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-list>
                </v-menu>
              </div>
            </template>

            <template #no-data>
              <div class="text-medium-emphasis py-4">No units to display.</div>
            </template>
          </v-data-table-server>

          <v-dialog v-model="createDialog" max-width="560">
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Create Unit</v-card-title>
              <v-card-text class="pa-5">
                <v-alert
                  v-if="unitFormError && createDialog"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  rounded="md"
                >
                  {{ unitFormError }}
                </v-alert>
                <v-form
                  id="create-unit-form"
                  ref="createUnitFormRef"
                  validate-on="input lazy"
                  @submit.prevent="submitCreate"
                >
                  <div class="mb-3">
                    <v-text-field
                      v-model="createForm.code"
                      label="Code"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Required, max 50 characters (unique per tenant)"
                      persistent-hint
                      :rules="unitCodeRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="createForm.name"
                      label="Name"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Required, max 100 characters"
                      persistent-hint
                      :rules="unitNameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-textarea
                      v-model="createForm.description"
                      label="Description"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Optional"
                      persistent-hint
                      :rules="unitDescriptionRules"
                      rows="2"
                    />
                  </div>
                  <v-alert
                    v-if="parentOptionsError"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    class="mb-3"
                  >
                    {{ parentOptionsError }} Parent list falls back to loaded table data when available.
                  </v-alert>
                  <div class="mb-3">
                    <v-autocomplete
                      v-model="createForm.parentId"
                      v-model:search="parentSearchQuery"
                      label="Parent unit"
                      :items="parentSelectItems"
                      item-title="title"
                      item-value="value"
                      placeholder="Search code, name, or description…"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details="auto"
                      hide-no-data
                      no-filter
                      hint="Optional — leave empty for a root unit"
                      persistent-hint
                      :loading="parentSearchLoading"
                    />
                  </div>
                  <div class="mb-3">
                    <v-switch v-model="createForm.isActive" color="primary" label="Active" hide-details />
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
                  form="create-unit-form"
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
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Detail Unit</v-card-title>
              <v-card-text class="pa-5">
                <v-row dense>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Code</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedUnit?.code || "—" }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Name</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedUnit?.name || "—" }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Description</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedUnit?.description || "—" }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Parent</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{
                      selectedUnit?.parentId
                        ? codeByUnitId[selectedUnit.parentId] || selectedUnit.parentId
                        : "—"
                    }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Active</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedUnit?.isActive ? "Yes" : "No" }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Created</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{
                      selectedUnit?.createdAt
                        ? new Date(selectedUnit.createdAt).toLocaleString()
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
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Update Unit</v-card-title>
              <v-card-text class="pa-5">
                <v-alert
                  v-if="unitFormError && editDialog"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  rounded="md"
                >
                  {{ unitFormError }}
                </v-alert>
                <v-form
                  id="edit-unit-form"
                  ref="editUnitFormRef"
                  validate-on="input lazy"
                  @submit.prevent="submitEdit"
                >
                  <div class="mb-3">
                    <v-text-field
                      v-model="editForm.code"
                      label="Code"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Required, max 50 characters"
                      persistent-hint
                      :rules="unitCodeRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="editForm.name"
                      label="Name"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Required, max 100 characters"
                      persistent-hint
                      :rules="unitNameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-textarea
                      v-model="editForm.description"
                      label="Description"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Optional"
                      persistent-hint
                      :rules="unitDescriptionRules"
                      rows="2"
                    />
                  </div>
                  <v-alert
                    v-if="parentOptionsError"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    class="mb-3"
                  >
                    {{ parentOptionsError }} Parent list falls back to loaded table data when available.
                  </v-alert>
                  <div class="mb-3">
                    <v-autocomplete
                      v-model="editForm.parentId"
                      v-model:search="parentSearchQuery"
                      label="Parent unit"
                      :items="parentSelectItems"
                      item-title="title"
                      item-value="value"
                      placeholder="Search code, name, or description…"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      clearable
                      hide-details="auto"
                      hide-no-data
                      no-filter
                      hint="Optional — leave empty for a root unit"
                      persistent-hint
                      :loading="parentSearchLoading"
                    />
                  </div>
                  <div class="mb-3">
                    <v-switch v-model="editForm.isActive" color="primary" label="Active" hide-details />
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
                  form="edit-unit-form"
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
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Delete Unit</v-card-title>
              <v-card-text class="pa-5">
                Are you sure you want to delete unit:
                <strong>{{ selectedUnit?.code || "—" }}</strong>
                ({{ selectedUnit?.name || "—" }})
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

          <v-dialog v-model="forceDeleteDialog" max-width="560" scrollable>
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Force Delete</v-card-title>
              <v-card-text class="pa-5">
                <p class="mb-3">
                  You are about to permanently delete unit
                  <strong>{{ selectedUnit?.code || "—" }}</strong>
                  ({{ selectedUnit?.name || "—" }}) from the database. This action cannot be undone.
                </p>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Data will be removed permanently. Other records referencing this row may be removed
                  if the database uses ON DELETE CASCADE, or the server may reject the operation if
                  references still exist with RESTRICT.
                </p>
              </v-card-text>
              <v-card-actions class="pa-5 border-t">
                <v-spacer />
                <v-btn
                  color="error"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  :loading="actionLoading"
                  @click="confirmForceDelete"
                >
                  Force Delete
                </v-btn>
                <v-btn
                  color="secondary"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  :disabled="actionLoading"
                  @click="forceDeleteDialog = false"
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
              <v-icon size="20" class="mt-0">mdi-alert-circle-outline</v-icon>
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
.detail-row {
  padding-bottom: 10px;
}

.snackbar-error-text {
  max-width: 340px;
  word-break: break-word;
}

.action-menu-compact :deep(.v-list-item-title) {
  font-size: 0.8125rem;
  line-height: 1.2;
}
</style>
