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
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
  VOLUNTEER = 'volunteer',
}

export enum Permission {
  // Dashboard
  DASHBOARD_READ = 'dashboard:read',

  // Users
  USERS_READ = 'users:read',
  USERS_CREATE = 'users:create',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  // Donations
  DONATIONS_READ = 'donations:read',
  DONATIONS_CREATE = 'donations:create',
  DONATIONS_UPDATE = 'donations:update',
  DONATIONS_DELETE = 'donations:delete',
  DONATIONS_APPROVE = 'donations:approve',

  // Beneficiaries
  BENEFICIARIES_READ = 'beneficiaries:read',
  BENEFICIARIES_CREATE = 'beneficiaries:create',
  BENEFICIARIES_UPDATE = 'beneficiaries:update',
  BENEFICIARIES_DELETE = 'beneficiaries:delete',

  // Aid Requests
  AID_REQUESTS_READ = 'aid_requests:read',
  AID_REQUESTS_CREATE = 'aid_requests:create',
  AID_REQUESTS_UPDATE = 'aid_requests:update',
  AID_REQUESTS_DELETE = 'aid_requests:delete',
  AID_REQUESTS_APPROVE = 'aid_requests:approve',

  // Scholarships
  SCHOLARSHIPS_READ = 'scholarships:read',
  SCHOLARSHIPS_CREATE = 'scholarships:create',
  SCHOLARSHIPS_UPDATE = 'scholarships:update',
  SCHOLARSHIPS_DELETE = 'scholarships:delete',

  // Events
  EVENTS_READ = 'events:read',
  EVENTS_CREATE = 'events:create',
  EVENTS_UPDATE = 'events:update',
  EVENTS_DELETE = 'events:delete',

  // Messages
  MESSAGING_READ = 'messaging:read',
  MESSAGING_SEND = 'messaging:send',
  MESSAGING_BULK = 'messaging:bulk',

  // Financial
  FINANCIAL_READ = 'financial:read',
  FINANCIAL_CREATE = 'financial:create',
  FINANCIAL_UPDATE = 'financial:update',
  FINANCIAL_DELETE = 'financial:delete',

  // Partners
  PARTNERS_READ = 'partners:read',
  PARTNERS_CREATE = 'partners:create',
  PARTNERS_UPDATE = 'partners:update',
  PARTNERS_DELETE = 'partners:delete',

  // Reports
  REPORTS_READ = 'reports:read',
  REPORTS_EXPORT = 'reports:export',

  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',

  // Storage
  STORAGE_READ = 'storage:read',
  STORAGE_UPLOAD = 'storage:upload',
  STORAGE_DELETE = 'storage:delete',

  // System
  SYSTEM_ADMIN = 'system:admin',
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
  [UserRole.SUPER_ADMIN]: [
    // Super Admin has all permissions
    ...Object.values(Permission),
  ],
  [UserRole.ADMIN]: [
    Permission.DASHBOARD_READ,
    Permission.USERS_READ,
    Permission.USERS_CREATE,
    Permission.USERS_UPDATE,
    Permission.DONATIONS_READ,
    Permission.DONATIONS_CREATE,
    Permission.DONATIONS_UPDATE,
    Permission.DONATIONS_APPROVE,
    Permission.BENEFICIARIES_READ,
    Permission.BENEFICIARIES_CREATE,
    Permission.BENEFICIARIES_UPDATE,
    Permission.AID_REQUESTS_READ,
    Permission.AID_REQUESTS_CREATE,
    Permission.AID_REQUESTS_UPDATE,
    Permission.AID_REQUESTS_APPROVE,
    Permission.SCHOLARSHIPS_READ,
    Permission.SCHOLARSHIPS_CREATE,
    Permission.SCHOLARSHIPS_UPDATE,
    Permission.EVENTS_READ,
    Permission.EVENTS_CREATE,
    Permission.EVENTS_UPDATE,
    Permission.MESSAGING_READ,
    Permission.MESSAGING_SEND,
    Permission.MESSAGING_BULK,
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_CREATE,
    Permission.FINANCIAL_UPDATE,
    Permission.PARTNERS_READ,
    Permission.PARTNERS_CREATE,
    Permission.PARTNERS_UPDATE,
    Permission.REPORTS_READ,
    Permission.REPORTS_EXPORT,
    Permission.SETTINGS_READ,
    Permission.STORAGE_READ,
    Permission.STORAGE_UPLOAD,
  ],
  [UserRole.MANAGER]: [
    Permission.DASHBOARD_READ,
    Permission.USERS_READ,
    Permission.DONATIONS_READ,
    Permission.DONATIONS_CREATE,
    Permission.DONATIONS_UPDATE,
    Permission.DONATIONS_APPROVE,
    Permission.BENEFICIARIES_READ,
    Permission.BENEFICIARIES_CREATE,
    Permission.BENEFICIARIES_UPDATE,
    Permission.AID_REQUESTS_READ,
    Permission.AID_REQUESTS_CREATE,
    Permission.AID_REQUESTS_UPDATE,
    Permission.AID_REQUESTS_APPROVE,
    Permission.SCHOLARSHIPS_READ,
    Permission.SCHOLARSHIPS_CREATE,
    Permission.SCHOLARSHIPS_UPDATE,
    Permission.EVENTS_READ,
    Permission.EVENTS_CREATE,
    Permission.EVENTS_UPDATE,
    Permission.MESSAGING_READ,
    Permission.MESSAGING_SEND,
    Permission.MESSAGING_BULK,
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_CREATE,
    Permission.FINANCIAL_UPDATE,
    Permission.PARTNERS_READ,
    Permission.PARTNERS_CREATE,
    Permission.PARTNERS_UPDATE,
    Permission.REPORTS_READ,
    Permission.REPORTS_EXPORT,
    Permission.STORAGE_READ,
    Permission.STORAGE_UPLOAD,
  ],
  [UserRole.OPERATOR]: [
    Permission.DASHBOARD_READ,
    Permission.DONATIONS_READ,
    Permission.DONATIONS_CREATE,
    Permission.DONATIONS_UPDATE,
    Permission.BENEFICIARIES_READ,
    Permission.BENEFICIARIES_CREATE,
    Permission.BENEFICIARIES_UPDATE,
    Permission.AID_REQUESTS_READ,
    Permission.AID_REQUESTS_CREATE,
    Permission.AID_REQUESTS_UPDATE,
    Permission.SCHOLARSHIPS_READ,
    Permission.SCHOLARSHIPS_CREATE,
    Permission.SCHOLARSHIPS_UPDATE,
    Permission.EVENTS_READ,
    Permission.EVENTS_CREATE,
    Permission.MESSAGING_READ,
    Permission.MESSAGING_SEND,
    Permission.FINANCIAL_READ,
    Permission.FINANCIAL_CREATE,
    Permission.PARTNERS_READ,
    Permission.PARTNERS_CREATE,
    Permission.REPORTS_READ,
    Permission.STORAGE_READ,
    Permission.STORAGE_UPLOAD,
  ],
  [UserRole.VIEWER]: [
    Permission.DASHBOARD_READ,
    Permission.DONATIONS_READ,
    Permission.BENEFICIARIES_READ,
    Permission.AID_REQUESTS_READ,
    Permission.SCHOLARSHIPS_READ,
    Permission.EVENTS_READ,
    Permission.MESSAGING_READ,
    Permission.FINANCIAL_READ,
    Permission.PARTNERS_READ,
    Permission.REPORTS_READ,
    Permission.STORAGE_READ,
  ],
  [UserRole.VOLUNTEER]: [
    Permission.DASHBOARD_READ,
    Permission.DONATIONS_READ,
    Permission.DONATIONS_CREATE,
    Permission.BENEFICIARIES_READ,
    Permission.BENEFICIARIES_CREATE,
    Permission.AID_REQUESTS_READ,
    Permission.AID_REQUESTS_CREATE,
    Permission.EVENTS_READ,
    Permission.MESSAGING_READ,
    Permission.MESSAGING_SEND,
    Permission.PARTNERS_READ,
    Permission.STORAGE_READ,
    Permission.STORAGE_UPLOAD,
  ],
};
