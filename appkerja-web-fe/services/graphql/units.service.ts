import { gql } from "@apollo/client/core";
import { gqlMutation, gqlQuery } from "./client";

export type UnitRow = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
};

type UnitsPaginatedResponse = {
  unitsFindAllPaginated: {
    data: UnitRow[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
};

type UnitsPaginatedVariables = {
  paginationInput: {
    page: number;
    limit: number;
    search?: string;
    sortBy?: string;
    descending?: boolean;
    withDeleted?: boolean;
  };
};

const UNITS_PAGINATED_QUERY = gql`
  query UnitsFindAllPaginated($paginationInput: UnitPaginationInput) {
    unitsFindAllPaginated(paginationInput: $paginationInput) {
      data {
        id
        code
        name
        description
        parentId
        isActive
        tenantId
        createdAt
        updatedAt
      }
      total
      page
      limit
      totalPages
      hasNextPage
    }
  }
`;

type UnitOneResponse = {
  unitsFindOne: UnitRow | null;
};

type UnitOneVariables = {
  id: string;
  withDeleted?: boolean;
};

const UNIT_ONE_QUERY = gql`
  query UnitsFindOne($id: ID!, $withDeleted: Boolean) {
    unitsFindOne(id: $id, withDeleted: $withDeleted) {
      id
      code
      name
      description
      parentId
      isActive
      tenantId
      createdAt
      updatedAt
    }
  }
`;

type UnitCreateResponse = {
  unitsCreate: UnitRow | null;
};

type UnitCreateVariables = {
  unitCreateInput: {
    code: string;
    name: string;
    description?: string | null;
    parentId?: string | null;
    isActive?: boolean;
  };
};

const UNIT_CREATE_MUTATION = gql`
  mutation UnitsCreate($unitCreateInput: UnitCreateInput!) {
    unitsCreate(unitCreateInput: $unitCreateInput) {
      id
      code
      name
    }
  }
`;

type UnitUpdateResponse = {
  unitsUpdate: UnitRow | null;
};

type UnitUpdateVariables = {
  id: string;
  unitUpdateInput: {
    code?: string;
    name?: string;
    description?: string | null;
    parentId?: string | null;
    isActive?: boolean;
  };
};

const UNIT_UPDATE_MUTATION = gql`
  mutation UnitsUpdate($id: ID!, $unitUpdateInput: UnitUpdateInput!) {
    unitsUpdate(id: $id, unitUpdateInput: $unitUpdateInput) {
      id
      code
      name
    }
  }
`;

type UnitDeleteResponse = {
  unitsDelete: boolean;
};

type UnitDeleteVariables = {
  id: string;
};

const UNIT_DELETE_MUTATION = gql`
  mutation UnitsDelete($id: ID!) {
    unitsDelete(id: $id)
  }
`;

type UnitRestoreResponse = {
  unitsRestore: UnitRow | null;
};

type UnitRestoreVariables = {
  id: string;
};

const UNIT_RESTORE_MUTATION = gql`
  mutation UnitsRestore($id: ID!) {
    unitsRestore(id: $id) {
      id
      code
      name
    }
  }
`;

type UnitForceDeleteResponse = {
  unitsForceDelete: boolean;
};

type UnitForceDeleteVariables = {
  id: string;
};

const UNIT_FORCE_DELETE_MUTATION = gql`
  mutation UnitsForceDelete($id: ID!) {
    unitsForceDelete(id: $id)
  }
`;

export const getUnitsPaginated = async (
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
  descending?: boolean,
  withDeleted?: boolean
) => {
  return gqlQuery<UnitsPaginatedResponse, UnitsPaginatedVariables>(UNITS_PAGINATED_QUERY, {
    paginationInput: {
      page,
      limit,
      search: search || undefined,
      sortBy: sortBy || undefined,
      descending,
      withDeleted: Boolean(withDeleted),
    },
  });
};

export const getUnitById = async (id: string, withDeleted = false) => {
  return gqlQuery<UnitOneResponse, UnitOneVariables>(UNIT_ONE_QUERY, {
    id,
    withDeleted,
  });
};

export const createUnit = async (input: UnitCreateVariables["unitCreateInput"]) => {
  return gqlMutation<UnitCreateResponse, UnitCreateVariables>(UNIT_CREATE_MUTATION, {
    unitCreateInput: input,
  });
};

export const updateUnitById = async (id: string, input: UnitUpdateVariables["unitUpdateInput"]) => {
  return gqlMutation<UnitUpdateResponse, UnitUpdateVariables>(UNIT_UPDATE_MUTATION, {
    id,
    unitUpdateInput: input,
  });
};

export const deleteUnitById = async (id: string) => {
  return gqlMutation<UnitDeleteResponse, UnitDeleteVariables>(UNIT_DELETE_MUTATION, { id });
};

export const restoreUnitById = async (id: string) => {
  return gqlMutation<UnitRestoreResponse, UnitRestoreVariables>(UNIT_RESTORE_MUTATION, { id });
};

export const forceDeleteUnitById = async (id: string) => {
  return gqlMutation<UnitForceDeleteResponse, UnitForceDeleteVariables>(
    UNIT_FORCE_DELETE_MUTATION,
    { id },
  );
};
