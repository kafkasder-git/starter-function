/**
 * @fileoverview Authentication Service
 * @description Comprehensive authentication service with Appwrite integration
 */

import { account, ID, Query, Permission, Role } from '../appwrite';
import { db, collections } from '../database';
import { logger } from '../logging/logger';
import { UserRole, ROLE_PERMISSIONS, type Permission as PermissionType } from '../../types/auth';
import { normalizeRoleToEnglish } from '../roleMapping';
import { AppwriteException } from 'appwrite';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions: PermissionType[];
  metadata?: Record<string, unknown>;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  session?: {
    userId: string;
    expire: string;
  };
}

export interface SessionInfo {
  userId: string;
  expire: string;
}

/**
 * Build User object from Appwrite User and Database Profile
 */
const buildUserFromAppwriteUser = async (appwriteUser: any): Promise<AuthUser> => {
  const prefs = appwriteUser.prefs || {};

  let role: UserRole = UserRole.VIEWER;
  let isActive = true;
  let avatar: string | undefined;
  let metadata: Record<string, unknown> = prefs;

  // Try to get user profile from database
  try {
    const { data: profileData, error } = await db.list(
      collections.USER_PROFILES,
      [Query.equal('$id', appwriteUser.$id)]
    );

    if (!error && profileData?.documents?.[0]) {
      const profile = profileData.documents[0];
      role = (profile.role as UserRole) || UserRole.VIEWER;
      isActive = profile.is_active !== false;
      avatar = profile.avatar_url;
      metadata = { ...prefs, ...profile };
      
      logger.info('Successfully fetched user profile from database', {
        userId: appwriteUser.$id,
        role: profile.role
      });
    } else {
      logger.info('No user profile found in database, using preferences', {
        userId: appwriteUser.$id
      });
    }
  } catch (error: any) {
    logger.error('Failed to fetch user profile from database, using preferences', { 
      userId: appwriteUser.$id, 
      error: error.message
    });
  }

  // Fallback to preferences if database query fails
  const rawRole = (prefs as any).role as string;
  if (rawRole) {
    const normalizedRole = normalizeRoleToEnglish(rawRole);
    if (Object.values(UserRole).includes(normalizedRole as UserRole)) {
      role = normalizedRole as UserRole;
    }
  }
  
  isActive = (prefs as any).is_active !== false;
  avatar = (prefs as any).avatar_url as string;

  const { email } = appwriteUser;
  if (!email) {
    throw new Error('User email is required');
  }

  return {
    id: appwriteUser.$id,
    email,
    name: appwriteUser.name || (prefs as any).name as string || email.split('@')[0] || 'User',
    role,
    avatar,
    permissions: ROLE_PERMISSIONS[role],
    metadata,
    lastLogin: new Date(),
    isActive,
    createdAt: new Date(appwriteUser.$createdAt),
    updatedAt: new Date(appwriteUser.$updatedAt),
  };
};

/**
 * Authentication Service Class
 */
export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private currentSession: SessionInfo | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Initialize authentication service
   */
  async initialize(): Promise<AuthResponse> {
    try {
      logger.info('Initializing authentication service');
      
      // Get current account session
      const appwriteUser = await account.get();

      if (appwriteUser) {
        const user = await buildUserFromAppwriteUser(appwriteUser);
        this.currentUser = user;
        this.currentSession = {
          userId: appwriteUser.$id,
          expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        logger.info('Authentication initialized successfully', {
          userId: user.id,
          role: user.role
        });

        return {
          success: true,
          user,
          session: this.currentSession,
        };
      }

      return { success: false, error: 'No active session found' };
    } catch (error: any) {
      logger.error('Authentication initialization failed', error);
      return { 
        success: false, 
        error: error.message || 'Authentication initialization failed' 
      };
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      logger.info('Attempting login', { email: credentials.email });
      
      // Create email session
      await account.createEmailPasswordSession(credentials.email, credentials.password);
      logger.info('Email session created successfully', { email: credentials.email });

      // Get user data
      const appwriteUser = await account.get();
      logger.info('Retrieved Appwrite user data', { 
        userId: appwriteUser.$id,
        email: appwriteUser.email 
      });
      
      const user = await buildUserFromAppwriteUser(appwriteUser);
      logger.info('Built user object successfully', { 
        userId: user.id,
        role: user.role,
        isActive: user.isActive 
      });

      // Update Appwrite preferences with database role if different
      try {
        const currentPrefs = appwriteUser.prefs || {};
        if (currentPrefs.role !== user.role) {
          await account.updatePrefs({
            ...currentPrefs,
            role: user.role,
            name: user.name,
            is_active: user.isActive,
          });
          logger.info('Updated Appwrite preferences with database role', {
            userId: user.id,
            role: user.role
          });
        }
      } catch (prefsError: any) {
        logger.error('Failed to update Appwrite preferences', {
          userId: user.id,
          error: prefsError.message
        });
        // Continue even if preferences update fails
      }

      this.currentUser = user;
      this.currentSession = {
        userId: appwriteUser.$id,
        expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      return {
        success: true,
        user,
        session: this.currentSession,
      };
    } catch (error: any) {
      logger.error('Login failed', { email: credentials.email, error: error.message });

      let errorMessage = 'Giriş yapılamadı';

      if (error instanceof AppwriteException) {
        switch (error.type) {
          case 'user_invalid_credentials':
            errorMessage = 'Geçersiz email veya şifre';
            break;
          case 'user_blocked':
            errorMessage = 'Kullanıcı engellenmiş';
            break;
          case 'user_email_not_verified':
            errorMessage = 'Email adresinizi doğrulayın';
            break;
          case 'general_unauthorized_scope':
            errorMessage = 'Yetkisiz erişim';
            break;
          case 'general_unsupported_provider':
            errorMessage = 'Desteklenmeyen kimlik doğrulama yöntemi';
            break;
          default:
            errorMessage = error.message || 'Giriş yapılamadı';
        }
      } else if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Bağlantı zaman aşımı. Lütfen tekrar deneyin.';
        } else {
          errorMessage = error.message || 'Bilinmeyen hata oluştu';
        }
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      logger.info('Attempting user registration', { email: userData.email });

      // Create account
      const userId = ID.unique();
      await account.create(
        userId,
        userData.email,
        userData.password,
        userData.name
      );

      // Update preferences with role
      await account.updatePrefs({
        role: userData.role ?? UserRole.VIEWER,
        name: userData.name,
      });

      // Create user profile in database
      try {
        await db.create(collections.USER_PROFILES, {
          id: userId,
          email: userData.email,
          name: userData.name,
          role: userData.role ?? UserRole.VIEWER,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        logger.info('User profile created in database', { userId });
      } catch (dbError: any) {
        logger.error('Failed to create user profile in database', { 
          userId, 
          error: dbError.message 
        });
        // Continue even if database profile creation fails
      }

      logger.info('User registration successful', { userId, email: userData.email });

      return { success: true };
    } catch (error: any) {
      logger.error('User registration failed', { email: userData.email, error: error.message });

      let errorMessage = 'Kayıt oluşturulamadı';

      if (error instanceof AppwriteException) {
        switch (error.type) {
          case 'user_already_exists':
            errorMessage = 'Bu email adresi zaten kayıtlı';
            break;
          case 'password_recently_used':
            errorMessage = 'Bu şifre yakın zamanda kullanılmış';
            break;
          case 'password_personal_data':
            errorMessage = 'Şifre kişisel bilgiler içeremez';
            break;
          default:
            errorMessage = error.message || 'Kayıt oluşturulamadı';
        }
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<AuthResponse> {
    try {
      await account.deleteSession('current');

      this.currentUser = null;
      this.currentSession = null;

      logger.info('User logged out successfully');
      return { success: true };
    } catch (error: any) {
      logger.error('Logout failed', error);
      // Even if logout fails on server, clear local state
      this.currentUser = null;
      this.currentSession = null;
      return { success: true }; // Return success to clear local state
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );

      logger.info('Password reset email sent', { email });
      return { success: true };
    } catch (error: any) {
      logger.error('Password reset failed', { email, error: error.message });
      const errorMessage = error instanceof AppwriteException
        ? error.message
        : 'Şifre sıfırlama bağlantısı gönderilemedi';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<AuthUser>): Promise<AuthResponse> {
    if (!this.currentUser) {
      return { success: false, error: 'Kullanıcı oturumu bulunamadı' };
    }

    try {
      // Update name if provided
      if (userData.name) {
        await account.updateName(userData.name);
      }

      // Update preferences
      const newPrefs = {
        ...(this.currentUser.metadata || {}),
        ...userData.metadata,
        name: userData.name || this.currentUser.name,
        avatar_url: userData.avatar,
        role: userData.role || this.currentUser.role,
      };

      await account.updatePrefs(newPrefs);

      // Update user profile in database
      try {
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (userData.name) updateData.name = userData.name;
        if (userData.role) updateData.role = userData.role;
        if (userData.avatar) updateData.avatar_url = userData.avatar;

        await db.update(collections.USER_PROFILES, this.currentUser.id, updateData);
        logger.info('User profile updated in database', { userId: this.currentUser.id });
      } catch (dbError: any) {
        logger.error('Failed to update user profile in database', { 
          userId: this.currentUser.id, 
          error: dbError.message 
        });
        // Continue even if database update fails
      }

      const updatedUser = { ...this.currentUser, ...userData, updatedAt: new Date() } as AuthUser;
      this.currentUser = updatedUser;

      logger.info('User profile updated successfully', { userId: this.currentUser.id });
      return { success: true, user: updatedUser };
    } catch (error: any) {
      logger.error('Profile update failed', { userId: this.currentUser.id, error: error.message });
      const errorMessage = error instanceof AppwriteException
        ? error.message
        : 'Profil güncellenemedi';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<AuthResponse> {
    try {
      const appwriteUser = await account.get();

      if (appwriteUser) {
        const user = await buildUserFromAppwriteUser(appwriteUser);
        this.currentUser = user;
        this.currentSession = {
          userId: appwriteUser.$id,
          expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };

        return {
          success: true,
          user,
          session: this.currentSession,
        };
      }

      return { success: false, error: 'No active session found' };
    } catch (error: any) {
      logger.error('Session refresh failed', error);
      return { success: false, error: 'Session refresh failed' };
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionInfo | null {
    return this.currentSession;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: PermissionType): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: PermissionType[]): boolean {
    if (!this.currentUser) return false;
    return permissions.some((permission) => this.currentUser!.permissions.includes(permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: PermissionType[]): boolean {
    if (!this.currentUser) return false;
    return permissions.every((permission) => this.currentUser!.permissions.includes(permission));
  }

  /**
   * Sync user profile with database
   */
  async syncUserProfile(userId: string): Promise<void> {
    try {
      const { data: profileData, error } = await db.list(
        collections.USER_PROFILES,
        [Query.equal('$id', userId)]
      );

      if (!error && profileData?.documents?.[0]) {
        const profile = profileData.documents[0];
        
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser = {
            ...this.currentUser,
            role: (profile.role as UserRole) || this.currentUser.role,
            isActive: profile.is_active !== false,
            avatar: profile.avatar_url || this.currentUser.avatar,
            metadata: { ...this.currentUser.metadata, ...profile },
            updatedAt: new Date(),
          };
          
          logger.info('User profile synced with database', { userId });
        }
      }
    } catch (error: any) {
      logger.error('Failed to sync user profile', { userId, error: error.message });
    }
  }

  /**
   * Create user profile for existing Appwrite users
   */
  async createUserProfile(userData: any): Promise<void> {
    try {
      await db.create(collections.USER_PROFILES, {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || UserRole.VIEWER,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      logger.info('User profile created in database', { userId: userData.id });
    } catch (error: any) {
      logger.error('Failed to create user profile', { userId: userData.id, error: error.message });
      throw error;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

export default authService;
