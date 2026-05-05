import { gql } from "@apollo/client/core";
import { gqlMutation, gqlQuery } from "./client";
import { gqlMultipartMutate } from "./multipart-mutate";

type UserListResponse = {
  usersFindAllPaginated: {
    data: Array<{
      id: string;
      username: string;
      email: string;
      fullname?: string | null;
      status?: { name?: string | null } | null;
      roles?: Array<{ id: number; name: string; code: string }> | null;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type UserStatusesResponse = {
  usersStatusesFindAll: Array<{
    id: number;
    code: string;
    name: string;
    isActive: boolean;
  }>;
};

type UserListVariables = {
  paginationInput: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    descending?: boolean;
    roleIds?: number[];
    userStatusIds?: number[];
    withDeleted?: boolean;
  };
};

const USERS_PAGINATED_QUERY = gql`
  query UsersFindAllPaginated($paginationInput: UserPaginationInput) {
    usersFindAllPaginated(paginationInput: $paginationInput) {
      data {
        id
        username
        email
        fullname
        status {
          name
        }
        roles {
          id
          name
          code
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

const USER_STATUSES_QUERY = gql`
  query UsersStatusesFindAll {
    usersStatusesFindAll {
      id
      code
      name
      isActive
    }
  }
`;

type UserDetailResponse = {
  usersFindOne: {
    id: string;
    username: string;
    email: string;
    fullname?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    isEmailVerified?: boolean;
    lastLoginAt?: string | null;
    statusId?: number;
    status?: { id?: number; name?: string | null } | null;
    roles?: Array<{ id?: number; name?: string; code?: string }> | null;
  } | null;
};

type UserDetailVariables = {
  id: string;
  withDeleted?: boolean;
};

type UpdateUserResponse = {
  usersUpdate: {
    id: string;
  } | null;
};

type CreateUserResponse = {
  usersCreate: {
    id: string;
  } | null;
};

type AssignRolesResponse = {
  usersAssignRoles: {
    id: string;
  } | null;
};

type ResetPasswordResponse = {
  usersResetPassword: {
    id: string;
  } | null;
};

type UpdateUserVariables = {
  id: string;
  userUpdateInput: {
    firstName?: string;
    lastName?: string | null;
    phone?: string;
    statusId?: number;
  };
};

type AssignRolesVariables = {
  userAssignRolesInput: {
    userId: string;
    roleIds: number[];
  };
};

type CreateUserVariables = {
  userCreateInput: {
    username: string;
    email: string;
    firstName: string;
    lastName?: string;
    phone: string;
    statusId?: number;
    roleIds?: number[];
  };
};

type DeleteUserResponse = {
  usersDelete: boolean;
};

type DeleteUserVariables = {
  id: string;
};

type RestoreUserResponse = {
  usersRestore: { id: string } | null;
};

type RestoreUserVariables = {
  id: string;
};

type ForceDeleteUserResponse = {
  usersForceDelete: boolean;
};

type ForceDeleteUserVariables = {
  id: string;
};

type ResetPasswordVariables = {
  id: string;
};

const USER_DETAIL_QUERY = gql`
  query UsersFindOne($id: ID, $withDeleted: Boolean) {
    usersFindOne(id: $id, withDeleted: $withDeleted) {
      id
      username
      email
      fullname
      firstName
      lastName
      phone
      isEmailVerified
      lastLoginAt
      statusId
      status {
        id
        name
      }
      roles {
        id
        name
        code
      }
    }
  }
`;

const USER_UPDATE_MUTATION = gql`
  mutation UsersUpdate($id: ID!, $userUpdateInput: UserUpdateInput!) {
    usersUpdate(id: $id, userUpdateInput: $userUpdateInput) {
      id
    }
  }
`;

type UsersOwnUpdateProfileResponse = {
  usersOwnUpdateProfile: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    fullname?: string | null;
  } | null;
};

/** Matches GraphQL `UsersOwnUpdateProfileInput` (`usersOwnUpdateProfile` mutation). */
export type UsersOwnUpdateProfileInput = {
  firstName: string;
  lastName?: string | null;
  phone: string;
};

type UsersOwnUpdateProfileVariables = {
  usersOwnUpdateProfileInput: UsersOwnUpdateProfileInput;
};

const USERS_OWN_UPDATE_PROFILE_MUTATION = gql`
  mutation UsersOwnUpdateProfile($usersOwnUpdateProfileInput: UsersOwnUpdateProfileInput!) {
    usersOwnUpdateProfile(usersOwnUpdateProfileInput: $usersOwnUpdateProfileInput) {
      id
      firstName
      lastName
      phone
      avatarUrl
      fullname
    }
  }
`;

type UsersOwnAvatarUpdateResponse = {
  usersOwnAvatarUpdate: {
    id: string;
    avatarUrl?: string | null;
    fullname?: string | null;
  } | null;
};

const USERS_OWN_AVATAR_UPDATE_MUTATION = gql`
  mutation UsersOwnAvatarUpdate($usersOwnAvatarUpdateInput: UsersOwnAvatarUpdateInput!) {
    usersOwnAvatarUpdate(usersOwnAvatarUpdateInput: $usersOwnAvatarUpdateInput) {
      id
      avatarUrl
      fullname
    }
  }
`;

type UsersOwnAvatarDeleteResponse = {
  usersOwnAvatarDelete: {
    id: string;
    avatarUrl?: string | null;
  } | null;
};

const USERS_OWN_AVATAR_DELETE_MUTATION = gql`
  mutation UsersOwnAvatarDelete {
    usersOwnAvatarDelete {
      id
      avatarUrl
    }
  }
`;

const USER_CREATE_MUTATION = gql`
  mutation UsersCreate($userCreateInput: UserCreateInput!) {
    usersCreate(userCreateInput: $userCreateInput) {
      id
    }
  }
`;

const USER_DELETE_MUTATION = gql`
  mutation UsersDelete($id: ID!) {
    usersDelete(id: $id)
  }
`;

const USER_ASSIGN_ROLES_MUTATION = gql`
  mutation UsersAssignRoles($userAssignRolesInput: UserAssignRolesInput!) {
    usersAssignRoles(userAssignRolesInput: $userAssignRolesInput) {
      id
    }
  }
`;

const USER_RESET_PASSWORD_MUTATION = gql`
  mutation UsersResetPassword($id: ID!) {
    usersResetPassword(id: $id) {
      id
    }
  }
`;

const USER_RESTORE_MUTATION = gql`
  mutation UsersRestore($id: ID!) {
    usersRestore(id: $id) {
      id
    }
  }
`;

const USER_FORCE_DELETE_MUTATION = gql`
  mutation UsersForceDelete($id: ID!) {
    usersForceDelete(id: $id)
  }
`;

export const getUsersPaginated = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  descending = true,
  roleIds: number[] = [],
  userStatusIds: number[] = [],
  withDeleted = false,
) => {
  return gqlQuery<UserListResponse, UserListVariables>(USERS_PAGINATED_QUERY, {
    paginationInput: {
      page,
      limit,
      search: search || undefined,
      sortBy,
      descending,
      roleIds: roleIds.length ? roleIds : undefined,
      userStatusIds: userStatusIds.length ? userStatusIds : undefined,
      ...(withDeleted ? { withDeleted: true } : {}),
    },
  });
};

export const getUserStatuses = async () => {
  return gqlQuery<UserStatusesResponse>(USER_STATUSES_QUERY);
};

export const getUserById = async (id: string, withDeleted = false) => {
  return gqlQuery<UserDetailResponse, UserDetailVariables>(USER_DETAIL_QUERY, {
    id,
    withDeleted,
  });
};

export const updateUserById = async (
  id: string,
  userUpdateInput: UpdateUserVariables["userUpdateInput"],
) => {
  return gqlMutation<UpdateUserResponse, UpdateUserVariables>(USER_UPDATE_MUTATION, {
    id,
    userUpdateInput,
  });
};

export const updateOwnProfile = async (input: UsersOwnUpdateProfileInput) => {
  return gqlMutation<UsersOwnUpdateProfileResponse, UsersOwnUpdateProfileVariables>(
    USERS_OWN_UPDATE_PROFILE_MUTATION,
    { usersOwnUpdateProfileInput: input },
  );
};

/**
 * `usersOwnAvatarUpdate` with multipart upload (`fileUpload`).
 * Default `isPublicUpload: true` stores avatar in the public S3 bucket (same as BE default for own avatar).
 */
export const updateOwnAvatarMultipart = async (
  endpoint: string,
  accessToken: string | null,
  file: File,
  options?: { isPublicUpload?: boolean },
) => {
  const isPublicUpload = options?.isPublicUpload !== false;
  return gqlMultipartMutate<UsersOwnAvatarUpdateResponse>({
    endpoint,
    accessToken,
    query: USERS_OWN_AVATAR_UPDATE_MUTATION,
    variables: {
      usersOwnAvatarUpdateInput: {
        fileUpload: null,
        isPublicUpload,
      },
    },
    file,
    fileMapPath: "variables.usersOwnAvatarUpdateInput.fileUpload",
  });
};

export const deleteOwnAvatar = async () => {
  return gqlMutation<UsersOwnAvatarDeleteResponse>(USERS_OWN_AVATAR_DELETE_MUTATION, {});
};

export const createUser = async (
  userCreateInput: CreateUserVariables["userCreateInput"],
) => {
  return gqlMutation<CreateUserResponse, CreateUserVariables>(USER_CREATE_MUTATION, {
    userCreateInput,
  });
};

export const deleteUserById = async (id: string) => {
  return gqlMutation<DeleteUserResponse, DeleteUserVariables>(USER_DELETE_MUTATION, {
    id,
  });
};

export const assignUserRolesById = async (userId: string, roleIds: number[]) => {
  return gqlMutation<AssignRolesResponse, AssignRolesVariables>(
    USER_ASSIGN_ROLES_MUTATION,
    {
      userAssignRolesInput: {
        userId,
        roleIds,
      },
    },
  );
};

export const resetUserPasswordById = async (id: string) => {
  return gqlMutation<ResetPasswordResponse, ResetPasswordVariables>(
    USER_RESET_PASSWORD_MUTATION,
    { id },
  );
};

export const restoreUserById = async (id: string) => {
  return gqlMutation<RestoreUserResponse, RestoreUserVariables>(USER_RESTORE_MUTATION, {
    id,
  });
};

export const forceDeleteUserById = async (id: string) => {
  return gqlMutation<ForceDeleteUserResponse, ForceDeleteUserVariables>(
    USER_FORCE_DELETE_MUTATION,
    { id },
  );
};
