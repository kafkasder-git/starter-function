/**
 * @fileoverview Campaign Management Page - Create and manage fundraising campaigns
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';
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
import PageLayout from '../PageLayout';

interface Campaign {
  id: string;
  name: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  category: string;
  donorCount: number;
}

const initialCampaigns: Campaign[] = [];

/**
 * CampaignManagementPage Component
 * 
 * Manages fundraising campaigns with progress tracking and donor management.
 */
export function CampaignManagementPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
    category: '',
  });

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.goalAmount) {
      toast.error('Lütfen kampanya adı ve hedef tutarı giriniz');
      return;
    }

    try {
      const campaign: Campaign = {
        id: crypto.randomUUID(),
        name: newCampaign.name,
        description: newCampaign.description,
        goalAmount: parseFloat(newCampaign.goalAmount),
        currentAmount: 0,
        startDate: newCampaign.startDate || new Date().toISOString().split('T')[0],
        endDate: newCampaign.endDate,
        status: 'draft',
        category: newCampaign.category,
        donorCount: 0,
      };

      // In real implementation, save to Supabase
      // await supabase.from('campaigns').insert(campaign);

      setCampaigns((prev) => [campaign, ...prev]);
      
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
    } catch (error) {
      toast.error('Kampanya oluşturulurken bir hata oluştu');
      console.error('Campaign creation error:', error);
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

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    totalRaised: campaigns.reduce((sum, c) => sum + c.currentAmount, 0),
    totalGoal: campaigns.reduce((sum, c) => sum + c.goalAmount, 0),
  };

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
                <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
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
                <div className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</div>
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
                <div className="text-2xl font-bold">₺{stats.totalRaised.toLocaleString()}</div>
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
                <div className="text-2xl font-bold">₺{stats.totalGoal.toLocaleString()}</div>
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
                            <span>₺{campaign.currentAmount.toLocaleString()}</span>
                            <span className="text-gray-500">₺{campaign.goalAmount.toLocaleString()}</span>
                          </div>
                          <Progress value={calculateProgress(campaign.currentAmount, campaign.goalAmount)} />
                          <div className="text-xs text-gray-500">
                            %{calculateProgress(campaign.currentAmount, campaign.goalAmount).toFixed(0)} tamamlandı
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          {campaign.donorCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(campaign.startDate).toLocaleDateString('tr-TR')}
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

