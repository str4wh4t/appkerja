<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  createTenant,
  forceDeleteTenantById,
  getTenantById,
  getTenantsFindAll,
  deleteTenantById,
  restoreTenantById,
  updateTenantById,
  type TenantRow,
} from "@/services/graphql/tenants.service";
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
const rows = ref<TenantRow[]>([]);
const actionLoading = ref(false);
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

const tenantFormError = ref("");
const createTenantFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const editTenantFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const tenantCodeRules = [
  (v: string) => !!String(v || "").trim() || "Code is required",
  (v: string) =>
    String(v || "").trim().length <= 100 || "Code must be at most 100 characters",
];

const tenantNameRules = [
  (v: string) => !!String(v || "").trim() || "Name is required",
  (v: string) =>
    String(v || "").trim().length <= 255 || "Name must be at most 255 characters",
];

const tenantAddressRules = [
  (v: string) =>
    String(v || "").trim().length <= 255 || "Address must be at most 255 characters",
];

const tenantDescriptionRules = [
  (v: string) =>
    String(v || "").trim().length <= 255 || "Description must be at most 255 characters",
];

const createDialog = ref(false);
const viewDialog = ref(false);
const editDialog = ref(false);
const deleteDialog = ref(false);
const forceDeleteDialog = ref(false);
const selectedTenant = ref<TenantRow | null>(null);

const createForm = ref({
  code: "",
  name: "",
  address: "",
  description: "",
});
const editForm = ref({
  code: "",
  name: "",
  address: "",
  description: "",
});

const headers = ref([
  { title: "Code", key: "code", sortable: false },
  { title: "Name", key: "name", sortable: false },
  { title: "Address", key: "address", sortable: false },
  { title: "Description", key: "description", sortable: false },
  { title: "Created", key: "createdAt", sortable: false },
  { title: "Actions", key: "actions", sortable: false, align: "center" as const },
]);

const tenantListScope = ref<"active" | "deleted">("active");
const isDeletedTenantList = computed(() => tenantListScope.value === "deleted");
const permissionCodes = ref<Set<string>>(new Set());
const canCreate = computed(() => hasPermission(permissionCodes.value, "tenants.create"));
const canUpdate = computed(() => hasPermission(permissionCodes.value, "tenants.update"));
const canDelete = computed(() => hasPermission(permissionCodes.value, "tenants.delete"));
const canRestore = computed(() => hasPermission(permissionCodes.value, "tenants.restore"));
const canForceDelete = computed(() =>
  hasPermission(permissionCodes.value, "tenants.force_delete"),
);
const hasAnyActiveAction = computed(() =>
  hasAnyPermission(permissionCodes.value, [
    "tenants.read",
    "tenants.update",
    "tenants.delete",
  ]),
);
const hasAnyDeletedAction = computed(() =>
  hasAnyPermission(permissionCodes.value, [
    "tenants.read",
    "tenants.restore",
    "tenants.force_delete",
  ]),
);

const loadTenants = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await getTenantsFindAll(isDeletedTenantList.value);
    rows.value = (res.data?.tenantsFindAll ?? []) as TenantRow[];
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load tenants.";
  } finally {
    isLoading.value = false;
  }
};

watch(tenantListScope, async () => {
  await loadTenants();
});

const openViewFromRow = (item: TenantRow) => {
  selectedTenant.value = { ...item };
  viewDialog.value = true;
};

const handleView = async (id: string) => {
  if (isDeletedTenantList.value) {
    const row = rows.value.find((r) => String(r.id) === String(id));
    if (row) {
      selectedTenant.value = { ...row };
      viewDialog.value = true;
      return;
    }
  }
  actionLoading.value = true;
  try {
    const response = await getTenantById(id, isDeletedTenantList.value);
    const detail = response.data?.tenantsFindOne;
    if (!detail) {
      throw new Error("Tenant not found.");
    }
    selectedTenant.value = detail as TenantRow;
    viewDialog.value = true;
  } catch (error: any) {
    showErrorSnack("Failed to load tenant details", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

const handleEdit = async (id: string) => {
  tenantFormError.value = "";
  actionLoading.value = true;
  try {
    const response = await getTenantById(id, false);
    const detail = response.data?.tenantsFindOne;
    if (!detail) {
      throw new Error("Tenant not found.");
    }
    const row = detail as TenantRow;
    selectedTenant.value = row;
    editForm.value = {
      code: row.code || "",
      name: row.name || "",
      address: row.address || "",
      description: row.description || "",
    };
    editDialog.value = true;
  } catch (error: any) {
    showErrorSnack("Failed to load tenant for editing", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

const handleDelete = (id: string) => {
  selectedTenant.value = rows.value.find((r) => String(r.id) === id) ?? null;
  deleteDialog.value = true;
};

const handleForceDeleteOpen = (id: string) => {
  selectedTenant.value = rows.value.find((r) => String(r.id) === id) ?? null;
  forceDeleteDialog.value = true;
};

const handleRestore = async (id: string) => {
  if (!id) return;
  actionLoading.value = true;
  try {
    const res = await restoreTenantById(id);
    if (!res.data?.tenantsRestore?.id) {
      throw new Error("Failed to restore tenant.");
    }
    successMessage.value = "Tenant has been restored.";
    successSnackbar.value = true;
    await loadTenants();
  } catch (error: any) {
    showErrorSnack("Failed to restore tenant", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

const openCreateDialog = () => {
  tenantFormError.value = "";
  createForm.value = {
    code: "",
    name: "",
    address: "",
    description: "",
  };
  createDialog.value = true;
};

const submitCreate = async () => {
  tenantFormError.value = "";
  const form = createTenantFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }
  actionLoading.value = true;
  try {
    await createTenant({
      code: createForm.value.code.trim(),
      name: createForm.value.name.trim(),
      address: createForm.value.address.trim() || undefined,
      description: createForm.value.description.trim() || undefined,
    });
    createDialog.value = false;
    successMessage.value = "Tenant has been created.";
    successSnackbar.value = true;
    await loadTenants();
  } catch (error: any) {
    tenantFormError.value = error?.message || "Failed to create tenant.";
  } finally {
    actionLoading.value = false;
  }
};

const submitEdit = async () => {
  if (!selectedTenant.value?.id) return;
  tenantFormError.value = "";
  const form = editTenantFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }
  actionLoading.value = true;
  try {
    await updateTenantById(String(selectedTenant.value.id), {
      code: editForm.value.code.trim() || undefined,
      name: editForm.value.name.trim() || undefined,
      address: editForm.value.address.trim() || undefined,
      description: editForm.value.description.trim() || undefined,
    });
    successMessage.value = "Tenant has been updated.";
    successSnackbar.value = true;
    editDialog.value = false;
    await loadTenants();
  } catch (error: any) {
    tenantFormError.value = error?.message || "Failed to save changes.";
  } finally {
    actionLoading.value = false;
  }
};

const confirmDelete = async () => {
  if (!selectedTenant.value?.id) return;
  actionLoading.value = true;
  try {
    await deleteTenantById(String(selectedTenant.value.id));
    deleteDialog.value = false;
    successMessage.value = "Tenant has been deleted.";
    successSnackbar.value = true;
    await loadTenants();
  } catch (error: any) {
    showErrorSnack("Failed to delete tenant", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

const confirmForceDelete = async () => {
  if (!selectedTenant.value?.id) return;
  actionLoading.value = true;
  try {
    const res = await forceDeleteTenantById(String(selectedTenant.value.id));
    if (!res.data?.tenantsForceDelete) {
      throw new Error("Failed to force delete tenant.");
    }
    forceDeleteDialog.value = false;
    successMessage.value = "Tenant has been permanently deleted.";
    successSnackbar.value = true;
    await loadTenants();
  } catch (error: any) {
    showErrorSnack("Failed to force delete tenant", error?.message);
  } finally {
    actionLoading.value = false;
  }
};

onMounted(async () => {
  permissionCodes.value = await getCurrentUserPermissionCodes();
  await loadTenants();
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-card elevation="10">
        <v-card-text class="py-6 px-6">
          <h3 class="text-h4 font-weight-bold mb-2">Tenants</h3>
          <p class="text-subtitle-1 text-medium-emphasis mb-4">
            Full list from <code>tenantsFindAll</code> — no pagination, search, or sorting in the UI.
          </p>

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>

          <div class="d-flex flex-wrap align-center justify-center ga-3 mb-4">
            <v-btn-toggle
              v-model="tenantListScope"
              mandatory
              divided
              variant="outlined"
              color="primary"
            >
              <v-btn value="active" prepend-icon="mdi-domain"> All </v-btn>
              <v-btn value="deleted" prepend-icon="mdi-delete-outline"> Trashed </v-btn>
            </v-btn-toggle>
          </div>

          <v-data-table
            class="border rounded-md crud-tbl"
            :headers="headers"
            :items="rows"
            :loading="isLoading"
            item-value="id"
            :items-per-page="-1"
            hide-default-footer
          >
            <template #top>
              <v-toolbar flat elevation="0" class="border-bottom px-2">
                <v-toolbar-title></v-toolbar-title>
                <v-spacer />
                <v-btn
                  v-if="!isDeletedTenantList && canCreate"
                  color="success"
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

            <template #item.address="{ item }">
              {{ item.address || "—" }}
            </template>
            <template #item.description="{ item }">
              {{ item.description || "—" }}
            </template>
            <template #item.createdAt="{ item }">
              {{ item.createdAt ? new Date(item.createdAt).toLocaleString() : "—" }}
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex align-center justify-center">
                <v-menu
                  v-if="
                    (isDeletedTenantList && hasAnyDeletedAction) ||
                    (!isDeletedTenantList && hasAnyActiveAction)
                  "
                  location="bottom end"
                >
                  <template #activator="{ props }">
                    <v-btn icon size="small" variant="text" color="error" v-bind="props">
                      <v-icon size="18">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact" min-width="168" class="action-menu-compact">
                    <template v-if="isDeletedTenantList">
                      <v-list-item
                        v-if="hasPermission(permissionCodes, 'tenants.read')"
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
                        v-if="hasPermission(permissionCodes, 'tenants.read')"
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
              <div class="text-medium-emphasis py-4">No tenants to display.</div>
            </template>
          </v-data-table>

          <v-dialog v-model="createDialog" max-width="560">
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Create Tenant</v-card-title>
              <v-card-text class="pa-5">
                <v-alert
                  v-if="tenantFormError && createDialog"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  rounded="md"
                >
                  {{ tenantFormError }}
                </v-alert>
                <v-form
                  id="create-tenant-form"
                  ref="createTenantFormRef"
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
                      hint="Required, max 100 characters (unique in the system)"
                      persistent-hint
                      :rules="tenantCodeRules"
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
                      hint="Required, max 255 characters"
                      persistent-hint
                      :rules="tenantNameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="createForm.address"
                      label="Address"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Optional, max 255 characters"
                      persistent-hint
                      :rules="tenantAddressRules"
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
                      hint="Optional, max 255 characters"
                      persistent-hint
                      :rules="tenantDescriptionRules"
                      rows="2"
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
                  form="create-tenant-form"
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
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Detail Tenant</v-card-title>
              <v-card-text class="pa-5">
                <v-row dense>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Code</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedTenant?.code || "—" }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Name</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedTenant?.name || "—" }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Address</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedTenant?.address || "—" }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Description</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedTenant?.description || "—" }}
                  </v-col>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Created</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{
                      selectedTenant?.createdAt
                        ? new Date(selectedTenant.createdAt).toLocaleString()
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
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Update Tenant</v-card-title>
              <v-card-text class="pa-5">
                <v-alert
                  v-if="tenantFormError && editDialog"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  rounded="md"
                >
                  {{ tenantFormError }}
                </v-alert>
                <v-form id="edit-tenant-form" ref="editTenantFormRef" @submit.prevent="submitEdit">
                  <div class="mb-3">
                    <v-text-field
                      v-model="editForm.code"
                      label="Code"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Required, max 100 characters"
                      persistent-hint
                      :rules="tenantCodeRules"
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
                      hint="Required, max 255 characters"
                      persistent-hint
                      :rules="tenantNameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="editForm.address"
                      label="Address"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      hint="Optional, max 255 characters"
                      persistent-hint
                      :rules="tenantAddressRules"
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
                      hint="Optional, max 255 characters"
                      persistent-hint
                      :rules="tenantDescriptionRules"
                      rows="2"
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
                  form="edit-tenant-form"
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
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Delete Tenant</v-card-title>
              <v-card-text class="pa-5">
                Are you sure you want to delete tenant:
                <strong>{{ selectedTenant?.code || "—" }}</strong>
                ({{ selectedTenant?.name || "—" }})
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
                  You are about to permanently delete tenant
                  <strong>{{ selectedTenant?.code || "—" }}</strong>
                  ({{ selectedTenant?.name || "—" }}) from the database. This action cannot be undone.
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
