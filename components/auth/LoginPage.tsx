/**
 * @fileoverview LoginPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Lock, Mail, Shield, AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuthStore } from '../../stores/authStore';
import { account } from '../../lib/appwrite';
import { logger } from '../../lib/logging/logger';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

/**
 * LoginPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Clear errors when user starts typing or submits form
  useEffect(() => {
    if (error) {
      // Only auto-clear after 10 seconds instead of 5
      const timer = setTimeout(() => {
        clearError();
      }, 10000);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [error, clearError]);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!credentials.email) {
      errors.email = 'Kullanıcı adı veya email gerekli';
    }

    if (!credentials.password) {
      errors.password = 'Şifre gerekli';
    } else if (credentials.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalı';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials.email, credentials.password, credentials.rememberMe);
      onLoginSuccess?.();
      // Redirect logic
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch {
      // Error is handled in auth store
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (field in formErrors && formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error('Lütfen e-posta adresinizi girin');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error('Geçerli bir e-posta adresi girin');
      return;
    }

    try {
      setIsResetting(true);

      if (!account) {
        throw new Error('Appwrite account not configured');
      }

      await account.createRecovery(
        resetEmail,
        `${window.location.origin}/reset-password` // Redirect URL
      );

      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
      setShowResetDialog(false);
      setResetEmail('');
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      toast.error('Şifre sıfırlama talebi gönderilemedi');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-neutral-100 p-4">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-16 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-24 right-1/5 h-48 w-48 rounded-full bg-info-500/10 blur-3xl" />
        <div className="absolute right-1/3 top-1/2 h-32 w-32 rounded-full bg-success-500/10 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="border-primary-100/60 bg-white/90 shadow-xl shadow-primary-500/10 backdrop-blur-xl">
          <CardHeader className="space-y-5 pb-0 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-info-500 to-primary-600 text-white shadow-lg shadow-primary-500/30"
            >
              <Shield className="h-8 w-8" />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight text-neutral-900">
                Dernek Yönetim Sistemi
              </CardTitle>
              <CardDescription className="text-sm text-neutral-600">
                Yetkilendirilmiş hesabınızla giriş yaparak yönetim paneline erişin.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive" className="flex items-start gap-2 border-error-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <AlertDescription className="flex-1">
                    <div className="space-y-2">
                      <div className="font-medium">{error}</div>
                      {error.includes('Ağ bağlantısı') && (
                        <div className="text-sm text-error-700">
                          <ul className="list-inside list-disc space-y-1">
                            <li>İnternet bağlantınızı kontrol edin</li>
                            <li>Sayfayı yenileyin (F5)</li>
                            <li>Birkaç dakika sonra tekrar deneyin</li>
                          </ul>
                        </div>
                      )}
                      {error.includes('Geçersiz email') && (
                        <div className="text-sm text-error-700">
                          <ul className="list-inside list-disc space-y-1">
                            <li>Email adresinizi kontrol edin</li>
                            <li>Şifrenizi kontrol edin</li>
                            <li>Hesabınızın aktif olduğundan emin olun</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                  <button
                    type="button"
                    onClick={clearError}
                    className="flex-shrink-0 text-error-500 transition-colors hover:text-error-700"
                    aria-label="Hata mesajını kapat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-700">
                  Kullanıcı Adı / Email
                </Label>
                <Input
                  id="email"
                  type="text"
                  prefixIcon={<Mail className="h-full w-full" />}
                  placeholder="admin veya e-posta adresi"
                  value={credentials.email}
                  onChange={(e) => {
                    handleInputChange('email', e.target.value);
                  }}
                  inputSize="lg"
                  autoComplete="username"
                  error={Boolean(formErrors.email)}
                  errorText={formErrors.email}
                  helperText="Yetkilendirilmiş kullanıcı adınızı veya e-posta adresinizi girin"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-700">
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  prefixIcon={<Lock className="h-full w-full" />}
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={(e) => {
                    handleInputChange('password', e.target.value);
                  }}
                  inputSize="lg"
                  autoComplete="current-password"
                  error={Boolean(formErrors.password)}
                  errorText={formErrors.password}
                  helperText="En az 6 karakter içermelidir"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="rememberMe" className="flex items-center gap-2 text-sm text-neutral-600">
                  <Checkbox
                    id="rememberMe"
                    checked={credentials.rememberMe}
                    onCheckedChange={(checked: boolean) => {
                      handleInputChange('rememberMe', checked);
                    }}
                    disabled={isLoading}
                  />
                  Beni hatırla
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetDialog(true);
                  }}
                  className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-500"
                >
                  Şifremi unuttum
                </button>
              </div>

              <Button
                type="submit"
                variant="primaryGradient"
                size="xl"
                fullWidth
                loading={isLoading}
                loadingText="Giriş yapılıyor..."
                className="shadow-lg shadow-primary-500/25"
              >
                Giriş Yap
              </Button>
            </form>

            <div className="border-t pt-4 text-center">
              <p className="text-xs text-neutral-500">
                Şifre sıfırlama yardımı için lütfen yetkili sistem yöneticinizle iletişime geçin.
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-neutral-500">
            © 2024 Dernek Yönetim Sistemi. Tüm hakları saklıdır.
          </p>
        </motion.div>
      </motion.div>

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neutral-900">
              <Mail className="h-5 w-5" />
              Şifre Sıfırlama
            </DialogTitle>
            <DialogDescription>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordReset} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail" className="text-neutral-700">
                E-posta Adresi
              </Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                }}
                placeholder="ornek@email.com"
                required
                inputSize="lg"
                autoComplete="email"
                disabled={isResetting}
              />
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowResetDialog(false);
                  setResetEmail('');
                }}
                disabled={isResetting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="primaryGradient"
                loading={isResetting}
                loadingText="Gönderiliyor..."
              >
                Sıfırlama Bağlantısı Gönder
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoginPage;
