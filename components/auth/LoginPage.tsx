/**
 * @fileoverview LoginPage Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';

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
  const { signIn, isLoading, error, clearError } = useSupabaseAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
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
  }, [error, clearError]);

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
      await signIn(credentials.email, credentials.password, credentials.rememberMe);
      onLoginSuccess?.();
    } catch {
      // Error is handled in SupabaseAuthContext
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (field in formErrors && formErrors[field as keyof typeof formErrors]) {
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

      // TODO: Integrate with actual API
      // const result = await authService.resetPassword(resetEmail);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
      setShowResetDialog(false);
      setResetEmail('');
    } catch {
      toast.error('Şifre sıfırlama talebi gönderilemedi');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute top-1/4 left-1/4 h-32 w-32 rounded-full blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-slate-200/60 bg-white/95 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="from-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br via-blue-600 to-blue-800 shadow-lg motion-safe:animate-pulse"
            >
              <Shield className="h-8 w-8 text-white" />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                Dernek Yönetim Sistemi
              </CardTitle>
              <CardDescription className="font-medium text-slate-600">
                Hesabınızla giriş yapın
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant="destructive" className="border-red-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <AlertDescription className="flex-1">{error}</AlertDescription>
                  <button
                    type="button"
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                    aria-label="Hata mesajını kapat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-slate-700">
                  Kullanıcı Adı / Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="admin, manager, operator, viewer veya email adresi"
                    value={credentials.email}
                    onChange={(e) => {
                      handleInputChange('email', e.target.value);
                    }}
                    className={`focus:border-primary focus:ring-primary/20 h-12 border-slate-300 bg-white pl-10 ${
                      formErrors.email ? 'border-red-300 focus:border-red-400' : ''
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-sm font-medium text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-slate-700">
                  Şifre
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => {
                      handleInputChange('password', e.target.value);
                    }}
                    className={`focus:border-primary focus:ring-primary/20 h-12 border-slate-300 bg-white pr-10 pl-10 ${
                      formErrors.password ? 'border-red-300 focus:border-red-400' : ''
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-500 transition-colors hover:text-slate-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-sm font-medium text-red-600">{formErrors.password}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={credentials.rememberMe}
                  onCheckedChange={(checked: boolean) => {
                    handleInputChange('rememberMe', checked);
                  }}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="rememberMe"
                  className="cursor-pointer text-sm font-medium text-slate-600"
                >
                  Beni hatırla
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="from-primary hover:from-primary/90 h-12 w-full bg-gradient-to-r to-blue-700 font-semibold text-white shadow-lg transition-all duration-200 hover:to-blue-700/90 hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Giriş yapılıyor...
                  </div>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>

            <div className="pt-4 text-center">
              <p className="text-xs text-slate-500">
                Şifrenizi mi unuttunuz?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowResetDialog(true);
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Sıfırlama talebi
                </button>
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
          <p className="text-xs text-slate-500">
            © 2024 Dernek Yönetim Sistemi. Tüm hakları saklıdır.
          </p>
        </motion.div>
      </motion.div>

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Şifre Sıfırlama
            </DialogTitle>
            <DialogDescription>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">E-posta Adresi</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                }}
                placeholder="ornek@email.com"
                required
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
              <Button type="submit" disabled={isResetting}>
                {isResetting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Gönderiliyor...
                  </div>
                ) : (
                  'Sıfırlama Bağlantısı Gönder'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
