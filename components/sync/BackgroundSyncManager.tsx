/**
 * Background Sync Manager Component
 * Manages offline data synchronization and displays sync status
 */

import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  RefreshCw,
  RefreshCw as Sync,
  Trash2,
  Upload,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '../../hooks/use-toast';
import { useBackgroundSync } from '../../hooks/useBackgroundSync';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface BackgroundSyncManagerProps {
  className?: string;
}

const BackgroundSyncManager: React.FC<BackgroundSyncManagerProps> = ({ className = '' }) => {
  const {
    isOnline,
    isSyncAvailable,
    isSyncInProgress,
    syncStats,
    pendingTasks,
    failedTasks,
    syncNow,
    retryFailedTasks,
    clearCompletedTasks,
    clearAllTasks,
    removeSyncTask,
    addSyncTask,
  } = useBackgroundSync();

  const { toast } = useToast();
  const [isTestingSyncTasks, setIsTestingSyncTasks] = useState(false);

  const handleSyncNow = async () => {
    try {
      const result = await syncNow();

      if (result.success) {
        toast({
          title: 'Senkronizasyon Tamamlandı',
          description: `${result.syncedTasks.length} görev başarıyla senkronize edildi.`,
        });
      } else {
        toast({
          title: 'Senkronizasyon Sorunları',
          description: `${result.failedTasks.length} görev başarısız oldu.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Senkronizasyon Hatası',
        description: 'Senkronizasyon işlemi başlatılamadı.',
        variant: 'destructive',
      });
    }
  };

  const handleRetryFailed = async () => {
    try {
      const result = await retryFailedTasks();

      if (result.success) {
        toast({
          title: 'Başarısız Görevler Yeniden Denendi',
          description: `${result.syncedTasks.length} görev başarıyla senkronize edildi.`,
        });
      } else {
        toast({
          title: 'Yeniden Deneme Sorunları',
          description: `${result.failedTasks.length} görev hala başarısız.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Yeniden Deneme Hatası',
        description: 'Başarısız görevler yeniden denenemedi.',
        variant: 'destructive',
      });
    }
  };

  const handleClearCompleted = () => {
    clearCompletedTasks();
    toast({
      title: 'Tamamlanan Görevler Temizlendi',
      description: 'Başarıyla senkronize edilen görevler kaldırıldı.',
    });
  };

  const handleClearAll = () => {
    clearAllTasks();
    toast({
      title: 'Tüm Görevler Temizlendi',
      description: 'Senkronizasyon kuyruğu tamamen temizlendi.',
    });
  };

  const handleCreateTestTasks = async () => {
    setIsTestingSyncTasks(true);

    try {
      // Create some test sync tasks
      const testTasks = [
        {
          entity: 'beneficiaries',
          type: 'CREATE' as const,
          data: { name: 'Test Beneficiary', age: 25 },
        },
        { entity: 'donations', type: 'UPDATE' as const, data: { id: '123', amount: 1000 } },
        {
          entity: 'members',
          type: 'CREATE' as const,
          data: { name: 'Test Member', email: 'test@example.com' },
        },
        {
          entity: 'activities',
          type: 'CREATE' as const,
          data: { type: 'login', timestamp: Date.now() },
        },
      ];

      for (const task of testTasks) {
        await addSyncTask(task.entity, task.type, task.data);
      }

      toast({
        title: 'Test Görevleri Oluşturuldu',
        description: `${testTasks.length} test görevi senkronizasyon kuyruğuna eklendi.`,
      });
    } catch (error) {
      toast({
        title: 'Test Görevleri Oluşturulamadı',
        description: 'Test görevleri oluşturulurken hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingSyncTasks(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'beneficiaries':
        return '👥';
      case 'donations':
        return '💰';
      case 'members':
        return '👤';
      case 'activities':
        return '📝';
      default:
        return '📄';
    }
  };

  const getSyncProgress = () => {
    if (syncStats.total === 0) return 0;
    return ((syncStats.completed + syncStats.failed) / syncStats.total) * 100;
  };

  if (!isSyncAvailable) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Arka Plan Senkronizasyonu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Bu tarayıcı arka plan senkronizasyonunu desteklemiyor.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Arka Plan Senkronizasyonu
          {isSyncInProgress && <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />}
        </CardTitle>
        <CardDescription>Offline veri senkronizasyonu ve görev yönetimi</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="font-medium">{isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isOnline ? 'Senkronizasyon mevcut' : 'Veriler yerel olarak kaydediliyor'}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSyncNow}
              disabled={!isOnline || isSyncInProgress}
              size="sm"
              className="gap-2"
            >
              <Sync className="w-4 h-4" />
              Şimdi Senkronize Et
            </Button>
          </div>
        </div>

        {/* Sync Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {syncStats.total}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Toplam</div>
          </div>

          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {syncStats.pending}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Bekleyen</div>
          </div>

          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {syncStats.completed}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Tamamlanan</div>
          </div>

          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {syncStats.failed}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">Başarısız</div>
          </div>
        </div>

        {/* Sync Progress */}
        {syncStats.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Senkronizasyon İlerlemesi</span>
              <span>{Math.round(getSyncProgress())}%</span>
            </div>
            <Progress value={getSyncProgress()} className="h-2" />
          </div>
        )}

        {/* Sync Tasks Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Bekleyen ({syncStats.pending})</TabsTrigger>
            <TabsTrigger value="failed">Başarısız ({syncStats.failed})</TabsTrigger>
            <TabsTrigger value="actions">İşlemler</TabsTrigger>
          </TabsList>

          {/* Pending Tasks */}
          <TabsContent value="pending">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Bekleyen Görevler</h3>
                {pendingTasks.length > 0 && (
                  <Button
                    onClick={handleSyncNow}
                    disabled={!isOnline || isSyncInProgress}
                    size="sm"
                    variant="outline"
                  >
                    Hepsini Senkronize Et
                  </Button>
                )}
              </div>

              <ScrollArea className="h-64">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Bekleyen görev bulunmuyor</div>
                ) : (
                  <div className="space-y-2">
                    {pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getEntityIcon(task.entity)}</span>
                          <div>
                            <div className="font-medium">
                              {task.entity} - {task.type}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDistanceToNow(new Date(task.timestamp), {
                                addSuffix: true,
                                locale: tr,
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Button onClick={() => removeSyncTask(task.id)} size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Failed Tasks */}
          <TabsContent value="failed">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Başarısız Görevler</h3>
                {failedTasks.length > 0 && (
                  <Button
                    onClick={handleRetryFailed}
                    disabled={!isOnline || isSyncInProgress}
                    size="sm"
                    variant="outline"
                  >
                    Yeniden Dene
                  </Button>
                )}
              </div>

              <ScrollArea className="h-64">
                {failedTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Başarısız görev bulunmuyor</div>
                ) : (
                  <div className="space-y-2">
                    {failedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getEntityIcon(task.entity)}</span>
                          <div>
                            <div className="font-medium">
                              {task.entity} - {task.type}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {task.retryCount}/{task.maxRetries} deneme
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <Button onClick={() => removeSyncTask(task.id)} size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Actions */}
          <TabsContent value="actions">
            <div className="space-y-4">
              <div className="grid gap-3">
                <Button
                  onClick={handleCreateTestTasks}
                  disabled={isTestingSyncTasks}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Test Görevleri Oluştur
                </Button>

                <Button onClick={handleClearCompleted} variant="outline" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Tamamlanan Görevleri Temizle
                </Button>

                <Button onClick={handleClearAll} variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Tüm Görevleri Temizle
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BackgroundSyncManager;
