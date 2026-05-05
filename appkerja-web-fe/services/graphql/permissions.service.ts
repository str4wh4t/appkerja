import { gql } from "@apollo/client/core";
import { gqlQuery } from "./client";

export type PermissionRow = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  resource: string;
  action: string;
};

type PermissionsFindAllResponse = {
  permissionsFindAll: PermissionRow[];
};

const PERMISSIONS_FIND_ALL_QUERY = gql`
  query PermissionsFindAll {
    permissionsFindAll {
      id
      code
      name
      description
      resource
      action
      roles {
        id
        code
      }
    }
  }
`;

export const getPermissionsFindAll = async () => {
  return gqlQuery<PermissionsFindAllResponse>(PERMISSIONS_FIND_ALL_QUERY);
};
