import { gql } from "@apollo/client/core";
import { gqlMutation, gqlQuery } from "./client";

export type TenantRow = {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

type TenantsListResponse = {
  tenantsFindAll: TenantRow[];
};

type TenantsListVariables = {
  withDeleted?: boolean;
};

const TENANTS_FIND_ALL = gql`
  query TenantsFindAll($withDeleted: Boolean) {
    tenantsFindAll(withDeleted: $withDeleted) {
      id
      code
      name
      address
      description
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

type TenantOneResponse = {
  tenantsFindOne: TenantRow | null;
};

type TenantOneVariables = {
  id: string;
  withDeleted?: boolean;
};

const TENANT_ONE_QUERY = gql`
  query TenantsFindOne($id: ID!, $withDeleted: Boolean) {
    tenantsFindOne(id: $id, withDeleted: $withDeleted) {
      id
      code
      name
      address
      description
      createdAt
      updatedAt
      deletedAt
      users {
        id
      }
    }
  }
`;

type TenantCreateResponse = {
  tenantsCreate: TenantRow | null;
};

type TenantCreateVariables = {
  tenantCreateInput: {
    code: string;
    name: string;
    address?: string | null;
    description?: string | null;
  };
};

const TENANT_CREATE_MUTATION = gql`
  mutation TenantsCreate($tenantCreateInput: TenantCreateInput!) {
    tenantsCreate(tenantCreateInput: $tenantCreateInput) {
      id
      code
      name
    }
  }
`;

type TenantUpdateResponse = {
  tenantsUpdate: TenantRow | null;
};

type TenantUpdateVariables = {
  id: string;
  tenantUpdateInput: {
    code?: string;
    name?: string;
    address?: string | null;
    description?: string | null;
  };
};

const TENANT_UPDATE_MUTATION = gql`
  mutation TenantsUpdate($id: ID!, $tenantUpdateInput: TenantUpdateInput!) {
    tenantsUpdate(id: $id, tenantUpdateInput: $tenantUpdateInput) {
      id
      code
      name
    }
  }
`;

type TenantDeleteResponse = {
  tenantsDelete: boolean;
};

type TenantDeleteVariables = {
  tenantDeleteInput: { id: string };
};

const TENANT_DELETE_MUTATION = gql`
  mutation TenantsDelete($tenantDeleteInput: TenantDeleteInput!) {
    tenantsDelete(tenantDeleteInput: $tenantDeleteInput)
  }
`;

type TenantRestoreResponse = {
  tenantsRestore: TenantRow | null;
};

type TenantRestoreVariables = {
  tenantRestoreInput: { id: string };
};

const TENANT_RESTORE_MUTATION = gql`
  mutation TenantsRestore($tenantRestoreInput: TenantRestoreInput!) {
    tenantsRestore(tenantRestoreInput: $tenantRestoreInput) {
      id
      code
      name
    }
  }
`;

type TenantForceDeleteResponse = {
  tenantsForceDelete: boolean;
};

type TenantForceDeleteVariables = {
  id: string;
};

const TENANT_FORCE_DELETE_MUTATION = gql`
  mutation TenantsForceDelete($id: ID!) {
    tenantsForceDelete(id: $id)
  }
`;

export const getTenantsFindAll = async (withDeleted = false) => {
  return gqlQuery<TenantsListResponse, TenantsListVariables>(TENANTS_FIND_ALL, {
    withDeleted,
  });
};

export const getTenantById = async (id: string, withDeleted = false) => {
  return gqlQuery<TenantOneResponse, TenantOneVariables>(TENANT_ONE_QUERY, {
    id,
    withDeleted,
  });
};

export const createTenant = async (input: TenantCreateVariables["tenantCreateInput"]) => {
  return gqlMutation<TenantCreateResponse, TenantCreateVariables>(TENANT_CREATE_MUTATION, {
    tenantCreateInput: input,
  });
};

export const updateTenantById = async (
  id: string,
  input: TenantUpdateVariables["tenantUpdateInput"],
) => {
  return gqlMutation<TenantUpdateResponse, TenantUpdateVariables>(TENANT_UPDATE_MUTATION, {
    id,
    tenantUpdateInput: input,
  });
};

export const deleteTenantById = async (id: string) => {
  return gqlMutation<TenantDeleteResponse, TenantDeleteVariables>(TENANT_DELETE_MUTATION, {
    tenantDeleteInput: { id },
  });
};

export const restoreTenantById = async (id: string) => {
  return gqlMutation<TenantRestoreResponse, TenantRestoreVariables>(TENANT_RESTORE_MUTATION, {
    tenantRestoreInput: { id },
  });
};

export const forceDeleteTenantById = async (id: string) => {
  return gqlMutation<TenantForceDeleteResponse, TenantForceDeleteVariables>(
    TENANT_FORCE_DELETE_MUTATION,
    { id },
  );
};
