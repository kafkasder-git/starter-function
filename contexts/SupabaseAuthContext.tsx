/**
 * @fileoverview SupabaseAuthContext Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { isSupabaseConfigured, supabase, setCSRFToken } from '../lib/supabase';
import { generateCSRFToken, revokeUserCSRFTokens } from '../middleware/csrf';
import { auditService } from '../services/auditService';

import { logger } from '../lib/logging/logger';
// Supabase Auth Context Types
interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

/**
 * SupabaseAuthProvider function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = Boolean(user) && Boolean(session);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.error('Error getting session:', error);
          setError(error.message);
        } else if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        logger.error('Auth initialization error:', error);
        if (mounted) {
          setError('Kimlik doğrulama başlatılamadı');
        }
      } finally {
        if (mounted) {
          // Set loading to false immediately without delay
          setTimeout(() => {
            setIsLoading(false);
          }, 10);
        }
      }
    };

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth state change:', event, session?.user?.email);

      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Handle auth events
        switch (event) {
          case 'SIGNED_IN':
            // Generate CSRF token on sign in
            if (session?.user?.id) {
              const csrfToken = generateCSRFToken(session.user.id);
              setCSRFToken(csrfToken);
              logger.info('CSRF token generated for user:', session.user.email);

              // Log successful login
              auditService
                .logLogin(session.user.id, session.user.email ?? 'unknown')
                .catch((err) => {
                  logger.error('Error logging login:', err);
                });
            }
            logger.info('User signed in:', session.user.email);
            break;
          case 'SIGNED_OUT':
            // Revoke CSRF tokens on sign out
            if (user?.id) {
              revokeUserCSRFTokens(user.id);
              setCSRFToken(null);

              // Log logout
              auditService.logLogout(user.id, user.email ?? 'unknown').catch((err) => {
                logger.error('Error logging logout:', err);
              });
              logger.info('CSRF tokens revoked for user');
            }
            toast.success('Başarıyla çıkış yaptınız');
            break;
          case 'TOKEN_REFRESHED':
            // Refresh CSRF token on auth token refresh
            if (session?.user?.id) {
              const csrfToken = generateCSRFToken(session.user.id);
              setCSRFToken(csrfToken);
              logger.info('CSRF token refreshed');
            }
            logger.info('Token refreshed');
            break;
          case 'USER_UPDATED':
            logger.info('User updated');
            break;
          case 'INITIAL_SESSION':
          case 'PASSWORD_RECOVERY':
          case 'MFA_CHALLENGE_VERIFIED':
            // Handle other auth events
            logger.info('Auth event:', event);
            break;
        }
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      const errorMessage =
        'Supabase konfigürasyonu eksik. Lütfen administrator ile iletişime geçin.';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Success is handled by onAuthStateChange
    } catch (error: any) {
      let errorMessage = 'Giriş yapılamadı';

      switch (error.message) {
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
          errorMessage = error.message ?? 'Giriş yapılamadı';
      }

      setError(errorMessage);
      toast.error(errorMessage, { duration: 4000 });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      const errorMessage =
        'Supabase konfigürasyonu eksik. Lütfen administrator ile iletişime geçin.';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Kayıt başarılı! Email adresinizi kontrol edin.', { duration: 5000 });
    } catch (error: any) {
      let errorMessage = 'Kayıt olunamadı';

      switch (error.message) {
        case 'User already registered':
          errorMessage = 'Bu email adresi zaten kayıtlı';
          break;
        case 'Password should be at least 6 characters':
          errorMessage = 'Şifre en az 6 karakter olmalı';
          break;
        default:
          errorMessage = error.message ?? 'Kayıt olunamadı';
      }

      setError(errorMessage);
      toast.error(errorMessage, { duration: 4000 });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      // Clear local state even if Supabase is not configured
      setUser(null);
      setSession(null);
      setIsLoading(false);
      toast.success('Çıkış yapıldı');
      return;
    }

    try {
      // Try to sign out from Supabase with local scope
      // Using 'local' scope to only clear local storage, not all sessions
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        // Log the error but don't block logout
        logger.warn('Supabase signOut API error (non-blocking):', error);
      }

      // Always clear local state regardless of API response
      // This ensures users can log out even if Supabase API fails
      setUser(null);
      setSession(null);

      toast.success('Çıkış yapıldı', { duration: 2000 });
    } catch (error: any) {
      // Even if Supabase API fails completely, clear local state
      logger.error('SignOut error (clearing local state anyway):', error);
      setUser(null);
      setSession(null);
      toast.success('Çıkış yapıldı', { duration: 2000 });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      const errorMessage =
        'Supabase konfigürasyonu eksik. Lütfen administrator ile iletişime geçin.';
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success('Şifre sıfırlama bağlantısı email adresinize gönderildi', { duration: 5000 });
    } catch (error: any) {
      const errorMessage = error.message ?? 'Şifre sıfırlama başarısız';
      setError(errorMessage);
      toast.error(errorMessage, { duration: 4000 });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const contextValue: SupabaseAuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
  };

  return (
    <SupabaseAuthContext.Provider value={contextValue}>{children}</SupabaseAuthContext.Provider>
  );
}

/**
 * useSupabaseAuth function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useSupabaseAuth(): SupabaseAuthContextType {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}
