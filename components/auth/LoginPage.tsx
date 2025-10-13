import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, Shield, AlertCircle, X, Users, Heart, LineChart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuthStore } from '../../stores/authStore';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [error, clearError]);

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
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch {
      // Error handled in auth store
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));

    if (field in formErrors && formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[520px] w-[520px] rounded-full bg-primary-500/25 blur-[130px]" />
        <div className="absolute right-[-120px] top-1/3 h-[420px] w-[420px] rounded-full bg-info-500/25 blur-[150px]" />
        <div className="absolute bottom-[-160px] left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-success-500/15 blur-[200px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-14 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:px-10 xl:px-16">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="order-2 space-y-10 text-primary-50 lg:order-1"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] backdrop-blur-md">
            <Shield className="h-4 w-4" />
            Sivil toplum için tasarlandı
          </span>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Yardım operasyonlarınızı tek panelden yönetin
            </h1>
            <p className="max-w-xl text-base text-primary-100/80 sm:text-lg">
              Gönüllüler, bağışçılar ve yardım süreçleri için tasarlanmış kurumsal yönetim
              sistemiyle ekiplerinizi tek merkezden koordine edin.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Users className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Gönüllü ağı</p>
                  <p className="text-xs text-primary-100/75">
                    Yetkilendirilmiş ekip üyelerinizi tek panelden yönetin.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Heart className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Etkin yardımlar</p>
                  <p className="text-xs text-primary-100/75">
                    Bağışların etkisini ve dağıtım süreçlerini gerçek zamanlı takip edin.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm sm:col-span-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                  <LineChart className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Analitik içgörüler</p>
                  <p className="text-xs text-primary-100/75">
                    Bağış, yardım ve kampanya performansını detaylı raporlarla analiz edin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-primary-100/80 backdrop-blur-sm">
            <Shield className="h-5 w-5 text-white" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Appwrite destekli güvenlik</p>
              <p className="text-sm text-primary-100/75">
                Rol tabanlı erişim ve oturum kontrolleriyle verileriniz koruma altında.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="order-1 w-full lg:order-2"
        >
          <Card className="border border-white/15 bg-white/95 text-neutral-900 shadow-2xl shadow-primary-900/20 backdrop-blur">
            <CardHeader className="space-y-5 pb-0">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 via-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-primary-600">
                    Yönetim Girişi
                  </span>
                  <CardTitle className="text-3xl font-semibold leading-tight text-neutral-900">
                    Dernek Yönetim Sistemi
                  </CardTitle>
                </div>
              </div>
              <CardDescription className="text-sm text-neutral-600">
                Yetkilendirilmiş hesabınızla giriş yaparak yardım operasyonlarını güvenle yönetin.
              </CardDescription>
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

                <div className="flex items-center">
                  <label
                    htmlFor="rememberMe"
                    className="flex items-center gap-2 text-sm text-neutral-600"
                  >
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={credentials.rememberMe}
                      onChange={(event) => {
                        handleInputChange('rememberMe', event.target.checked);
                      }}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border border-neutral-300 text-primary-600 shadow-sm transition-colors focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1"
                    />
                    Beni hatırla
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="xl"
                  fullWidth
                  className="corporate-gradient shadow-lg shadow-primary-500/25"
                  loading={isLoading}
                  loadingText="Giriş yapılıyor..."
                >
                  Giriş Yap
                </Button>
              </form>

              <div className="border-t pt-4 text-center">
                <p className="text-xs text-neutral-500">
                  Şifre yardımı için lütfen yetkili sistem yöneticinizle iletişime geçin.
                </p>
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-xs text-primary-100/80"
          >
            © 2024 Dernek Yönetim Sistemi. Tüm hakları saklıdır.
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

export default LoginPage;
