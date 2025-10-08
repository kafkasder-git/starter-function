/**
 * @fileoverview useCSRFToken Hook - Custom hook for CSRF token management
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { generateCSRFToken } from '../middleware/csrf';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface CSRFTokenState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing CSRF tokens
 * Automatically generates and refreshes CSRF tokens for authenticated users
 */
export function useCSRFToken() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [state, setState] = useState<CSRFTokenState>({
    token: null,
    isLoading: false,
    error: null,
  });

  const generateToken = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      setState({ token: null, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const newToken = generateCSRFToken(user.id);
      setState({ token: newToken, isLoading: false, error: null });
      
      // Store token in sessionStorage for persistence
      sessionStorage.setItem('csrf_token', newToken);
    } catch (error) {
      setState({
        token: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate CSRF token',
      });
    }
  }, [user?.id, isAuthenticated]);

  const refreshToken = useCallback(() => {
    generateToken();
  }, [generateToken]);

  const clearToken = useCallback(() => {
    setState({ token: null, isLoading: false, error: null });
    sessionStorage.removeItem('csrf_token');
  }, []);

  // Generate token on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Check if token exists in sessionStorage
      const storedToken = sessionStorage.getItem('csrf_token');
      if (storedToken) {
        setState({ token: storedToken, isLoading: false, error: null });
      } else {
        generateToken();
      }
    } else {
      clearToken();
    }
  }, [isAuthenticated, user?.id, generateToken, clearToken]);

  // Refresh token every 1 hour
  useEffect(() => {
    if (!isAuthenticated || !state.token) return;

    const refreshInterval = setInterval(() => {
      refreshToken();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, state.token, refreshToken]);

  return {
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    refreshToken,
    clearToken,
  };
}

