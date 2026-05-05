import { gql } from "@apollo/client/core";
import { gqlMutation, gqlQuery } from "./client";

type RoleListResponse = {
  rolesFindAll: Array<{
    id: number;
    code: string;
    name: string;
    description?: string | null;
    isActive: boolean;
  }>;
};

type RoleDetailResponse = {
  rolesFindOne: {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    permissions: Array<{ id: number; code: string }>;
  } | null;
};

type RoleDetailVariables = {
  id: number;
};

type AssignPermissionsResponse = {
  rolesAssignPermissions: {
    id: number;
    code: string;
    permissions: Array<{ id: number }>;
  } | null;
};

type AssignPermissionsVariables = {
  roleAssignPermissionsInput: {
    roleId: number;
    permissionIds: number[];
  };
};

const ROLES_QUERY = gql`
  query RolesFindAll {
    rolesFindAll {
      id
      code
      name
      description
      isActive
    }
  }
`;

const ROLE_ONE_QUERY = gql`
  query RolesFindOne($id: Int!) {
    rolesFindOne(id: $id) {
      id
      code
      name
      description
      isActive
      permissions {
        id
        code
      }
    }
  }
`;

const ROLES_ASSIGN_PERMISSIONS_MUTATION = gql`
  mutation RolesAssignPermissions($roleAssignPermissionsInput: RoleAssignPermissionsInput!) {
    rolesAssignPermissions(roleAssignPermissionsInput: $roleAssignPermissionsInput) {
      id
      code
      permissions {
        id
      }
    }
  }
`;

export const getRoles = async () => {
  return gqlQuery<RoleListResponse>(ROLES_QUERY);
};

export const getRoleById = async (id: number) => {
  return gqlQuery<RoleDetailResponse, RoleDetailVariables>(ROLE_ONE_QUERY, { id });
};

export const assignRolePermissions = async (roleId: number, permissionIds: number[]) => {
  return gqlMutation<AssignPermissionsResponse, AssignPermissionsVariables>(
    ROLES_ASSIGN_PERMISSIONS_MUTATION,
    {
      roleAssignPermissionsInput: {
        roleId,
        permissionIds,
      },
    },
  );
};
