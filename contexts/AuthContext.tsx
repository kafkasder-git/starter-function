import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AuthContextType, AuthState, LoginCredentials, Permission, User } from '../types/auth';
import { ROLE_PERMISSIONS, UserRole } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for frontend-only authentication
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin',
    name: 'Ahmet Yılmaz - Sistem Yöneticisi',
    role: UserRole.ADMIN,
    permissions: ROLE_PERMISSIONS[UserRole.ADMIN],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    avatar: undefined,
  },
  {
    id: '2',
    email: 'manager',
    name: 'Fatma Demir - Dernek Müdürü',
    role: UserRole.MANAGER,
    permissions: ROLE_PERMISSIONS[UserRole.MANAGER],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    avatar: undefined,
  },
  {
    id: '3',
    email: 'operator',
    name: 'Mehmet Kaya - Operatör',
    role: UserRole.OPERATOR,
    permissions: ROLE_PERMISSIONS[UserRole.OPERATOR],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    avatar: undefined,
  },
  {
    id: '4',
    email: 'viewer',
    name: 'Ayşe Özkan - Görüntüleyici',
    role: UserRole.VIEWER,
    permissions: ROLE_PERMISSIONS[UserRole.VIEWER],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    avatar: undefined,
  },
];

// Default passwords for mock users
const MOCK_CREDENTIALS = {
  admin: 'admin123',
  manager: 'manager123',
  operator: 'operator123',
  viewer: 'viewer123',
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Frontend-only auth initialization
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check localStorage for persisted session
        const storedUser = localStorage.getItem('auth_user');
        const storedSession = localStorage.getItem('auth_session');

        if (storedUser && storedSession) {
          const user = JSON.parse(storedUser);
          const sessionData = JSON.parse(storedSession);

          // Check if session is still valid (24 hours)
          const sessionAge = Date.now() - sessionData.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours

          if (sessionAge < maxAge && mounted) {
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          } else {
            // Session expired, clear storage
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_session');
          }
        }

        if (mounted) {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_session');
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Kimlik doğrulama başlatılamadı',
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Find mock user
      const user = MOCK_USERS.find((u) => u.email === credentials.email);
      const expectedPassword = MOCK_CREDENTIALS[credentials.email as keyof typeof MOCK_CREDENTIALS];

      if (!user || credentials.password !== expectedPassword) {
        throw new Error('Kullanıcı adı veya şifre hatalı');
      }

      if (!user.isActive) {
        throw new Error('Hesabınız devre dışı bırakılmış');
      }

      // Create session
      const sessionData = {
        timestamp: Date.now(),
        rememberMe: credentials.rememberMe,
      };

      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_session', JSON.stringify(sessionData));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      toast.success(`Hoş geldiniz, ${user.name}!`, { duration: 3000 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Giriş yapılamadı';

      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      toast.error(errorMessage, {
        duration: 4000,
      });

      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear localStorage
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_session');

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      toast.success('Başarıyla çıkış yaptınız', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Çıkış yapılırken hata oluştu', {
        duration: 3000,
      });
    }
  };

  const checkPermission = (permission: Permission): boolean => {
    if (!authState.user || !authState.isAuthenticated) {
      return false;
    }

    return authState.user.permissions.includes(permission);
  };

  const hasRole = (role: UserRole): boolean => {
    if (!authState.user || !authState.isAuthenticated) {
      return false;
    }

    return authState.user.role === role;
  };

  const refreshUser = async (): Promise<void> => {
    if (!authState.isAuthenticated || !authState.user) {
      return;
    }

    try {
      // In a real app, this would fetch updated user data from the server
      // For mock auth, just refresh from stored data
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState((prev) => ({ ...prev, user }));
      }
    } catch (error) {
      console.error('User refresh error:', error);
      // For mock auth, if refresh fails, just log out
      await logout();
    }
  };

  const clearError = (): void => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    checkPermission,
    hasRole,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
