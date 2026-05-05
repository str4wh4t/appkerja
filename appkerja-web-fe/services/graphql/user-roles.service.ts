import { gql } from "@apollo/client/core";
import { gqlQuery } from "./client";

export type UserRoleRow = {
  id: number;
  userId: string;
  roleId: number;
  tenantId: string;
  createdAt: string;
  user?: {
    id?: string;
    username?: string | null;
    fullname?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  role?: {
    id?: number;
    name?: string | null;
    code?: string | null;
  } | null;
};

type UserRolesPaginatedResponse = {
  userRolesFindAllPaginated: {
    data: UserRoleRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

type UserRolesPaginatedVariables = {
  paginationInput: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    descending?: boolean;
    userId?: string;
    roleId?: number;
  };
};

const USER_ROLES_PAGINATED_QUERY = gql`
  query UserRolesFindAllPaginated($paginationInput: UserRolePaginationInput) {
    userRolesFindAllPaginated(paginationInput: $paginationInput) {
      data {
        id
        userId
        roleId
        tenantId
        createdAt
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
      total
      page
      limit
      totalPages
      hasNextPage
    }
  }
`;

/** Max `limit` per request is 100 (backend `UserRolePaginationInput` @Max(100)). */
export const getUserRolesPaginated = async (
  page = 1,
  limit = 100,
  search?: string,
  sortBy = "id",
  descending = false,
) => {
  return gqlQuery<UserRolesPaginatedResponse, UserRolesPaginatedVariables>(
    USER_ROLES_PAGINATED_QUERY,
    {
      paginationInput: {
        page,
        limit,
        search: search?.trim() || undefined,
        sortBy,
        descending,
      },
    },
  );
};
