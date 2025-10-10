export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions: Permission[];
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',

  // Donations
  VIEW_DONATIONS = 'view_donations',
  CREATE_DONATION = 'create_donation',
  EDIT_DONATION = 'edit_donation',
  DELETE_DONATION = 'delete_donation',

  // Members
  VIEW_MEMBERS = 'view_members',
  CREATE_MEMBER = 'create_member',
  EDIT_MEMBER = 'edit_member',
  DELETE_MEMBER = 'delete_member',

  // Aid Management
  VIEW_AID = 'view_aid',
  CREATE_AID = 'create_aid',
  EDIT_AID = 'edit_aid',
  DELETE_AID = 'delete_aid',
  APPROVE_AID = 'approve_aid',

  // Finance
  VIEW_FINANCE = 'view_finance',
  CREATE_FINANCE = 'create_finance',
  EDIT_FINANCE = 'edit_finance',
  DELETE_FINANCE = 'delete_finance',
  MANAGE_FINANCIAL = 'manage_financial',

  // Messages
  VIEW_MESSAGES = 'view_messages',
  SEND_MESSAGES = 'send_messages',

  // Events
  VIEW_EVENTS = 'view_events',
  CREATE_EVENT = 'create_event',
  EDIT_EVENT = 'edit_event',
  DELETE_EVENT = 'delete_event',

  // System Settings
  VIEW_SETTINGS = 'view_settings',
  EDIT_SETTINGS = 'edit_settings',

  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  EDIT_USER = 'edit_user',
  DELETE_USER = 'delete_user',

  // Reports
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Admin has all permissions
    ...Object.values(Permission),
  ],
  [UserRole.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_DONATIONS,
    Permission.CREATE_DONATION,
    Permission.EDIT_DONATION,
    Permission.VIEW_MEMBERS,
    Permission.CREATE_MEMBER,
    Permission.EDIT_MEMBER,
    Permission.VIEW_AID,
    Permission.CREATE_AID,
    Permission.EDIT_AID,
    Permission.APPROVE_AID,
    Permission.VIEW_FINANCE,
    Permission.CREATE_FINANCE,
    Permission.EDIT_FINANCE,
    Permission.MANAGE_FINANCIAL,
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
    Permission.VIEW_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.OPERATOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_DONATIONS,
    Permission.CREATE_DONATION,
    Permission.VIEW_MEMBERS,
    Permission.CREATE_MEMBER,
    Permission.VIEW_AID,
    Permission.CREATE_AID,
    Permission.VIEW_FINANCE,
    Permission.VIEW_MESSAGES,
    Permission.SEND_MESSAGES,
    Permission.VIEW_EVENTS,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.VIEWER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_DONATIONS,
    Permission.VIEW_MEMBERS,
    Permission.VIEW_AID,
    Permission.VIEW_FINANCE,
    Permission.VIEW_MESSAGES,
    Permission.VIEW_EVENTS,
    Permission.VIEW_REPORTS,
  ],
};
