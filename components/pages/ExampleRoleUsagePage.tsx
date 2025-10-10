/**
 * @fileoverview ExampleRoleUsagePage - Role system usage examples
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { PermissionGuard, RoleGuard } from '../auth/PermissionGuard';
import { usePermission, useRole, useUserRole } from '../../hooks/usePermission';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle2, XCircle, Shield, Code, Eye, Edit, Trash2, ThumbsUp } from 'lucide-react';

/**
 * Example page showing how to use the role system
 */
export const ExampleRoleUsagePage: React.FC = () => {
  // Hook examples
  const canApproveDonations = usePermission('donations', 'approve');
  const canDeleteMembers = usePermission('members', 'delete');
  const canManageSettings = usePermission('settings', 'write');
  const isAdmin = useRole(['admin', 'yönetici']);
  const isManagerOrAbove = useRole(['admin', 'manager', 'yönetici', 'müdür']);

  const { role, permissions, isLoading } = useUserRole();

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">Rol Sistemi Kullanım Örnekleri</h1>
        <p className="text-muted-foreground">Rol ve yetki kontrolü nasıl yapılır - Örnekler</p>
      </div>

      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Mevcut Kullanıcı Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p>Yükleniyor...</p>
          ) : role ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-muted-foreground text-sm">Rol Adı</p>
                  <p className="font-medium">{role.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Görünen Ad</p>
                  <p className="font-medium">{role.display_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Yetki Sayısı</p>
                  <p className="font-medium">{permissions.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Durum</p>
                  <Badge variant={role.is_active ? 'default' : 'outline'}>
                    {role.is_active ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Yetkiler:</p>
                <div className="flex flex-wrap gap-1">
                  {permissions.slice(0, 10).map((perm: any, idx: number) => (
                    <Badge key={idx} variant="secondary" className="font-mono text-xs">
                      {String(perm)}
                    </Badge>
                  ))}
                  {permissions.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{permissions.length - 10} daha
                    </Badge>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Alert>
              <AlertDescription>Rol bilgisi yüklenemedi</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Hook Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Hook Kullanım Örnekleri
          </CardTitle>
          <CardDescription>
            usePermission ve useRole hook&apos;ları ile yetki kontrolü
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <PermissionCheckDisplay
              label="Bağış Onaylama Yetkisi"
              hasPermission={canApproveDonations}
              code='const canApprove = usePermission("donations", "approve");'
            />
            <PermissionCheckDisplay
              label="Üye Silme Yetkisi"
              hasPermission={canDeleteMembers}
              code='const canDelete = usePermission("members", "delete");'
            />
            <PermissionCheckDisplay
              label="Ayar Düzenleme Yetkisi"
              hasPermission={canManageSettings}
              code='const canManage = usePermission("settings", "write");'
            />
            <PermissionCheckDisplay
              label="Admin Rolü"
              hasPermission={isAdmin}
              code='const isAdmin = useRole(["admin", "yönetici"]);'
            />
            <PermissionCheckDisplay
              label="Manager veya Üstü"
              hasPermission={isManagerOrAbove}
              code='const isManager = useRole(["admin", "manager", "yönetici", "müdür"]);'
            />
          </div>
        </CardContent>
      </Card>

      {/* Component Guard Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Component Guard Örnekleri</CardTitle>
          <CardDescription>PermissionGuard ve RoleGuard kullanımı</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Example 1: Permission-based rendering */}
          <div className="space-y-2 rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium">
              Örnek 1: Yetki Bazlı Görünüm (donations:approve)
            </p>
            <PermissionGuard resource="donations" action="approve">
              <Button variant="default" className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                Bağışı Onayla
              </Button>
            </PermissionGuard>
            <PermissionGuard
              resource="donations"
              action="approve"
              fallback={<Badge variant="outline">Onaylama yetkisi yok - Bu buton görünmüyor</Badge>}
            />
          </div>

          {/* Example 2: Role-based rendering */}
          <div className="space-y-2 rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium">Örnek 2: Rol Bazlı Görünüm (Admin Only)</p>
            <RoleGuard roles={['admin', 'yönetici']}>
              <Alert className="border-red-200 bg-red-50">
                <Shield className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Bu içerik sadece Admin kullanıcılar tarafından görülebilir
                </AlertDescription>
              </Alert>
            </RoleGuard>
            <RoleGuard
              roles={['admin', 'yönetici']}
              fallback={<Badge variant="outline">Admin değilseniz üstteki alert görünmüyor</Badge>}
            />
          </div>

          {/* Example 3: Multiple actions */}
          <div className="space-y-2 rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium">Örnek 3: Çoklu Aksiyon Kontrolleri (members)</p>
            <div className="flex gap-2">
              <PermissionGuard resource="members" action="read">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Görüntüle
                </Button>
              </PermissionGuard>

              <PermissionGuard resource="members" action="write">
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Düzenle
                </Button>
              </PermissionGuard>

              <PermissionGuard resource="members" action="delete">
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Sil
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Example 4: Access denied message */}
          <div className="space-y-2 rounded-lg border p-4">
            <p className="mb-2 text-sm font-medium">Örnek 4: Erişim Reddedildi Mesajı</p>
            <PermissionGuard resource="roles" action="manage" showAccessDenied={true}>
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Rol yönetimi yetkisine sahipsiniz!
                </AlertDescription>
              </Alert>
            </PermissionGuard>
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Kod Örnekleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Hook Kullanımı:</p>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
              {`import { usePermission, useRole } from '../hooks/usePermission';

function MyComponent() {
  const canApprove = usePermission('donations', 'approve');
  const isAdmin = useRole(['admin', 'yönetici']);

  return (
    <div>
      {canApprove && <button>Onayla</button>}
      {isAdmin && <AdminPanel />}
    </div>
  );
}`}
            </pre>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Component Guard:</p>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
              {`import { PermissionGuard } from '../components/auth/PermissionGuard';

function MyComponent() {
  return (
    <div>
      <PermissionGuard resource="donations" action="approve">
        <button>Bağışı Onayla</button>
      </PermissionGuard>

      <PermissionGuard
        resource="settings"
        action="write"
        showAccessDenied={true}
      >
        <SettingsPanel />
      </PermissionGuard>
    </div>
  );
}`}
            </pre>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Service Kullanımı:</p>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-xs">
              {`import { rolesService } from '../services/rolesService';

async function checkUserPermission(userId: string) {
  // Yetki kontrolü
  const canApprove = await rolesService.hasPermission(
    userId,
    'donations:approve'
  );

  // Rol detayları
  const { data: role } = await rolesService.getUserRole(userId);

  // Rol değiştir
  const { data, error } = await rolesService.updateUserRole(
    userId,
    'manager'
  );
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component to display permission check results
const PermissionCheckDisplay: React.FC<{
  label: string;
  hasPermission: boolean;
  code: string;
}> = ({ label, hasPermission, code }) => {
  return (
    <div className="bg-muted/50 flex items-start gap-3 rounded-lg p-3">
      <div className="mt-0.5">
        {hasPermission ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <code className="text-muted-foreground mt-1 block text-xs">{code}</code>
        <Badge variant={hasPermission ? 'default' : 'secondary'} className="mt-2 text-xs">
          {hasPermission ? '✅ Yetki Var' : '❌ Yetki Yok'}
        </Badge>
      </div>
    </div>
  );
};

export default ExampleRoleUsagePage;
