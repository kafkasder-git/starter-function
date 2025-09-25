import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '../lib/supabase';
import { authLogger } from '../lib/logging';
import type { Permission } from '../types/auth';
import { ROLE_PERMISSIONS, UserRole } from '../types/auth';

// Error type for Supabase auth operations
interface AuthError {
  message: string;
  status?: number;
  statusText?: string;
}

// Mutable version of User interface for Zustand store
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
}

interface AuthActions {
  // Authentication actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;

  // Session management
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSessionExpiry: () => void;

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
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

type AuthStore = AuthState & AuthActions;

// Build User object from Supabase User
const buildUserFromSupabaseUser = (supabaseUser: SupabaseUser): User => {
  const metadata = supabaseUser.user_metadata;
  const appMetadata = supabaseUser.app_metadata;

  let role: UserRole = UserRole.VIEWER;
  if (appMetadata.role && Object.values(UserRole).includes(appMetadata.role as UserRole)) {
    role = appMetadata.role as UserRole;
  } else if (metadata.role && Object.values(UserRole).includes(metadata.role as UserRole)) {
    role = metadata.role as UserRole;
  }

  const {email} = supabaseUser;
  if (!email) {
    throw new Error('User email is required');
  }

  return {
    id: supabaseUser.id,
    email,
    name: (metadata.name as string) || (metadata.full_name as string) || email.split('@')[0],
    role,
    avatar: (metadata.avatar_url as string) || (appMetadata.avatar_url as string),
    permissions: ROLE_PERMISSIONS[role],
    metadata: { ...metadata, ...appMetadata },
    lastLogin: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined,
    isActive: true,
    createdAt: new Date(supabaseUser.created_at),
    updatedAt: new Date(supabaseUser.updated_at ?? supabaseUser.created_at),
  };
};

// Session management helpers
const isSessionExpired = (session: Session | null): boolean => {
  if (!session?.expires_at) return true;
  const expiresAt = session.expires_at * 1000;
  const now = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  return expiresAt - bufferTime <= now;
};

const shouldRefreshSession = (session: Session | null): boolean => {
  if (!session?.expires_at) return false;
  const expiresAt = session.expires_at * 1000;
  const now = Date.now();
  const refreshThreshold = 10 * 60 * 1000; // Refresh 10 minutes before expiry
  return expiresAt - refreshThreshold <= now;
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

          // Initialize authentication
          initializeAuth: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {

              // Get initial session
              const {
                data: { session },
                error,
              } = await supabase.auth.getSession();

              if (error) {
                authLogger.error('getting session', error);
                set((state) => {
                  state.error = error.message;
                  state.isLoading = false;
                  state.isInitialized = true;
                });
                return;
              }

              if (session?.user && session.expires_at) {
                const user = buildUserFromSupabaseUser(session.user);
                set((state) => {
                  state.user = user;
                  state.session = session;
                  state.isAuthenticated = true;
                  state.sessionExpiresAt = session.expires_at
                    ? new Date(session.expires_at * 1000)
                    : undefined;
                });
              }

              set((state) => {
                state.isLoading = false;
                state.isInitialized = true;
              });

              // Setup auth state listener
              supabase.auth.onAuthStateChange((event, session) => {
                const store = get();

                try {
                  if (event === 'SIGNED_IN' && session?.user && session.expires_at) {
                    const user = buildUserFromSupabaseUser(session.user);
                    set((state) => {
                      state.user = user;
                      state.session = session;
                      state.isAuthenticated = true;
                      state.error = null;
                      state.sessionExpiresAt = session.expires_at
                        ? new Date(session.expires_at * 1000)
                        : undefined;
                    });

                    store.resetLoginAttempts();
                  } else if (event === 'SIGNED_OUT') {
                    set((state) => {
                      state.user = null;
                      state.session = null;
                      state.isAuthenticated = false;
                      state.error = null;
                      state.sessionExpiresAt = undefined;
                    });
                  } else if (event === 'TOKEN_REFRESHED' && session?.user && session.expires_at) {
                    const user = buildUserFromSupabaseUser(session.user);
                    set((state) => {
                      state.user = user;
                      state.session = session;
                      state.sessionExpiresAt = session.expires_at
                        ? new Date(session.expires_at * 1000)
                        : undefined;
                      state.error = null;
                    });
                  }
                } catch (error) {
                  authLogger.error('auth state change', error);
                  set((state) => {
                    state.error = 'Kimlik doğrulama hatası';
                  });
                }
              });
            } catch (error) {
              authLogger.error('auth initialization', error);
              set((state) => {
                state.error = 'Kimlik doğrulama başlatılamadı';
                state.isLoading = false;
                state.isInitialized = true;
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
              const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (error) {
                get().incrementLoginAttempts();
                throw error;
              }

              const user = buildUserFromSupabaseUser(data.user);

              set((state) => {
                state.user = user;
                state.session = data.session;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
                state.sessionExpiresAt = data.session.expires_at
                  ? new Date(data.session.expires_at * 1000)
                  : undefined;
              });

              get().resetLoginAttempts();

              toast.success(`Hoş geldiniz, ${user.name}!`, {
                duration: 3000,
              });
            } catch (error: unknown) {
              let errorMessage = 'Giriş yapılamadı';

              if (error && typeof error === 'object' && 'message' in error) {
                const authError = error as AuthError;
                switch (authError.message) {
                  case 'Invalid login credentials':
                    errorMessage = 'Geçersiz email veya şifre';
                    break;
                  case 'Email not confirmed':
                    errorMessage = 'Email adresinizi doğrulayın';
                    break;
                  case 'Too many requests':
                    errorMessage = 'Çok fazla deneme. Lütfen bekleyin';
                    break;
                  default:
                    errorMessage = authError.message || 'Giriş yapılamadı';
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

          // Logout action
          logout: async () => {
            try {
              const { error } = await supabase.auth.signOut();

              if (error) {
                throw error;
              }

              set((state) => {
                state.user = null;
                state.session = null;
                state.isAuthenticated = false;
                state.error = null;
                state.sessionExpiresAt = undefined;
                state.showLoginModal = false;
              });

              toast.success('Başarıyla çıkış yaptınız', { duration: 2000 });
            } catch (error: unknown) {
              authLogger.error('logout', error);
              toast.error('Çıkış yapılırken hata oluştu', { duration: 3000 });
            }
          },

          // Register action
          register: async (userData: RegisterData) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const { error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                  data: {
                    name: userData.name,
                    role: userData.role ?? UserRole.VIEWER,
                  },
                },
              });

              if (error) {
                throw error;
              }

              toast.success('Kayıt başarılı! Email adresinizi doğrulayın.', {
                duration: 5000,
              });

              set((state) => {
                state.isLoading = false;
              });
            } catch (error: unknown) {
              let errorMessage = 'Kayıt oluşturulamadı';

              if (error && typeof error === 'object' && 'message' in error) {
                const authError = error as AuthError;
                switch (authError.message) {
                  case 'User already registered':
                    errorMessage = 'Bu email adresi zaten kayıtlı';
                    break;
                  case 'Password should be at least 6 characters':
                    errorMessage = 'Şifre en az 6 karakter olmalıdır';
                    break;
                  default:
                    errorMessage = authError.message || 'Kayıt oluşturulamadı';
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
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });

              if (error) {
                throw error;
              }

              toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi', {
                duration: 5000,
              });
            } catch (error: unknown) {
              const errorMessage = (error && typeof error === 'object' && 'message' in error) 
                ? (error as AuthError).message 
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
              const { error } = await supabase.auth.updateUser({
                data: {
                  name: userData.name,
                  avatar_url: userData.avatar,
                  ...userData.metadata,
                },
              });

              if (error) {
                throw error;
              }

              const updatedUser = { ...user, ...userData, updatedAt: new Date() };
              set((state) => {
                state.user = updatedUser;
              });

              toast.success('Profil başarıyla güncellendi', { duration: 3000 });
            } catch (error: unknown) {
              const errorMessage = (error && typeof error === 'object' && 'message' in error) 
                ? (error as AuthError).message 
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
                const { data, error } = await supabase.auth.refreshSession();

                if (error) {
                  throw error;
                }

                if (data.session?.user) {
                  const user = buildUserFromSupabaseUser(data.session.user);
                  set((state) => {
                    state.user = user;
                    state.session = data.session;
                    state.sessionExpiresAt = data.session
                      ? data.session.expires_at
                        ? new Date(data.session.expires_at * 1000)
                        : undefined
                      : undefined;
                    state.error = null;
                  });
                }
              } catch (error) {
                authLogger.error('session refresh', error);
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
            const { session, isAuthenticated } = get();

            if (!isAuthenticated || !session) return;

            if (isSessionExpired(session)) {
              void get().logout();
              toast.error('Oturumunuz sona erdi. Lütfen tekrar giriş yapın.', {
                duration: 5000,
              });
            } else if (shouldRefreshSession(session)) {
              void get().refreshSession();
            }
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
        })),
        {
          name: 'auth-store',
          partialize: (state) => ({
            rememberMe: state.rememberMe,
            loginAttempts: state.loginAttempts,
            lastLoginAttempt: state.lastLoginAttempt,
          }),
          version: 1,
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