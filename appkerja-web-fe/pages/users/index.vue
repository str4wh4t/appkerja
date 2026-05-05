<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  assignUserRolesById,
  createUser,
  getUserById,
  getUserStatuses,
  getUsersPaginated,
  forceDeleteUserById,
  deleteUserById,
  resetUserPasswordById,
  restoreUserById,
  updateUserById,
} from "@/services/graphql/users.service";
import { impersonateUser } from "@/services/graphql/auth.service";
import { getRoles } from "@/services/graphql/roles.service";
import {
  getCurrentUserPermissionCodes,
  hasAnyPermission,
  hasPermission,
} from "@/services/graphql/user-permissions.service";

definePageMeta({
  middleware: ["auth"],
});

type UserRow = {
  id?: string;
  username?: string;
  email?: string;
  fullname?: string | null;
  phone?: string | null;
  isEmailVerified?: boolean;
  lastLoginAt?: string | null;
  status?: { name?: string | null } | null;
  roles?: Array<{ id?: number; name?: string; code?: string }> | null;
};

const isLoading = ref(false);
const errorMessage = ref("");
const rows = ref<UserRow[]>([]);
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const tableSearch = ref("");
const roleFilterMenu = ref(false);
const selectedRoleFilterIds = ref<number[]>([]);
const draftRoleFilterIds = ref<number[]>([]);
const selectedUserStatusFilterIds = ref<number[]>([]);
const draftUserStatusFilterIds = ref<number[]>([]);
const sortBy = ref("createdAt");
const descending = ref(true);
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const actionLoading = ref(false);
const actionError = ref("");
const successSnackbar = ref(false);
const successMessage = ref("");
const createDialog = ref(false);
const viewDialog = ref(false);
const editDialog = ref(false);
const createUserFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const editUserFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const firstNameRules = [
  (v: string) => !!String(v || "").trim() || "First name is required",
  (v: string) =>
    String(v || "").trim().length <= 255 || "First name must be at most 255 characters",
];

const lastNameRules = [
  (v: string) =>
    String(v || "").trim().length <= 255 || "Last name must be at most 255 characters",
];

const phoneRules = [
  (v: string) => !!String(v || "").trim() || "Phone is required",
  (v: string) =>
    String(v || "").trim().length >= 8 || "Phone must be at least 8 characters",
  (v: string) =>
    String(v || "").trim().length <= 20 || "Phone must be at most 20 characters",
  (v: string) =>
    /^\+?[0-9][0-9\s-]{7,19}$/.test(String(v || "").trim()) ||
    "Invalid phone number",
];

const usernameRules = [
  (v: string) => !!String(v || "").trim() || "Username is required",
  (v: string) =>
    String(v || "").trim().length >= 3 || "Username must be at least 3 characters",
  (v: string) =>
    String(v || "").trim().length <= 100 || "Username must be at most 100 characters",
  (v: string) =>
    /^[a-zA-Z0-9._-]+$/.test(String(v || "").trim()) ||
    "Only letters, numbers, dot, underscore, hyphen",
];

const emailRules = [
  (v: string) => !!String(v || "").trim() || "Email is required",
  (v: string) => {
    const s = String(v || "").trim();
    if (!s) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) || "Enter a valid email address";
  },
];
const deleteDialog = ref(false);
const forceDeleteDialog = ref(false);
const selectedUser = ref<UserRow | null>(null);
const roleOptions = ref<Array<{ title: string; value: number }>>([]);
const statusOptions = ref<Array<{ title: string; value: number }>>([]);
const editForm = ref({
  firstName: "",
  lastName: "",
  phone: "",
  statusId: 1,
  roleIds: [] as number[],
});
const createForm = ref({
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  statusId: 1,
  roleIds: [] as number[],
});
const headers = ref([
  { title: "Name", key: "fullname" },
  { title: "Username", key: "username" },
  { title: "Email", key: "email" },
  { title: "Status", key: "statusName" },
  { title: "Roles", key: "rolesText", sortable: false },
  { title: "Actions", key: "actions", sortable: false, align: "center" as const },
]);
const activeFilterCount = computed(
  () => selectedRoleFilterIds.value.length + selectedUserStatusFilterIds.value.length,
);

/** `active` = not soft-deleted; `deleted` = trashed (soft-deleted). */
const userListScope = ref<"active" | "deleted">("active");
const isDeletedUserList = computed(() => userListScope.value === "deleted");
const permissionCodes = ref<Set<string>>(new Set());
const canCreate = computed(() => hasPermission(permissionCodes.value, "users.create"));
const canUpdate = computed(() => hasPermission(permissionCodes.value, "users.update"));
const canDelete = computed(() => hasPermission(permissionCodes.value, "users.delete"));
const canRestore = computed(() => hasPermission(permissionCodes.value, "users.restore"));
const canForceDelete = computed(() =>
  hasPermission(permissionCodes.value, "users.force_delete"),
);
const canImpersonate = computed(() =>
  hasPermission(permissionCodes.value, "users.impersonate"),
);
const hasAnyActiveAction = computed(() =>
  hasAnyPermission(permissionCodes.value, [
    "users.read",
    "users.update",
    "users.delete",
    "users.impersonate",
  ]),
);
const hasAnyDeletedAction = computed(() =>
  hasAnyPermission(permissionCodes.value, [
    "users.read",
    "users.restore",
    "users.force_delete",
  ]),
);

const selectedUserInitial = computed(() => {
  const fullName = selectedUser.value?.fullname?.trim();
  if (fullName) {
    return fullName.charAt(0).toUpperCase();
  }
  const username = selectedUser.value?.username?.trim();
  if (username) {
    return username.charAt(0).toUpperCase();
  }
  return "U";
});
const tableRows = computed(() =>
  rows.value.map((user) => ({
    ...user,
    statusName: user.status?.name || "-",
    rolesText: (user.roles || []).map((r) => r.name || "-").join(", ") || "-",
  })),
);

const loadUsers = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await getUsersPaginated(
      page.value,
      limit.value,
      String(tableSearch.value || "").trim(),
      sortBy.value,
      descending.value,
      selectedRoleFilterIds.value,
      selectedUserStatusFilterIds.value,
      isDeletedUserList.value,
    );
    const payload = response.data?.usersFindAllPaginated;
    rows.value = payload?.data ?? [];
    total.value = payload?.total ?? 0;
  } catch (error: any) {
    errorMessage.value = error?.message || "Failed to load users.";
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
    await loadUsers();
  }, 350);
};

const openRoleFilterMenu = () => {
  draftRoleFilterIds.value = [...selectedRoleFilterIds.value];
  draftUserStatusFilterIds.value = [...selectedUserStatusFilterIds.value];
};

const applyRoleFilter = async () => {
  selectedRoleFilterIds.value = Array.from(
    new Set(
      (draftRoleFilterIds.value || [])
        .map((roleId) => Number(roleId))
        .filter((roleId) => Number.isFinite(roleId) && roleId > 0),
    ),
  );
  selectedUserStatusFilterIds.value = Array.from(
    new Set(
      (draftUserStatusFilterIds.value || [])
        .map((statusId) => Number(statusId))
        .filter((statusId) => Number.isFinite(statusId) && statusId > 0),
    ),
  );
  roleFilterMenu.value = false;
  page.value = 1;
  await loadUsers();
};

const clearRoleFilter = async () => {
  draftRoleFilterIds.value = [];
  draftUserStatusFilterIds.value = [];
  selectedRoleFilterIds.value = [];
  selectedUserStatusFilterIds.value = [];
  roleFilterMenu.value = false;
  page.value = 1;
  await loadUsers();
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
  const nextSortBy = firstSort?.key || "createdAt";
  const nextDescending = firstSort?.order === "desc";
  if (nextSortBy !== sortBy.value || nextDescending !== descending.value) {
    sortBy.value = nextSortBy;
    descending.value = nextDescending;
    shouldReload = true;
  }

  if (shouldReload) {
    await loadUsers();
  }
};

const handleView = (id: string) => {
  openViewDialog(id);
};

const handleEdit = (id: string) => {
  openEditDialog(id);
};

const canEditRow = (item: UserRow & { statusName?: string | null }) => {
  const statusName = String(item?.statusName ?? item?.status?.name ?? "").trim().toLowerCase();
  return canUpdate.value && statusName !== "inactive";
};

const handleDelete = (id: string) => {
  selectedUser.value = rows.value.find((u) => String(u.id) === id) ?? null;
  actionError.value = "";
  deleteDialog.value = true;
};

const handleForceDeleteOpen = (id: string) => {
  selectedUser.value = rows.value.find((u) => String(u.id) === id) ?? null;
  actionError.value = "";
  forceDeleteDialog.value = true;
};

const handleResetPassword = async (id: string) => {
  if (!id) return;
  await resetPasswordById(id);
};

watch(userListScope, async () => {
  page.value = 1;
  await loadUsers();
});

const openViewFromRow = (item: UserRow & { statusName?: string; rolesText?: string }) => {
  selectedUser.value = {
    id: item.id,
    username: item.username,
    email: item.email,
    fullname: item.fullname,
    phone: item.phone,
    isEmailVerified: item.isEmailVerified,
    lastLoginAt: item.lastLoginAt,
    status: item.status,
    roles: item.roles,
  };
  actionError.value = "";
  viewDialog.value = true;
};

const handleRestoreUser = async (id: string) => {
  if (!id) return;
  actionLoading.value = true;
  actionError.value = "";
  try {
    const res = await restoreUserById(id);
    if (!res.data?.usersRestore?.id) {
      throw new Error("Failed to restore user.");
    }
    successMessage.value = "User has been restored.";
    successSnackbar.value = true;
    await loadUsers();
  } catch (error: any) {
    actionError.value = error?.message || "Failed to restore user.";
  } finally {
    actionLoading.value = false;
  }
};

const handleImpersonate = async (id: string) => {
  if (!id) return;
  actionLoading.value = true;
  actionError.value = "";
  try {
    const response = await impersonateUser(id);
    const auth = response.data?.usersImpersonate;
    if (!auth?.access_token || !auth?.refresh_token) {
      throw new Error("Impersonation token is invalid.");
    }
    localStorage.setItem("accessToken", auth.access_token);
    localStorage.setItem("refreshToken", auth.refresh_token);
    successMessage.value = "User impersonation started.";
    successSnackbar.value = true;
    window.location.reload();
  } catch (error: any) {
    actionError.value = error?.message || "Failed to impersonate user.";
  } finally {
    actionLoading.value = false;
  }
};

const openCreateDialog = () => {
  actionError.value = "";
  createForm.value = {
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    statusId: statusOptions.value[0]?.value || 1,
    roleIds: [],
  };
  createDialog.value = true;
};

const openViewDialog = async (id: string) => {
  actionLoading.value = true;
  actionError.value = "";
  try {
    const response = await getUserById(id, isDeletedUserList.value);
    const detail = response.data?.usersFindOne;
    if (!detail) {
      throw new Error("User not found.");
    }
    selectedUser.value = detail;
    viewDialog.value = true;
  } catch (error: any) {
    actionError.value = error?.message || "Failed to load user details.";
  } finally {
    actionLoading.value = false;
  }
};

const openEditDialog = async (id: string) => {
  actionLoading.value = true;
  actionError.value = "";
  try {
    const response = await getUserById(id);
    const detail = response.data?.usersFindOne;
    if (!detail) {
      throw new Error("User not found.");
    }
    selectedUser.value = detail;
    editForm.value = {
      firstName: detail.firstName || "",
      lastName: detail.lastName || "",
      phone: detail.phone || "",
      statusId: detail.statusId || 1,
      roleIds: (detail.roles || []).map((role) => Number(role.id)).filter((roleId) => Number.isFinite(roleId)),
    };
    editDialog.value = true;
  } catch (error: any) {
    actionError.value = error?.message || "Failed to load user for editing.";
  } finally {
    actionLoading.value = false;
  }
};

const loadRoleOptions = async () => {
  try {
    const response = await getRoles();
    const roles = response.data?.rolesFindAll || [];
    roleOptions.value = roles
      .filter((role) => role.isActive)
      .map((role) => ({
        title: role.name || "-",
        value: Number(role.id),
      }));
  } catch (error) {
    roleOptions.value = [];
  }
};

const loadStatusOptions = async () => {
  try {
    const response = await getUserStatuses();
    const statuses = response.data?.usersStatusesFindAll || [];
    statusOptions.value = statuses
      .filter((status) => status.isActive)
      .map((status) => ({
        title: status.name || "-",
        value: Number(status.id),
      }));
  } catch (error) {
    statusOptions.value = [];
  }
};

const submitEdit = async () => {
  if (!selectedUser.value?.id) return;
  const form = editUserFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }
  const firstTrim = editForm.value.firstName.trim();
  const phoneTrim = editForm.value.phone.trim();
  actionLoading.value = true;
  actionError.value = "";
  try {
    const sanitizedRoleIds = Array.from(
      new Set(
        (editForm.value.roleIds || [])
          .map((roleId) => Number(roleId))
          .filter((roleId) => Number.isFinite(roleId) && roleId > 0),
      ),
    );

    await updateUserById(String(selectedUser.value.id), {
      firstName: firstTrim,
      lastName: editForm.value.lastName.trim() || undefined,
      phone: phoneTrim,
      statusId: Number(editForm.value.statusId) || undefined,
    });

    await assignUserRolesById(String(selectedUser.value.id), sanitizedRoleIds);

    successMessage.value = "User has been updated.";
    successSnackbar.value = true;
    editDialog.value = false;
    await loadUsers();
  } catch (error: any) {
    actionError.value = error?.message || "Failed to update user.";
  } finally {
    actionLoading.value = false;
  }
};

const submitCreate = async () => {
  const form = createUserFormRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) {
      return;
    }
  }
  const firstTrim = createForm.value.firstName.trim();
  const phoneTrim = createForm.value.phone.trim();
  actionLoading.value = true;
  actionError.value = "";
  try {
    const sanitizedRoleIds = Array.from(
      new Set(
        (createForm.value.roleIds || [])
          .map((roleId) => Number(roleId))
          .filter((roleId) => Number.isFinite(roleId) && roleId > 0),
      ),
    );

    await createUser({
      username: createForm.value.username.trim(),
      email: createForm.value.email.trim(),
      firstName: firstTrim,
      lastName: createForm.value.lastName.trim() || undefined,
      phone: phoneTrim,
      statusId: Number(createForm.value.statusId) || undefined,
      roleIds: sanitizedRoleIds.length ? sanitizedRoleIds : undefined,
    });

    createDialog.value = false;
    successMessage.value = "User has been created.";
    successSnackbar.value = true;
    await loadUsers();
  } catch (error: any) {
    actionError.value = error?.message || "Failed to create user.";
  } finally {
    actionLoading.value = false;
  }
};

const confirmDelete = async () => {
  if (!selectedUser.value?.id) return;
  actionLoading.value = true;
  actionError.value = "";
  try {
    await deleteUserById(String(selectedUser.value.id));
    deleteDialog.value = false;
    await loadUsers();
  } catch (error: any) {
    actionError.value = error?.message || "Failed to delete user.";
  } finally {
    actionLoading.value = false;
  }
};

const confirmForceDelete = async () => {
  if (!selectedUser.value?.id) return;
  actionLoading.value = true;
  actionError.value = "";
  try {
    const res = await forceDeleteUserById(String(selectedUser.value.id));
    if (!res.data?.usersForceDelete) {
      throw new Error("Failed to force delete user.");
    }
    forceDeleteDialog.value = false;
    successMessage.value = "User has been permanently deleted.";
    successSnackbar.value = true;
    await loadUsers();
  } catch (error: any) {
    actionError.value = error?.message || "Failed to force delete user.";
  } finally {
    actionLoading.value = false;
  }
};

const resetPasswordById = async (id: string) => {
  if (!id) return;
  actionLoading.value = true;
  actionError.value = "";
  try {
    await resetUserPasswordById(String(id));
    successMessage.value = "User password has been reset.";
    successSnackbar.value = true;
    await loadUsers();
  } catch (error: any) {
    actionError.value = error?.message || "Failed to reset user password.";
  } finally {
    actionLoading.value = false;
  }
};

const resetPassword = async () => {
  if (!selectedUser.value?.id) return;
  await resetPasswordById(String(selectedUser.value.id));
};

onMounted(async () => {
  permissionCodes.value = await getCurrentUserPermissionCodes();
  await Promise.all([loadUsers(), loadRoleOptions(), loadStatusOptions()]);
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
          <h3 class="text-h4 font-weight-bold mb-2">Users</h3>
          <p class="text-subtitle-1 text-medium-emphasis mb-4">
            Users for the active tenant context, including roles.
          </p>

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>
          <v-alert
            v-if="actionError && !createDialog && !editDialog"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ actionError }}
          </v-alert>

          <div class="d-flex flex-wrap align-center justify-center ga-3 mb-4">
            <v-btn-toggle
              v-model="userListScope"
              mandatory
              divided
              variant="outlined"
              color="primary"
            >
              <v-btn value="active" prepend-icon="mdi-account-outline"> All </v-btn>
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
                <v-menu
                  v-model="roleFilterMenu"
                  location="bottom end"
                  :close-on-content-click="false"
                >
                  <template #activator="{ props }">
                    <v-badge
                      :model-value="activeFilterCount > 0"
                      :content="activeFilterCount"
                      color="error"
                      location="top right"
                      offset-x="1"
                      offset-y="1"
                    >
                      <v-btn
                        v-bind="props"
                        color="primary"
                        class="ml-3"
                        prepend-icon="mdi-filter-variant"
                        variant="tonal"
                        density="compact"
                        height="40"
                        @click="openRoleFilterMenu"
                      >
                        Filter
                      </v-btn>
                    </v-badge>
                  </template>
                  <v-card min-width="320">
                    <v-card-title class="text-subtitle-1 pa-5 border-b bg-primary text-white">
                      Filter Users
                    </v-card-title>
                    <v-card-text class="pa-5">
                      <div class="mb-3">
                        <v-select
                          v-model="draftUserStatusFilterIds"
                          label="Status"
                          :items="statusOptions"
                          item-title="title"
                          item-value="value"
                          variant="outlined"
                          density="compact"
                          color="primary"
                          hide-details="auto"
                          multiple
                          clearable
                        />
                      </div>
                      <div class="mb-3">
                        <v-select
                          v-model="draftRoleFilterIds"
                          label="Roles"
                          :items="roleOptions"
                          item-title="title"
                          item-value="value"
                          variant="outlined"
                          density="compact"
                          color="primary"
                          hide-details="auto"
                          multiple
                          clearable
                        />
                      </div>
                    </v-card-text>
                    <v-card-actions class="pa-5 border-t">
                      <v-spacer />
                      <v-btn variant="text" @click="clearRoleFilter">Clear</v-btn>
                      <v-btn color="primary" variant="tonal" @click="applyRoleFilter">
                        Apply
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
                <v-btn
                  v-if="!isDeletedUserList && canCreate"
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
            <template #item.fullname="{ item }">
              {{ item.fullname || "-" }}
            </template>
            <template #item.statusName="{ item }">
              <span
                class="font-weight-medium"
                :class="{
                  'text-success': item.statusName?.toLowerCase() === 'active',
                }"
              >
                {{ item.statusName || "-" }}
              </span>
            </template>
            <template #item.actions="{ item }">
              <div class="d-flex align-center justify-center">
                <v-menu
                  v-if="
                    (isDeletedUserList && hasAnyDeletedAction) ||
                    (!isDeletedUserList && hasAnyActiveAction)
                  "
                  location="bottom end"
                >
                  <template #activator="{ props }">
                    <v-btn icon size="small" variant="text" color="error" v-bind="props">
                      <v-icon size="18">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact" min-width="168" class="action-menu-compact">
                    <template v-if="isDeletedUserList">
                      <v-list-item
                        v-if="hasPermission(permissionCodes, 'users.read')"
                        density="compact"
                        min-height="30"
                        @click="openViewFromRow(item)"
                      >
                        <template #prepend><v-icon size="16" color="info">mdi-eye</v-icon></template>
                        <v-list-item-title>View</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="canRestore" density="compact" min-height="30" @click="handleRestoreUser(String(item.id || ''))">
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
                        v-if="hasPermission(permissionCodes, 'users.read')"
                        density="compact"
                        min-height="30"
                        @click="handleView(String(item.id || ''))"
                      >
                        <template #prepend><v-icon size="16" color="info">mdi-eye</v-icon></template>
                        <v-list-item-title>View</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="canEditRow(item)" density="compact" min-height="30" @click="handleEdit(String(item.id || ''))">
                        <template #prepend><v-icon size="16" color="warning">mdi-pencil</v-icon></template>
                        <v-list-item-title>Update</v-list-item-title>
                      </v-list-item>
                      <v-list-item v-if="canImpersonate" density="compact" min-height="30" @click="handleImpersonate(String(item.id || ''))">
                        <template #prepend><v-icon size="16" color="primary">mdi-account-lock-open-outline</v-icon></template>
                        <v-list-item-title>Impersonate</v-list-item-title>
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
              <div class="text-medium-emphasis py-4">No users to display.</div>
            </template>
          </v-data-table-server>

          <v-dialog v-model="createDialog" max-width="620">
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Create User</v-card-title>
              <v-card-text class="pa-5">
                <v-alert
                  v-if="actionError && createDialog"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  rounded="md"
                >
                  {{ actionError }}
                </v-alert>
                <v-form
                  id="create-user-form"
                  ref="createUserFormRef"
                  validate-on="input lazy"
                  @submit.prevent="submitCreate"
                >
                  <div class="mb-3">
                    <v-text-field
                      v-model="createForm.username"
                      label="Username"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      autocomplete="username"
                      hint="3–100 characters: letters, numbers, . _ -"
                      persistent-hint
                      :rules="usernameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="createForm.email"
                      label="Email"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      type="email"
                      autocomplete="email"
                      :rules="emailRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="createForm.firstName"
                      label="First name"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      autocomplete="given-name"
                      hint="Required"
                      persistent-hint
                      :rules="firstNameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="createForm.lastName"
                      label="Last name"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      autocomplete="family-name"
                      hint=""
                      persistent-hint
                      :rules="lastNameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="createForm.phone"
                      label="Phone"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      autocomplete="tel"
                      hint="Required, at least 8 characters"
                      persistent-hint
                      :rules="phoneRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-select
                      v-model="createForm.statusId"
                      label="Status"
                      :items="statusOptions"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    />
                  </div>
                  <div class="mb-3">
                    <v-select
                      v-model="createForm.roleIds"
                      label="Roles"
                      :items="roleOptions"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      multiple
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
                  form="create-user-form"
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
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Detail User</v-card-title>
              <v-card-text class="pa-5">
                <div class="d-flex align-center ga-3 mb-5">
                  <v-avatar color="primary" size="56" variant="tonal">
                    <span class="text-h6 font-weight-bold">{{ selectedUserInitial }}</span>
                  </v-avatar>
                  <div>
                    <div class="text-body-1 font-weight-bold">
                      {{ selectedUser?.username || "-" }}
                    </div>
                    <div class="text-body-1 text-medium-emphasis">
                      {{ selectedUser?.email || "-" }}
                    </div>
                  </div>
                </div>

                <v-row dense>
                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Full name</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedUser?.fullname || "-" }}
                  </v-col>

                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Phone</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedUser?.phone || "-" }}
                  </v-col>

                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Email Verified</v-col>
                  <v-col
                    cols="8"
                    class="text-body-1 font-weight-medium detail-row"
                    :class="{ 'text-success': selectedUser?.isEmailVerified }"
                  >
                    {{ selectedUser?.isEmailVerified ? "Yes" : "No" }}
                  </v-col>

                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Status</v-col>
                  <v-col
                    cols="8"
                    class="text-body-1 font-weight-medium detail-row"
                    :class="{
                      'text-success': selectedUser?.status?.name?.toLowerCase() === 'active',
                    }"
                  >
                    {{ selectedUser?.status?.name || "-" }}
                  </v-col>

                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Last Login At</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ selectedUser?.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : "-" }}
                  </v-col>

                  <v-col cols="4" class="text-body-1 text-medium-emphasis detail-row">Roles</v-col>
                  <v-col cols="8" class="text-body-1 font-weight-medium detail-row">
                    {{ (selectedUser?.roles || []).map((role) => role.name || "-").join(", ") || "-" }}
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="pa-5 border-t">
                <v-spacer />
                <v-btn
                  v-if="!isDeletedUserList && canUpdate"
                  color="warning"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  :loading="actionLoading"
                  @click="resetPassword"
                >
                  Reset Password
                </v-btn>
                <v-btn color="secondary" variant="tonal" class="px-4 rounded-pill" @click="viewDialog = false">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="editDialog" max-width="560">
            <v-card>
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Update User</v-card-title>
              <v-card-text class="pa-5">
                <v-alert
                  v-if="actionError && editDialog"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                  rounded="md"
                >
                  {{ actionError }}
                </v-alert>
                <v-form
                  id="edit-user-form"
                  ref="editUserFormRef"
                  validate-on="input lazy"
                  @submit.prevent="submitEdit"
                >
                  <div class="mb-3">
                    <v-text-field
                      v-model="editForm.firstName"
                      label="First name"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      autocomplete="given-name"
                      hint="Required"
                      persistent-hint
                      :rules="firstNameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="editForm.lastName"
                      label="Last name"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      autocomplete="family-name"
                      hint=""
                      persistent-hint
                      :rules="lastNameRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-text-field
                      v-model="editForm.phone"
                      label="Phone"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      autocomplete="tel"
                      hint="Required, at least 8 characters"
                      persistent-hint
                      :rules="phoneRules"
                    />
                  </div>
                  <div class="mb-3">
                    <v-select
                      v-model="editForm.statusId"
                      label="Status"
                      :items="statusOptions"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                    />
                  </div>
                  <div class="mb-3">
                    <v-select
                      v-model="editForm.roleIds"
                      label="Roles"
                      :items="roleOptions"
                      item-title="title"
                      item-value="value"
                      color="primary"
                      variant="outlined"
                      density="compact"
                      hide-details="auto"
                      multiple
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
                  form="edit-user-form"
                  :loading="actionLoading"
                >
                  Save
                </v-btn>
                <v-btn
                  v-if="canUpdate"
                  color="warning"
                  variant="tonal"
                  class="px-4 rounded-pill"
                  :loading="actionLoading"
                  @click="resetPassword"
                >
                  Reset Password
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
              <v-card-title class="text-h6 pa-5 border-b bg-primary text-white">Delete User</v-card-title>
              <v-card-text class="pa-5">
                Are you sure you want to delete user
                <strong>{{ selectedUser?.username || "-" }}</strong>?
              </v-card-text>
              <v-card-actions class="pa-5 border-t">
                <v-spacer />
                <v-btn color="warning" variant="tonal" class="px-4 rounded-pill" :loading="actionLoading" @click="confirmDelete">
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
                  You are about to permanently delete user
                  <strong>{{ selectedUser?.username || "—" }}</strong>
                  from the database. This action cannot be undone.
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
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.detail-row {
  padding-bottom: 10px;
}

.action-menu-compact :deep(.v-list-item-title) {
  font-size: 0.8125rem;
  line-height: 1.2;
}
</style>
