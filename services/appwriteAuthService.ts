/**
 * @fileoverview Appwrite Authentication Service
 * @description Complete authentication system with Appwrite integration
 */

import { account, databases, DATABASE_ID, ID, Query } from '../lib/appwrite';
import { appwriteUserService, USER_ROLES } from './appwriteUserService';
import { logger } from '../lib/logging/logger';

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: keyof typeof USER_ROLES;
}

export interface AuthUser {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  prefs: Record<string, any>;
  profile?: {
    role: keyof typeof USER_ROLES;
    permissions: string[];
    status: 'active' | 'inactive' | 'suspended';
    last_login?: string;
    profile_data?: Record<string, any>;
  };
}

export interface AuthSession {
  $id: string;
  userId: string;
  provider: string;
  providerUid: string;
  providerAccessToken: string;
  providerAccessTokenExpiry: string;
  providerRefreshToken: string;
  providerScopes: string[];
  ip: string;
  osCode: string;
  osName: string;
  osVersion: string;
  clientType: string;
  clientCode: string;
  clientName: string;
  clientVersion: string;
  clientEngine: string;
  clientEngineVersion: string;
  deviceName: string;
  deviceBrand: string;
  deviceModel: string;
  countryCode: string;
  countryName: string;
  current: boolean;
  factors: string[];
  secret: string;
  mfaUpdatedAt: string;
}

class AppwriteAuthService {
  private currentUser: AuthUser | null = null;
  private currentSession: AuthSession | null = null;

  /**
   * Initialize authentication service
   */
  async initialize(): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        logger.error('Appwrite account service not available');
        return { error: new Error('Appwrite account service not available') };
      }

      // Check if user is already logged in
      try {
        const user = await account.get();
        if (user) {
          this.currentUser = user as AuthUser;
          await this.loadUserProfile();
        }
      } catch (error) {
        // User not logged in, this is normal
        logger.info('No active session found');
      }

      return { error: null };
    } catch (error) {
      logger.error('Error initializing auth service:', error);
      return { error: error as Error };
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ data: AuthUser | null; error: Error | null }> {
    try {
      if (!account) {
        return { data: null, error: new Error('Appwrite account service not available') };
      }

      logger.info(`Attempting login for: ${credentials.email}`);

      // Create session
      const session = await account.createEmailPasswordSession(
        credentials.email,
        credentials.password
      );

      this.currentSession = session as AuthSession;

      // Get user data
      const user = await account.get();
      this.currentUser = user as AuthUser;

      // Load user profile
      await this.loadUserProfile();

      // Update last login
      if (this.currentUser?.profile) {
        await appwriteUserService.updateLastLogin(this.currentUser.$id);
      }

      logger.info(`User logged in successfully: ${credentials.email}`);
      return { data: this.currentUser, error: null };
    } catch (error) {
      logger.error(`Login failed for ${credentials.email}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<{ data: AuthUser | null; error: Error | null }> {
    try {
      if (!account) {
        return { data: null, error: new Error('Appwrite account service not available') };
      }

      logger.info(`Attempting registration for: ${data.email}`);

      // Create user account
      const user = await account.create(
        ID.unique(),
        data.email,
        data.password,
        data.name
      );

      this.currentUser = user as AuthUser;

      // Create user profile
      const profileResult = await appwriteUserService.createUser({
        user_id: user.$id,
        email: user.email,
        name: user.name,
        role: data.role || USER_ROLES.VIEWER,
      });

      if (profileResult.error) {
        logger.error('Error creating user profile:', profileResult.error);
        // Continue with registration even if profile creation fails
      }

      // Create session
      const session = await account.createEmailPasswordSession(
        data.email,
        data.password
      );

      this.currentSession = session as AuthSession;

      logger.info(`User registered successfully: ${data.email}`);
      return { data: this.currentUser, error: null };
    } catch (error) {
      logger.error(`Registration failed for ${data.email}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        return { error: new Error('Appwrite account service not available') };
      }

      if (this.currentSession) {
        await account.deleteSession(this.currentSession.$id);
      } else {
        await account.deleteSessions();
      }

      this.currentUser = null;
      this.currentSession = null;

      logger.info('User logged out successfully');
      return { error: null };
    } catch (error) {
      logger.error('Logout failed:', error);
      return { error: error as Error };
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
  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentSession !== null;
  }

  /**
   * Load user profile from database
   */
  private async loadUserProfile(): Promise<void> {
    try {
      if (!this.currentUser) return;

      const { data: profile } = await appwriteUserService.getUserByAppwriteId(this.currentUser.$id);
      
      if (profile) {
        this.currentUser.profile = {
          role: profile.role,
          permissions: JSON.parse(profile.permissions || '[]'),
          status: profile.status,
          last_login: profile.last_login,
          profile_data: profile.profile_data ? JSON.parse(profile.profile_data) : undefined,
        };
      }
    } catch (error) {
      logger.error('Error loading user profile:', error);
    }
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    if (!this.currentUser?.profile) return false;
    return this.currentUser.profile.permissions.includes(permission);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: keyof typeof USER_ROLES): boolean {
    if (!this.currentUser?.profile) return false;
    return this.currentUser.profile.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(USER_ROLES.ADMIN);
  }

  /**
   * Check if user is manager
   */
  isManager(): boolean {
    return this.hasRole(USER_ROLES.MANAGER);
  }

  /**
   * Check if user is active
   */
  isActive(): boolean {
    if (!this.currentUser?.profile) return false;
    return this.currentUser.profile.status === 'active';
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    name?: string;
    role?: keyof typeof USER_ROLES;
    status?: 'active' | 'inactive' | 'suspended';
    profile_data?: Record<string, any>;
  }): Promise<{ error: Error | null }> {
    try {
      if (!this.currentUser) {
        return { error: new Error('No user logged in') };
      }

      const result = await appwriteUserService.updateUser(this.currentUser.$id, data);
      
      if (result.error) {
        logger.error('Error updating user profile:', result.error);
        return { error: result.error };
      }

      // Reload profile
      await this.loadUserProfile();

      logger.info(`User profile updated: ${this.currentUser.email}`);
      return { error: null };
    } catch (error) {
      logger.error('Error updating user profile:', error);
      return { error: error as Error };
    }
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        return { error: new Error('Appwrite account service not available') };
      }

      await account.updatePassword(newPassword, oldPassword);

      logger.info('Password changed successfully');
      return { error: null };
    } catch (error) {
      logger.error('Error changing password:', error);
      return { error: error as Error };
    }
  }

  /**
   * Request password recovery
   */
  async requestPasswordRecovery(email: string): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        return { error: new Error('Appwrite account service not available') };
      }

      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );

      logger.info(`Password recovery requested for: ${email}`);
      return { error: null };
    } catch (error) {
      logger.error(`Error requesting password recovery for ${email}:`, error);
      return { error: error as Error };
    }
  }

  /**
   * Confirm password recovery
   */
  async confirmPasswordRecovery(userId: string, secret: string, password: string): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        return { error: new Error('Appwrite account service not available') };
      }

      await account.updateRecovery(userId, secret, password);

      logger.info('Password recovery confirmed');
      return { error: null };
    } catch (error) {
      logger.error('Error confirming password recovery:', error);
      return { error: error as Error };
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string, secret: string): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        return { error: new Error('Appwrite account service not available') };
      }

      await account.updateVerification(userId, secret);

      logger.info('Email verified successfully');
      return { error: null };
    } catch (error) {
      logger.error('Error verifying email:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get user sessions
   */
  async getSessions(): Promise<{ data: AuthSession[] | null; error: Error | null }> {
    try {
      if (!account) {
        return { data: null, error: new Error('Appwrite account service not available') };
      }

      const sessions = await account.listSessions();
      return { data: sessions.sessions as AuthSession[], error: null };
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        return { error: new Error('Appwrite account service not available') };
      }

      await account.deleteSession(sessionId);

      // If current session was deleted, clear user data
      if (this.currentSession?.$id === sessionId) {
        this.currentUser = null;
        this.currentSession = null;
      }

      logger.info(`Session deleted: ${sessionId}`);
      return { error: null };
    } catch (error) {
      logger.error(`Error deleting session ${sessionId}:`, error);
      return { error: error as Error };
    }
  }

  /**
   * Delete all sessions
   */
  async deleteAllSessions(): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        return { error: new Error('Appwrite account service not available') };
      }

      await account.deleteSessions();

      this.currentUser = null;
      this.currentSession = null;

      logger.info('All sessions deleted');
      return { error: null };
    } catch (error) {
      logger.error('Error deleting all sessions:', error);
      return { error: error as Error };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<{ error: Error | null }> {
    try {
      if (!account || !this.currentSession) {
        return { error: new Error('No active session to refresh') };
      }

      // Appwrite automatically refreshes sessions, but we can check if user is still valid
      const user = await account.get();
      if (user) {
        this.currentUser = user as AuthUser;
        await this.loadUserProfile();
      }

      return { error: null };
    } catch (error) {
      logger.error('Error refreshing session:', error);
      // Session might be expired, clear user data
      this.currentUser = null;
      this.currentSession = null;
      return { error: error as Error };
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<{ data: Record<string, any> | null; error: Error | null }> {
    try {
      if (!account) {
        return { data: null, error: new Error('Appwrite account service not available') };
      }

      const user = await account.get();
      return { data: user.prefs || {}, error: null };
    } catch (error) {
      logger.error('Error getting user preferences:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(prefs: Record<string, any>): Promise<{ error: Error | null }> {
    try {
      if (!account) {
        return { error: new Error('Appwrite account service not available') };
      }

      await account.updatePrefs(prefs);

      logger.info('User preferences updated');
      return { error: null };
    } catch (error) {
      logger.error('Error updating user preferences:', error);
      return { error: error as Error };
    }
  }

  /**
   * Get authentication status
   */
  getAuthStatus(): {
    isAuthenticated: boolean;
    user: AuthUser | null;
    session: AuthSession | null;
    isAdmin: boolean;
    isManager: boolean;
    isActive: boolean;
  } {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.currentUser,
      session: this.currentSession,
      isAdmin: this.isAdmin(),
      isManager: this.isManager(),
      isActive: this.isActive(),
    };
  }
}

// Export singleton instance
export const appwriteAuthService = new AppwriteAuthService();
export default appwriteAuthService;
