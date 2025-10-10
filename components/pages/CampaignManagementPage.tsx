/**
 * @fileoverview Campaign Management Page - Create and manage fundraising campaigns
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Target, DollarSign, Users, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { PageLayout } from '../layouts/PageLayout';
import { campaignsService, type Campaign as ServiceCampaign, type CampaignStats } from '../../services/campaignsService';
import { useAuthStore } from '../../stores/authStore';
import { logger } from '../../lib/logging/logger';
import { LoadingSpinner } from '../shared/LoadingSpinner';

// Use ServiceCampaign type from the service
type Campaign = ServiceCampaign;

/**
 * CampaignManagementPage Component
 * 
 * Manages fundraising campaigns with progress tracking and donor management.
 */
export function CampaignManagementPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const pageSize = 10;
  
  interface NewCampaignForm {
    name: string;
    description: string;
    goalAmount: string;
    startDate: string;
    endDate: string;
    category: string;
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState<NewCampaignForm>({
    name: '',
    description: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
    category: '',
  });

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const result = await campaignsService.getCampaigns(currentPage, pageSize);
      if (result.error) {
        toast.error(result.error);
        logger.error('Error loading campaigns', result.error);
      } else if (result.data) {
        setCampaigns(result.data);
        setTotalCount(result.count || 0);
      }
    } catch (error) {
      toast.error('Kampanyalar yüklenirken beklenmeyen bir hata oluştu');
      logger.error('Unexpected error loading campaigns', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const loadStats = useCallback(async () => {
    try {
      const result = await campaignsService.getCampaignStats();
      if (result.error) {
        logger.error('Error loading campaign stats', result.error);
      } else if (result.data) {
        setStats(result.data);
      }
    } catch (error) {
      logger.error('Unexpected error loading campaign stats', error);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
    loadStats();
  }, [loadCampaigns, loadStats]);

  useEffect(() => {
    loadCampaigns();
  }, [currentPage, loadCampaigns]);

  const handleCreateCampaign = async () => {
    // Basic validation
    if (!newCampaign.name || !newCampaign.goalAmount) {
      toast.error('Lütfen kampanya adı ve hedef tutarı giriniz');
      return;
    }

    // Validate goal amount is a positive number
    const goalAmount = parseFloat(newCampaign.goalAmount);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      toast.error('Lütfen geçerli bir hedef tutarı giriniz');
      return;
    }

    // Date validation
    
    const trimmedEndDate = newCampaign.endDate?.trim();
    if (trimmedEndDate) {
      const startDateStr = newCampaign.startDate?.trim() || new Date().toISOString().split('T')[0];
      const start = new Date(startDateStr);
      const end = new Date(trimmedEndDate);
      
      if (end <= start) {
        toast.error('Bitiş tarihi başlangıç tarihinden sonra olmalıdır');
        return;
      }
    }

    const {user} = useAuthStore.getState();
    if (!user) {
      toast.error('Kullanıcı oturumu bulunamadı');
      return;
    }

    setSaving(true);
    try {
      const startDate = (newCampaign.startDate?.trim() || new Date().toISOString().split('T')[0]);
      const endDate = newCampaign.endDate?.trim() ? newCampaign.endDate.trim() : null;
      
      const result = await campaignsService.createCampaign({
        name: newCampaign.name,
        description: newCampaign.description || '',
        goal_amount: parseFloat(newCampaign.goalAmount),
        start_date: startDate,
        end_date: endDate,
        category: newCampaign.category || 'Genel',
        created_by: user.id
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Kampanya başarıyla oluşturuldu');
      setIsDialogOpen(false);
      setNewCampaign({
        name: '',
        description: '',
        goalAmount: '',
        startDate: '',
        endDate: '',
        category: '',
      });

      // Refresh data
      await loadCampaigns();
      await loadStats();
    } catch (error) {
      toast.error('Kampanya oluşturulurken beklenmeyen bir hata oluştu');
      logger.error('Campaign creation error:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const statusConfig = {
      active: { label: 'Aktif', className: 'bg-green-100 text-green-800' },
      completed: { label: 'Tamamlandı', className: 'bg-blue-100 text-blue-800' },
      draft: { label: 'Taslak', className: 'bg-gray-100 text-gray-800' },
      paused: { label: 'Duraklatıldı', className: 'bg-yellow-100 text-yellow-800' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Add loading state check
  if (loading && campaigns.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <PageLayout
      title="Kampanya Yönetimi"
      subtitle="Bağış kampanyalarınızı oluşturun ve yönetin"
      actions={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kampanya
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Kampanya Oluştur</DialogTitle>
              <DialogDescription>
                Bağış toplamak için yeni bir kampanya başlatın
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="campaignName">Kampanya Adı *</Label>
                <Input
                  id="campaignName"
                  value={newCampaign.name}
                  onChange={(e) => { setNewCampaign({ ...newCampaign, name: e.target.value }); }}
                  placeholder="Örn: Ramazan Yardımı 2024"
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Input
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => { setNewCampaign({ ...newCampaign, description: e.target.value }); }}
                  placeholder="Kampanya detayları"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goalAmount">Hedef Tutar (₺) *</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    value={newCampaign.goalAmount}
                    onChange={(e) => { setNewCampaign({ ...newCampaign, goalAmount: e.target.value }); }}
                    placeholder="100000"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Input
                    id="category"
                    value={newCampaign.category}
                    onChange={(e) => { setNewCampaign({ ...newCampaign, category: e.target.value }); }}
                    placeholder="Gıda, Eğitim, Sağlık..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => { setNewCampaign({ ...newCampaign, startDate: e.target.value }); }}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Bitiş Tarihi</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => { setNewCampaign({ ...newCampaign, endDate: e.target.value }); }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); }}>
                İptal
              </Button>
              <Button onClick={handleCreateCampaign}>
                Kampanya Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Toplam Kampanya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <Target className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Aktif Kampanya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Toplanan Tutar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₺{(stats?.totalCurrentAmount || 0).toLocaleString()}</div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Hedef Toplam</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₺{(stats?.totalGoalAmount || 0).toLocaleString()}</div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kampanyalar</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Henüz kampanya oluşturulmamış</p>
                <Button onClick={() => { setIsDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  İlk Kampanyanızı Oluşturun
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kampanya Adı</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>İlerleme</TableHead>
                    <TableHead>Bağışçı</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.category || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[200px]">
                          <div className="flex justify-between text-sm">
                            <span>₺{campaign.current_amount.toLocaleString()}</span>
                            <span className="text-gray-500">₺{campaign.goal_amount.toLocaleString()}</span>
                          </div>
                          <Progress value={calculateProgress(campaign.current_amount, campaign.goal_amount)} />
                          <div className="text-xs text-gray-500">
                            %{calculateProgress(campaign.current_amount, campaign.goal_amount).toFixed(0)} tamamlandı
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          0 {/* TODO: Calculate from donations table */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(campaign.start_date).toLocaleDateString('tr-TR')}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default CampaignManagementPage;

