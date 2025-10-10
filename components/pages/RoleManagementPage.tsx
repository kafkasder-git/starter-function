/**
 * @fileoverview RoleManagementPage Component - Role and permission management UI
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { rolesService, type Role, type UserWithRole } from '../../services/rolesService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { PermissionGuard } from '../auth/PermissionGuard';
import { Users, Shield, Key, CheckCircle2, XCircle, UserCog, BarChart3 } from 'lucide-react';

export const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load roles, users, and stats
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [rolesRes, usersRes, statsRes] = await Promise.all([
        rolesService.getRoles(),
        rolesService.getUsersWithRoles(),
        rolesService.getRoleStats(),
      ]);

      if (rolesRes.error) {
        setError(rolesRes.error);
        return;
      }

      if (usersRes.error) {
        setError(usersRes.error);
        return;
      }

      setRoles(rolesRes.data ?? []);
      setUsers(usersRes.data ?? []);
      setStats(statsRes.data ?? {});
    } catch {
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalUsers = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold">Rol ve Yetki Yönetimi</h1>
        <p className="text-muted-foreground">Sistem rollerini ve kullanıcı yetkilerini yönetin</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Roller</CardTitle>
            <Shield className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-muted-foreground text-xs">Aktif rol sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-muted-foreground text-xs">Aktif kullanıcı sayısı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yöneticiler</CardTitle>
            <UserCog className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.admin ?? 0) + (stats['yönetici'] ?? 0)}
            </div>
            <p className="text-muted-foreground text-xs">Admin kullanıcı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operatörler</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.operator ?? 0) + (stats['operatör'] ?? 0)}
            </div>
            <p className="text-muted-foreground text-xs">Operatör kullanıcı</p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {roles.map((role) => {
          const userCount = stats[role.name] ?? 0;
          const permissions = Array.isArray(role.permissions) ? role.permissions : [];
          const isActive = role.is_active;

          // Count permissions by category
          const permissionCategories = permissions.reduce(
            (acc: Record<string, number>, perm: unknown) => {
              const parts = String(perm).split(':');
              const resource = parts[0];
              if (resource && typeof resource === 'string') {
                const safeResource = resource.trim();
                // eslint-disable-next-line security/detect-object-injection
                acc[safeResource] = (acc[safeResource] ?? 0) + 1;
              }
              return acc;
            },
            {} as Record<string, number>,
          );

          return (
            <Card key={role.id} className={!isActive ? 'opacity-50' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {role.display_name}
                      {isActive ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      role.name === 'admin' || role.name === 'yönetici'
                        ? 'destructive'
                        : role.name === 'manager' || role.name === 'müdür'
                          ? 'default'
                          : role.name === 'operator' || role.name === 'operatör'
                            ? 'secondary'
                            : 'outline'
                    }
                  >
                    {role.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Count */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span>
                    <strong>{userCount}</strong> kullanıcı
                  </span>
                </div>

                {/* Permission Count */}
                <div className="flex items-center gap-2 text-sm">
                  <Key className="text-muted-foreground h-4 w-4" />
                  <span>
                    <strong>{permissions.length}</strong> yetki
                  </span>
                </div>

                {/* Permission Categories */}
                <div>
                  <p className="mb-2 text-sm font-medium">Yetki Kategorileri:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(permissionCategories).map(([resource, count]) => (
                      <Badge key={resource} variant="outline" className="text-xs">
                        {resource} ({count})
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sample Permissions */}
                <div>
                  <p className="mb-2 text-sm font-medium">Örnek Yetkiler:</p>
                  <div className="flex flex-wrap gap-1">
                    {permissions.slice(0, 5).map((perm: unknown, idx: number) => (
                      <Badge key={idx} variant="secondary" className="font-mono text-xs">
                        {String(perm)}
                      </Badge>
                    ))}
                    {permissions.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{permissions.length - 5} daha
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions - Only for admins */}
                <PermissionGuard resource="roles" action="manage">
                  <div className="flex gap-2 border-t pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        /* TODO: Edit role */
                      }}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        /* TODO: View details */
                      }}
                    >
                      Detaylar
                    </Button>
                  </div>
                </PermissionGuard>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Users by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ve Rolleri</CardTitle>
          <CardDescription>Sistemdeki tüm kullanıcılar ve atanmış rolleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="hover:bg-accent/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      user.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      user.role === 'admin' || user.role === 'yönetici'
                        ? 'destructive'
                        : user.role === 'manager' || user.role === 'müdür'
                          ? 'default'
                          : user.role === 'operator' || user.role === 'operatör'
                            ? 'secondary'
                            : 'outline'
                    }
                  >
                    {user.role}
                  </Badge>

                  <PermissionGuard resource="users" action="manage_roles">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        /* TODO: Change role */
                      }}
                    >
                      Rol Değiştir
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <PermissionGuard resource="roles" action="manage">
        <Card>
          <CardHeader>
            <CardTitle>Yetki Matrisi</CardTitle>
            <CardDescription>Rollerin kaynaklara erişim haritası</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left font-medium">Kaynak</th>
                    {roles.map((role) => (
                      <th key={role.id} className="p-2 text-center font-medium">
                        {role.display_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    'users',
                    'members',
                    'donations',
                    'campaigns',
                    'aid_requests',
                    'finance',
                    'partners',
                    'events',
                    'tasks',
                    'inventory',
                    'legal',
                    'reports',
                    'settings',
                    'audit',
                    'roles',
                  ].map((resource) => (
                    <tr key={resource} className="hover:bg-accent/30 border-b">
                      <td className="p-2 font-medium capitalize">{resource}</td>
                      {roles.map((role) => {
                        const hasFullAccess = rolesService.roleHasAccess(role, resource, '*');
                        const hasWrite = rolesService.roleHasAccess(role, resource, 'write');
                        const hasRead = rolesService.roleHasAccess(role, resource, 'read');

                        return (
                          <td key={role.id} className="p-2 text-center">
                            {hasFullAccess ? (
                              <Badge variant="destructive" className="text-xs">
                                FULL
                              </Badge>
                            ) : hasWrite ? (
                              <Badge variant="default" className="text-xs">
                                R/W
                              </Badge>
                            ) : hasRead ? (
                              <Badge variant="secondary" className="text-xs">
                                READ
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </PermissionGuard>
    </div>
  );
};

export default RoleManagementPage;
