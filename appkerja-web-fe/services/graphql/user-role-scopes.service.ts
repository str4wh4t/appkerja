import { gql } from "@apollo/client/core";
import { gqlMutation, gqlQuery } from "./client";
import type { UserRoleRow } from "./user-roles.service";

export type UserRoleScopeRow = {
  id: number;
  userRoleId: number;
  scopeType: string;
  scopeId: string;
  scope?: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  userRole: UserRoleRow & {
    userRoleScopes?: unknown;
  };
};

type ScopesPaginatedResponse = {
  userRoleScopesFindAllPaginated: {
    data: UserRoleScopeRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type ScopesPaginatedVariables = {
  paginationInput: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    descending?: boolean;
  };
};

const SCOPES_PAGINATED_QUERY = gql`
  query UserRoleScopesFindAllPaginated($paginationInput: UserRoleScopePaginationInput) {
    userRoleScopesFindAllPaginated(paginationInput: $paginationInput) {
      data {
        id
        userRoleId
        scopeType
        scopeId
        scope
        tenantId
        createdAt
        updatedAt
        userRole {
          id
          userId
          roleId
          tenantId
          user {
            id
            username
            fullname
            firstName
            lastName
          }
          role {
            id
            name
            code
          }
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

type ScopeOneResponse = {
  userRoleScopesFindOne: UserRoleScopeRow | null;
};

const SCOPE_ONE_QUERY = gql`
  query UserRoleScopesFindOne($id: Int!) {
    userRoleScopesFindOne(id: $id) {
      id
      userRoleId
      scopeType
      scopeId
      scope
      tenantId
      createdAt
      updatedAt
      userRole {
        id
        userId
        roleId
        user {
          id
          username
          fullname
          firstName
          lastName
        }
        role {
          id
          name
          code
        }
      }
    }
  }
`;

type CreateScopeResponse = {
  userRoleScopesCreate: UserRoleScopeRow;
};

type CreateScopeVariables = {
  userRoleScopeCreateInput: {
    userRoleId: number;
    scopeType: string;
    scopeId: string;
  };
};

const SCOPE_CREATE_MUTATION = gql`
  mutation UserRoleScopesCreate($userRoleScopeCreateInput: UserRoleScopeCreateInput!) {
    userRoleScopesCreate(userRoleScopeCreateInput: $userRoleScopeCreateInput) {
      id
      userRoleId
      scopeType
      scopeId
    }
  }
`;

type UpdateScopeResponse = {
  userRoleScopesUpdate: UserRoleScopeRow | null;
};

type UpdateScopeVariables = {
  id: number;
  userRoleScopeUpdateInput: {
    userRoleId?: number;
    scopeType?: string;
    scopeId?: string;
  };
};

const SCOPE_UPDATE_MUTATION = gql`
  mutation UserRoleScopesUpdate($id: Int!, $userRoleScopeUpdateInput: UserRoleScopeUpdateInput!) {
    userRoleScopesUpdate(id: $id, userRoleScopeUpdateInput: $userRoleScopeUpdateInput) {
      id
      userRoleId
      scopeType
      scopeId
    }
  }
`;

export type RemoveUserRoleScopeResponse = {
  userRoleScopesRemove: boolean;
};

const SCOPE_REMOVE_MUTATION = gql`
  mutation UserRoleScopesRemove($id: Int!) {
    userRoleScopesRemove(id: $id)
  }
`;

export const getUserRoleScopesPaginated = async (
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
  descending?: boolean,
) => {
  return gqlQuery<ScopesPaginatedResponse, ScopesPaginatedVariables>(
    SCOPES_PAGINATED_QUERY,
    {
      paginationInput: {
        page,
        limit,
        search: search?.trim() || undefined,
        sortBy: sortBy || undefined,
        descending,
      },
    },
  );
};

export const getUserRoleScopeById = async (id: number) => {
  return gqlQuery<ScopeOneResponse, { id: number }>(SCOPE_ONE_QUERY, { id });
};

export const createUserRoleScope = async (input: CreateScopeVariables["userRoleScopeCreateInput"]) => {
  return gqlMutation<CreateScopeResponse, CreateScopeVariables>(SCOPE_CREATE_MUTATION, {
    userRoleScopeCreateInput: input,
  });
};

export const updateUserRoleScopeById = async (
  id: number,
  input: UpdateScopeVariables["userRoleScopeUpdateInput"],
) => {
  return gqlMutation<UpdateScopeResponse, UpdateScopeVariables>(SCOPE_UPDATE_MUTATION, {
    id,
    userRoleScopeUpdateInput: input,
  });
};

export const removeUserRoleScopeById = async (id: number) => {
  return gqlMutation<RemoveUserRoleScopeResponse, { id: number }>(SCOPE_REMOVE_MUTATION, { id });
};
