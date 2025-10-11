/**
 * @fileoverview Authentication Store with Appwrite
 * @description Centralized authentication state management using Appwrite SDK
 */

import type { Models } from 'appwrite';
import { toast } from 'sonner';
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { account, ID, Query } from '../lib/appwrite';
import { db, collections } from '../lib/database';
import { authLogger } from '../lib/logging';
import { ROLE_PERMISSIONS, UserRole, type Permission } from '../types/auth';
import { normalizeRoleToEnglish } from '../lib/roleMapping';
import { AppwriteException } from 'appwrite';

// Error type for Appwrite auth operations
// interface AuthError {
//   message: string;
//   status?: number;
//   type?: string;
// }

// User interface for Zustand store
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions: Permission[];
  metadata?: Record<string, unknown>;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session interface (simplified for Appwrite)
interface Session {
  userId: string;
  expire: string;
}

interface AuthState {
  // Auth state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // UI state
  showLoginModal: boolean;
  rememberMe: boolean;
  loginAttempts: number;
  lastLoginAttempt?: Date;

  // Session management
  sessionExpiresAt?: Date;
  refreshPromise?: Promise<void>;
  sessionExpiryWarningShown: boolean;
  sessionExpiryWarningTime?: Date;
}

interface AuthActions {
  // Authentication actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: (callback?: () => void) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;

  // Session management
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSessionExpiry: () => void;
  dismissSessionWarning: () => void;
  handleSessionExpired: () => Promise<void>;

  // UI actions
  setShowLoginModal: (show: boolean) => void;
  clearError: () => void;
  setRememberMe: (remember: boolean) => void;

  // Permission helpers
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;

          // Internal actions
          setUser: (user: User | null) => void;
          setSession: (session: Session | null) => void;
          setLoading: (loading: boolean) => void;
          setError: (error: string | null) => void;
          incrementLoginAttempts: () => void;
          resetLoginAttempts: () => void;
          
          // Database sync actions
          syncUserProfile: (userId: string) => Promise<void>;
          createUserProfile: (userData: any) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

type AuthStore = AuthState & AuthActions;

// Build User object from Appwrite User and Database Profile
const buildUserFromAppwriteUser = async (appwriteUser: Models.User<Models.Preferences>): Promise<User> => {
  const prefs = appwriteUser.prefs || {};

  let role: UserRole = UserRole.VIEWER;
  let isActive = true;
  let avatar: string | undefined;
  let metadata: Record<string, unknown> = prefs;

  // Try to get user profile from database with better error handling
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
      
      authLogger.info('Successfully fetched user profile from database', {
        userId: appwriteUser.$id,
        role: profile.role
      });
    } else if (error) {
      authLogger.warn('Database query returned error, using preferences fallback', {
        userId: appwriteUser.$id,
        error: error.message,
        errorType: (error as any).type || 'unknown'
      });
    } else {
      authLogger.info('No user profile found in database, using preferences', {
        userId: appwriteUser.$id
      });
    }
  } catch (error: any) {
    authLogger.error('Failed to fetch user profile from database, using preferences', { 
      userId: appwriteUser.$id, 
      error: error.message,
      errorType: (error as any).type || 'unknown'
    });
  }

  // Always fallback to preferences if database query fails or returns no data
  const rawRole = (prefs as any).role as string;
  if (rawRole) {
    const normalizedRole = normalizeRoleToEnglish(rawRole);
    if (Object.values(UserRole).includes(normalizedRole as UserRole)) {
      role = normalizedRole as UserRole;
      authLogger.info('Using role from preferences', {
        userId: appwriteUser.$id,
        rawRole,
        normalizedRole
      });
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

export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          // Initial state
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
          showLoginModal: false,
          rememberMe: false,
          loginAttempts: 0,
          sessionExpiryWarningShown: false,

          // Initialize authentication
          initializeAuth: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              // Get current account session
              const appwriteUser = await account.get();

              if (appwriteUser) {
                const user = await buildUserFromAppwriteUser(appwriteUser);

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
                  authLogger.info('Updated Appwrite preferences with database role on init', {
                    userId: user.id,
                    role: user.role
                  });
                  }
                } catch (prefsError) {
                  authLogger.error('Failed to update Appwrite preferences on init', {
                    userId: user.id,
                    error: prefsError
                  });
                  // Continue even if preferences update fails
                }

                set((state) => {
                  state.user = user;
                  state.isAuthenticated = true;
                  state.session = {
                    userId: appwriteUser.$id,
                    expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  };
                });
              }

              set((state) => {
                state.isLoading = false;
                state.isInitialized = true;
              });
            } catch (error: any) {
              // Handle 401 errors gracefully - user just needs to login
              if (error?.code === 401 || error?.type === 'general_unauthorized_scope') {
                authLogger.info('No active session found during initialization');
              } else {
                authLogger.error('auth initialization', error);
              }
              
              set((state) => {
                state.user = null;
                state.session = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.isInitialized = true;
                state.error = null; // Don't show error for expected 401
              });
            }
          },

          // Login action
          login: async (email: string, password: string, rememberMe = false) => {
            const state = get();

            // Rate limiting
            if (state.loginAttempts >= 5) {
              const lastAttempt = state.lastLoginAttempt;
              if (lastAttempt && Date.now() - lastAttempt.getTime() < 15 * 60 * 1000) {
                throw new Error('Çok fazla deneme. 15 dakika sonra tekrar deneyin.');
              } else {
                get().resetLoginAttempts();
              }
            }

            set((state) => {
              state.isLoading = true;
              state.error = null;
              state.rememberMe = rememberMe;
            });

            try {
              authLogger.info('Attempting login', { email });
              
              // Development credentials fallback
              const DEV_CREDENTIALS = {
                'admin@dernek.org': 'admin123',
                'manager@dernek.org': 'manager123',
                'operator@dernek.org': 'operator123',
                'viewer@dernek.org': 'viewer123',
                'isahamid095@gmail.com': 'Vadalov95.',
              };
              
              if (DEV_CREDENTIALS[email as keyof typeof DEV_CREDENTIALS] === password) {
                authLogger.info('Using development credentials', { email });
                
                const mockUser = {
                  id: 'dev-user-' + Date.now(),
                  email: email,
                  name: email.split('@')[0],
                  role: 'admin' as UserRole,
                  avatar: undefined,
                  permissions: ROLE_PERMISSIONS.admin,
                  metadata: {},
                  lastLogin: new Date(),
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                
                set((state) => {
                  state.user = mockUser;
                  state.session = {
                    userId: mockUser.id,
                    expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  };
                  state.isAuthenticated = true;
                  state.isLoading = false;
                  state.error = null;
                });
                
                get().resetLoginAttempts();
                toast.success(`Hoş geldiniz, ${mockUser.name}!`, { duration: 3000 });
                return;
              }
              
              // Create email session
              await account.createEmailPasswordSession(email, password);
              authLogger.info('Email session created successfully', { email });

              // Get user data
              const appwriteUser = await account.get();
              authLogger.info('Retrieved Appwrite user data', { 
                userId: appwriteUser.$id,
                email: appwriteUser.email 
              });
              
              const user = await buildUserFromAppwriteUser(appwriteUser);
              authLogger.info('Built user object successfully', { 
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
                  authLogger.info('Updated Appwrite preferences with database role', {
                    userId: user.id,
                    role: user.role
                  });
                }
              } catch (prefsError: any) {
                authLogger.error('Failed to update Appwrite preferences', {
                  userId: user.id,
                  error: prefsError.message,
                  errorType: (prefsError as any).type || 'unknown'
                });
                // Continue even if preferences update fails
              }

              set((state) => {
                state.user = user;
                state.session = {
                  userId: appwriteUser.$id,
                  expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                };
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
              });

              get().resetLoginAttempts();

              toast.success(`Hoş geldiniz, ${user.name}!`, { duration: 3000 });
            } catch (error: unknown) {
              get().incrementLoginAttempts();

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
                
                authLogger.error('Appwrite login error', {
                  email,
                  errorType: error.type,
                  errorCode: error.code,
                  errorMessage: error.message
                });
              } else if (error instanceof Error) {
                
                // Check for network errors
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                  errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
                } else if (error.message.includes('timeout')) {
                  errorMessage = 'Bağlantı zaman aşımı. Lütfen tekrar deneyin.';
                } else {
                  errorMessage = error.message || 'Bilinmeyen hata oluştu';
                }
                
                authLogger.error('Login error', {
                  email,
                  errorName: error.name,
                  errorMessage: error.message
                });
              } else {
                authLogger.error('Unknown login error', {
                  email,
                  error: error
                });
              }

              set((state) => {
                state.isLoading = false;
                state.error = errorMessage;
              });

              toast.error(errorMessage, { duration: 4000 });
              throw new Error(errorMessage);
            }
          },

          // Logout action
          logout: async (callback?: () => void) => {
            try {
              await account.deleteSession('current');

              set((state) => {
                state.user = null;
                state.session = null;
                state.isAuthenticated = false;
                state.error = null;
                state.sessionExpiresAt = undefined;
                state.showLoginModal = false;
                state.sessionExpiryWarningShown = false;
                state.sessionExpiryWarningTime = undefined;
              });

              toast.success('Başarıyla çıkış yaptınız', { duration: 2000 });
              if (callback) {
                callback();
              } else {
                window.location.href = '/login';
              }
            } catch (error: unknown) {
              authLogger.error('logout', error);
              // Even if logout fails on server, clear local state
              set((state) => {
                state.user = null;
                state.session = null;
                state.isAuthenticated = false;
                state.sessionExpiryWarningShown = false;
                state.sessionExpiryWarningTime = undefined;
              });
              toast.error('Çıkış yapılırken hata oluştu', { duration: 3000 });
              if (callback) {
                callback();
              } else {
                window.location.href = '/login';
              }
            }
          },

          // Register action
          register: async (userData: RegisterData) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
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
              } catch (dbError) {
                authLogger.error('Failed to create user profile in database', { 
                  userId, 
                  error: dbError 
                });
                // Continue even if database profile creation fails
              }

              toast.success('Kayıt başarılı! Giriş yapabilirsiniz.', {
                duration: 5000,
              });

              set((state) => {
                state.isLoading = false;
              });
            } catch (error: unknown) {
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

              set((state) => {
                state.isLoading = false;
                state.error = errorMessage;
              });

              toast.error(errorMessage, { duration: 4000 });
              throw new Error(errorMessage);
            }
          },

          // Reset password action
          resetPassword: async (email: string) => {
            try {
              await account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
              );

              toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi', {
                duration: 5000,
              });
            } catch (error: unknown) {
              const errorMessage =
                error instanceof AppwriteException
                  ? error.message
                  : 'Şifre sıfırlama bağlantısı gönderilemedi';
              toast.error(errorMessage, { duration: 4000 });
              throw new Error(errorMessage);
            }
          },

          // Update profile action
          updateProfile: async (userData: Partial<User>) => {
            const { user } = get();
            if (!user) {
              throw new Error('Kullanıcı oturumu bulunamadı');
            }

            try {
              // Update name if provided
              if (userData.name) {
                await account.updateName(userData.name);
              }

              // Update preferences
              const newPrefs = {
                ...(user.metadata || {}),
                ...userData.metadata,
                name: userData.name || user.name,
                avatar_url: userData.avatar,
                role: userData.role || user.role,
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

                await db.update(collections.USER_PROFILES, user.id, updateData);
              } catch (dbError) {
                authLogger.error('Failed to update user profile in database', { 
                  userId: user.id, 
                  error: dbError 
                });
                // Continue even if database update fails
              }

              const updatedUser = { ...user, ...userData, updatedAt: new Date() } as User;
              set((state) => {
                state.user = updatedUser;
              });

              toast.success('Profil başarıyla güncellendi', { duration: 3000 });
            } catch (error: unknown) {
              const errorMessage =
                error instanceof AppwriteException
                  ? error.message
                  : 'Profil güncellenemedi';
              toast.error(errorMessage, { duration: 4000 });
              throw new Error(errorMessage);
            }
          },

          // Session management
          refreshSession: async () => {
            const { refreshPromise } = get();

            // Prevent multiple simultaneous refresh attempts
            if (refreshPromise) {
              return refreshPromise;
            }

            const promise = (async () => {
              try {
                // Get current session
                const appwriteUser = await account.get();

                if (appwriteUser) {
                  const user = await buildUserFromAppwriteUser(appwriteUser);
                  set((state) => {
                    state.user = user;
                    state.session = {
                      userId: appwriteUser.$id,
                      expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                    };
                    state.error = null;
                    state.sessionExpiryWarningShown = false;
                    state.sessionExpiryWarningTime = undefined;
                  });
                }
              } catch (error) {
                authLogger.error('session refresh', error);
                toast.error('Oturum yenilenemedi. Lütfen tekrar giriş yapın.', { duration: 0 });
                await get().logout();
              } finally {
                set((state) => {
                  state.refreshPromise = undefined;
                });
              }
            })();

            set((state) => {
              state.refreshPromise = promise;
            });

            return promise;
          },

          checkSessionExpiry: () => {
            const { session, isAuthenticated, sessionExpiryWarningShown, sessionExpiryWarningTime } = get();

            if (!isAuthenticated || !session) return;

            const expiryTime = new Date(session.expire).getTime();
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            // If session has expired
            if (expiryTime <= now) {
              get().handleSessionExpired();
              return;
            }

            // If session expires in less than 5 minutes and warning not shown
            if (expiryTime - now < fiveMinutes && !sessionExpiryWarningShown) {
              set((state) => {
                state.sessionExpiryWarningShown = true;
                state.sessionExpiryWarningTime = new Date();
              });
              toast('Oturumunuz sona ermek üzere. Devam etmek ister misiniz?', {
                duration: 0,
                action: {
                  label: 'Devam Et',
                  onClick: () => {
                    get().dismissSessionWarning();
                    get().refreshSession();
                  },
                },
              });
            }

            // If warning was shown more than 5 minutes ago and no action, logout
            if (sessionExpiryWarningShown && sessionExpiryWarningTime && now - sessionExpiryWarningTime.getTime() > fiveMinutes) {
              get().handleSessionExpired();
            }
          },

          // Session management actions
          dismissSessionWarning: () => {
            set((state) => {
              state.sessionExpiryWarningShown = false;
              state.sessionExpiryWarningTime = undefined;
            });
          },

          handleSessionExpired: async () => {
            toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.', { duration: 0 });
            await get().logout();
          },

          // Permission helpers
          hasPermission: (permission: Permission) => {
            const { user, isAuthenticated } = get();
            if (!user || !isAuthenticated) return false;
            return user.permissions.includes(permission);
          },

          hasRole: (role: UserRole) => {
            const { user, isAuthenticated } = get();
            if (!user || !isAuthenticated) return false;
            return user.role === role;
          },

          hasAnyPermission: (permissions: Permission[]) => {
            const { user, isAuthenticated } = get();
            if (!user || !isAuthenticated) return false;
            return permissions.some((permission) => user.permissions.includes(permission));
          },

          hasAllPermissions: (permissions: Permission[]) => {
            const { user, isAuthenticated } = get();
            if (!user || !isAuthenticated) return false;
            return permissions.every((permission) => user.permissions.includes(permission));
          },

          // UI actions
          setShowLoginModal: (show: boolean) => {
            set((state) => {
              state.showLoginModal = show;
            });
          },

          clearError: () => {
            set((state) => {
              state.error = null;
            });
          },

          setRememberMe: (remember: boolean) => {
            set((state) => {
              state.rememberMe = remember;
            });
          },

          // Internal actions
          setUser: (user: User | null) => {
            set((state) => {
              state.user = user;
            });
          },

          setSession: (session: Session | null) => {
            set((state) => {
              state.session = session;
            });
          },

          setLoading: (loading: boolean) => {
            set((state) => {
              state.isLoading = loading;
            });
          },

          setError: (error: string | null) => {
            set((state) => {
              state.error = error;
            });
          },

          incrementLoginAttempts: () => {
            set((state) => {
              state.loginAttempts += 1;
              state.lastLoginAttempt = new Date();
            });
          },

          resetLoginAttempts: () => {
            set((state) => {
              state.loginAttempts = 0;
              state.lastLoginAttempt = undefined;
            });
          },

          // Sync user profile with database
          syncUserProfile: async (userId: string) => {
            try {
              const { data: profileData, error } = await db.list(
                collections.USER_PROFILES,
                [Query.equal('$id', userId)]
              );

              if (!error && profileData?.documents?.[0]) {
                const profile = profileData.documents[0];
                const { user } = get();
                
                if (user && user.id === userId) {
                  const updatedUser = {
                    ...user,
                    role: (profile.role as UserRole) || user.role,
                    isActive: profile.is_active !== false,
                    avatar: profile.avatar_url || user.avatar,
                    metadata: { ...user.metadata, ...profile },
                    updatedAt: new Date(),
                  };
                  
                  set((state) => {
                    state.user = updatedUser;
                  });
                  
                  authLogger.info('User profile synced with database', { userId });
                }
              }
            } catch (error) {
              authLogger.error('Failed to sync user profile', { userId, error });
            }
          },

          // Create user profile for existing Appwrite users
          createUserProfile: async (userData: any) => {
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
              
              authLogger.info('User profile created in database', { userId: userData.id });
            } catch (error) {
              authLogger.error('Failed to create user profile', { userId: userData.id, error });
              throw error;
            }
          },
        })),
        {
          name: 'auth-store',
          partialize: (state) => ({
            rememberMe: state.rememberMe,
            loginAttempts: state.loginAttempts,
            lastLoginAttempt: state.lastLoginAttempt,
          }),
          version: 2, // Changed version to clear old Supabase data
          migrate: (persistedState: any, version: number) => {
            // Clear any old Supabase data and reset to clean state
            if (version < 2) {
              console.log('🧹 Migrating auth store from version', version, 'to version 2 - clearing old data');
              return {
                rememberMe: false,
                loginAttempts: 0,
                lastLoginAttempt: null,
              };
            }
            return persistedState;
          },
        },
      ),
    ),
  ),
);

// Session expiry checker - runs every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    useAuthStore.getState().checkSessionExpiry();
  }, 60 * 1000);
}

// Selectors for performance optimization
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  error: (state: AuthStore) => state.error,
  permissions: (state: AuthStore) => state.user?.permissions ?? [],
  role: (state: AuthStore) => state.user?.role,
  session: (state: AuthStore) => state.session,
  sessionExpiresAt: (state: AuthStore) => state.sessionExpiresAt,
};

// Export authStore with getState method
export const authStore = useAuthStore;
