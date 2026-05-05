export interface menu {
  header?: string;
  title?: string;
  icon?: any;
  to?: string;
  chip?: string;
  BgColor?: string;
  chipBgColor?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  requiredPermission?: string;
}

const sidebarItem: menu[] = [
  { header: "Home" },
  {
    title: "Dashboard",
    icon: "screencast-2-linear",
    BgColor: "primary",
    to: "/dashboards/dashboard",
  },
  { header: "Access" },
  {
    title: "Users",
    icon: "users-group-rounded-linear",
    BgColor: "secondary",
    to: "/users",
    requiredPermission: "users.read",
  },
  {
    title: "Roles",
    icon: "shield-user-linear",
    BgColor: "warning",
    to: "/roles",
    requiredPermission: "roles.read",
  },
  {
    title: "User role scopes",
    icon: "link-round-linear",
    BgColor: "primary",
    to: "/user-role-scopes",
    requiredPermission: "user_role_scopes.read",
  },
  {
    title: "Units",
    icon: "buildings-2-linear",
    BgColor: "info",
    to: "/units",
    requiredPermission: "units.read",
  },
  { header: "Tenancy" },
  {
    title: "Tenants",
    icon: "global-linear",
    BgColor: "purple",
    to: "/tenants",
    requiredPermission: "tenants.read",
  },
];

export default sidebarItem;
