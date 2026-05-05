import { getUserMe } from "./auth.service";

const SUPERADMIN_ROLE_CODE = "superadmin";
const ALL_PERMISSIONS = "*";

export type PermissionCode = string;

let cachedPermissionCodes: Set<PermissionCode> | null = null;
let cachePromise: Promise<Set<PermissionCode>> | null = null;

/**
 * Loads permission codes from `usersMe.roles[].permissions[]`.
 * Superadmin is treated as all permissions.
 */
export const getCurrentUserPermissionCodes = async (): Promise<Set<PermissionCode>> => {
  if (cachedPermissionCodes) {
    return new Set(cachedPermissionCodes);
  }
  if (cachePromise) {
    const fromPending = await cachePromise;
    return new Set(fromPending);
  }

  cachePromise = (async () => {
  const res = await getUserMe();
  const roles = res.data?.usersMe?.roles ?? [];

  const isSuperAdmin = roles.some(
    (r) => String(r?.code || "").toLowerCase() === SUPERADMIN_ROLE_CODE,
  );
  if (isSuperAdmin) {
    return new Set<PermissionCode>([ALL_PERMISSIONS]);
  }

  const permissionCodes = new Set<PermissionCode>();
  for (const role of roles) {
    for (const permission of role?.permissions ?? []) {
      const code = String(permission?.code || "").trim();
      if (code) permissionCodes.add(code);
    }
  }
  return permissionCodes;
  })();

  try {
    cachedPermissionCodes = await cachePromise;
    return new Set(cachedPermissionCodes);
  } finally {
    cachePromise = null;
  }
};

export const hasPermission = (
  permissionCodes: Set<PermissionCode>,
  requiredPermission?: PermissionCode,
): boolean => {
  if (!requiredPermission) return true;
  if (permissionCodes.has(ALL_PERMISSIONS)) return true;
  return permissionCodes.has(requiredPermission);
};

export const hasAnyPermission = (
  permissionCodes: Set<PermissionCode>,
  requiredPermissions: PermissionCode[],
): boolean => {
  if (permissionCodes.has(ALL_PERMISSIONS)) return true;
  return requiredPermissions.some((perm) => permissionCodes.has(perm));
};

export const clearUserPermissionsCache = () => {
  cachedPermissionCodes = null;
  cachePromise = null;
};
