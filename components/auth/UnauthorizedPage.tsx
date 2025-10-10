/**
 * @fileoverview UnauthorizedPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { motion } from 'motion/react';
import { ShieldX, ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useAuthStore } from '../../stores/authStore';
import { Permission, UserRole } from '../../types/auth';

interface UnauthorizedPageProps {
  requiredRole?: UserRole;
  requiredPermission?: Permission;
  currentRole?: UserRole | null;
  onBack?: () => void;
  onGoHome?: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Sistem Yöneticisi',
  [UserRole.MANAGER]: 'Dernek Müdürü',
  [UserRole.OPERATOR]: 'Operatör',
  [UserRole.VIEWER]: 'Görüntüleyici',
};

const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.VIEW_DASHBOARD]: 'Dashboard Görüntüleme',
  [Permission.VIEW_DONATIONS]: 'Bağışları Görüntüleme',
  [Permission.CREATE_DONATION]: 'Bağış Oluşturma',
  [Permission.EDIT_DONATION]: 'Bağış Düzenleme',
  [Permission.DELETE_DONATION]: 'Bağış Silme',
  [Permission.VIEW_MEMBERS]: 'Üyeleri Görüntüleme',
  [Permission.CREATE_MEMBER]: 'Üye Oluşturma',
  [Permission.EDIT_MEMBER]: 'Üye Düzenleme',
  [Permission.DELETE_MEMBER]: 'Üye Silme',
  [Permission.VIEW_AID]: 'Yardımları Görüntüleme',
  [Permission.CREATE_AID]: 'Yardım Oluşturma',
  [Permission.EDIT_AID]: 'Yardım Düzenleme',
  [Permission.DELETE_AID]: 'Yardım Silme',
  [Permission.APPROVE_AID]: 'Yardım Onaylama',
  [Permission.VIEW_FINANCE]: 'Finansı Görüntüleme',
  [Permission.CREATE_FINANCE]: 'Finans Kaydı Oluşturma',
  [Permission.EDIT_FINANCE]: 'Finans Düzenleme',
  [Permission.DELETE_FINANCE]: 'Finans Silme',
  [Permission.MANAGE_FINANCIAL]: 'Mali Yönetim',
  [Permission.VIEW_MESSAGES]: 'Mesajları Görüntüleme',
  [Permission.SEND_MESSAGES]: 'Mesaj Gönderme',
  [Permission.VIEW_EVENTS]: 'Etkinlikleri Görüntüleme',
  [Permission.CREATE_EVENT]: 'Etkinlik Oluşturma',
  [Permission.EDIT_EVENT]: 'Etkinlik Düzenleme',
  [Permission.DELETE_EVENT]: 'Etkinlik Silme',
  [Permission.VIEW_SETTINGS]: 'Ayarları Görüntüleme',
  [Permission.EDIT_SETTINGS]: 'Ayarları Düzenleme',
  [Permission.VIEW_USERS]: 'Kullanıcıları Görüntüleme',
  [Permission.CREATE_USER]: 'Kullanıcı Oluşturma',
  [Permission.EDIT_USER]: 'Kullanıcı Düzenleme',
  [Permission.DELETE_USER]: 'Kullanıcı Silme',
  [Permission.VIEW_REPORTS]: 'Raporları Görüntüleme',
  [Permission.EXPORT_REPORTS]: 'Rapor Dışa Aktarma',
};

/**
 * UnauthorizedPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function UnauthorizedPage({
  requiredRole,
  requiredPermission,
  currentRole,
  onBack,
  onGoHome,
}: UnauthorizedPageProps) {
  const { user, logout } = useAuthStore();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-red-200/60 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <ShieldX className="w-8 h-8 text-white" />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                Erişim Reddedildi
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium">
                Bu sayfaya erişim yetkiniz bulunmuyor
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-red-50/80 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-red-800 font-semibold text-sm">Yetersiz Yetki</p>
                  <div className="text-red-700 text-sm space-y-1">
                    {requiredRole && (
                      <p>
                        <strong>Gerekli Rol:</strong> {ROLE_LABELS[requiredRole]}
                      </p>
                    )}
                    {requiredPermission && (
                      <p>
                        <strong>Gerekli İzin:</strong> {PERMISSION_LABELS[requiredPermission]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {user && (
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
                <div className="space-y-3">
                  <p className="text-slate-700 font-semibold text-sm">Mevcut Kullanıcı Bilgileri</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm">Kullanıcı:</span>
                      <span className="text-slate-900 font-medium text-sm">{user.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm">Mevcut Rol:</span>
                      <Badge variant="outline" className="text-xs">
                        {currentRole ? ROLE_LABELS[currentRole] : user.role ? ROLE_LABELS[user.role] : 'Görüntüleyici'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full h-12 font-semibold border-slate-300 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </Button>

              <Button
                onClick={handleGoHome}
                className="w-full h-12 bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-700/90 text-white font-semibold"
              >
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfaya Git
              </Button>

              <Button
                onClick={logout}
                variant="ghost"
                className="w-full h-10 text-slate-600 hover:text-slate-800 font-medium"
              >
                Farklı Hesapla Giriş Yap
              </Button>
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
            Erişim sorunları için sistem yöneticinizle iletişime geçin.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
