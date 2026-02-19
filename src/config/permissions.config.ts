export type UserRole = "admin" | "staff" | "team_manager" | "customer";

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export type Feature =
  | "facilities"
  | "bookings"
  | "tournaments"
  | "teams"
  | "users"
  | "dashboard";

export const rolePermissions: Record<UserRole, Record<Feature, Permission>> = {
  admin: {
    facilities: { view: true, create: true, edit: true, delete: true },
    bookings: { view: true, create: true, edit: true, delete: true },
    tournaments: { view: true, create: true, edit: true, delete: true },
    teams: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
    dashboard: { view: true, create: false, edit: false, delete: false },
  },
  staff: {
    facilities: { view: true, create: false, edit: true, delete: false },
    bookings: { view: true, create: true, edit: true, delete: false },
    tournaments: { view: true, create: false, edit: true, delete: false },
    teams: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    dashboard: { view: true, create: false, edit: false, delete: false },
  },
  team_manager: {
    facilities: { view: true, create: false, edit: false, delete: false },
    bookings: { view: true, create: true, edit: false, delete: false },
    tournaments: { view: true, create: false, edit: false, delete: false },
    teams: { view: true, create: true, edit: true, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    dashboard: { view: false, create: false, edit: false, delete: false },
  },
  customer: {
    facilities: { view: true, create: false, edit: false, delete: false },
    bookings: { view: true, create: true, edit: false, delete: false },
    tournaments: { view: true, create: false, edit: false, delete: false },
    teams: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    dashboard: { view: false, create: false, edit: false, delete: false },
  },
};

export function hasPermission(
  role: UserRole,
  feature: Feature,
  action: keyof Permission
): boolean {
  return rolePermissions[role]?.[feature]?.[action] ?? false;
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "admin" || role === "staff";
}
