import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Gavel,
  Plus,
  Search,
  Timer,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Lawsuit {
  id: number;
  caseNumber: string;
  court: string;
  caseType: 'medeni' | 'ceza' | 'is' | 'idare' | 'ticaret' | 'aile' | 'icra';
  plaintiff: string;
  defendant: string;
  subject: string;
  amount?: number;
  lawyer: string;
  startDate: string;
  nextHearing?: string;
  status: 'devam' | 'kazanildi' | 'kaybedildi' | 'uzlasti' | 'askida';
  stage: 'baslangic' | 'delil' | 'savunma' | 'yargilama' | 'karar' | 'temyiz' | 'kesinlesti';
  notes?: string;
  documents: string[];
  priority: 'yuksek' | 'orta' | 'dusuk';
  estimatedDuration?: number; // months
  costs: number;
}

// Mock data kaldırıldı - gerçek veriler API'den gelecek

export function LawsuitTrackingPage() {
  const [lawsuits, setLawsuits] = useState<Lawsuit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [selectedLawsuit, setSelectedLawsuit] = useState<Lawsuit | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredLawsuits = lawsuits.filter((lawsuit) => {
    const matchesSearch =
      searchTerm === '' ||
      lawsuit.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawsuit.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawsuit.plaintiff.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawsuit.defendant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawsuit.lawyer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || lawsuit.caseType === filterType;
    const matchesStatus = filterStatus === 'all' || lawsuit.status === filterStatus;
    const matchesStage = filterStage === 'all' || lawsuit.stage === filterStage;

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && lawsuit.status === 'devam') ||
      (activeTab === 'won' && lawsuit.status === 'kazanildi') ||
      (activeTab === 'priority' && lawsuit.priority === 'yuksek');

    return matchesSearch && matchesType && matchesStatus && matchesStage && matchesTab;
  });

  const getStatusBadge = (status: Lawsuit['status']) => {
    const config = {
      devam: { label: 'Devam Ediyor', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      kazanildi: { label: 'Kazanıldı', className: 'bg-green-50 text-green-700 border-green-200' },
      kaybedildi: { label: 'Kaybedildi', className: 'bg-red-50 text-red-700 border-red-200' },
      uzlasti: { label: 'Uzlaştı', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
      askida: { label: 'Askıda', className: 'bg-gray-50 text-gray-700 border-gray-200' },
    };

    const { label, className } = config[status];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getStageBadge = (stage: Lawsuit['stage']) => {
    const config = {
      baslangic: { label: 'Başlangıç', className: 'bg-gray-50 text-gray-700' },
      delil: { label: 'Delil Toplama', className: 'bg-blue-50 text-blue-700' },
      savunma: { label: 'Savunma', className: 'bg-purple-50 text-purple-700' },
      yargilama: { label: 'Yargılama', className: 'bg-orange-50 text-orange-700' },
      karar: { label: 'Karar', className: 'bg-green-50 text-green-700' },
      temyiz: { label: 'Temyiz', className: 'bg-red-50 text-red-700' },
      kesinlesti: { label: 'Kesinleşti', className: 'bg-indigo-50 text-indigo-700' },
    };

    const { label, className } = config[stage];
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const getTypeLabel = (type: Lawsuit['caseType']) => {
    const types = {
      medeni: 'Medeni',
      ceza: 'Ceza',
      is: 'İş',
      idare: 'İdare',
      ticaret: 'Ticaret',
      aile: 'Aile',
      icra: 'İcra',
    };
    return types[type] || type;
  };

  const getPriorityIcon = (priority: Lawsuit['priority']) => {
    if (priority === 'yuksek') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (priority === 'orta') return <Clock className="w-4 h-4 text-yellow-500" />;
    return <Timer className="w-4 h-4 text-green-500" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const activeCases = lawsuits.filter((l) => l.status === 'devam').length;
  const wonCases = lawsuits.filter((l) => l.status === 'kazanildi').length;
  const totalCosts = lawsuits.reduce((sum, l) => sum + l.costs, 0);
  const totalAmount = lawsuits.reduce((sum, l) => sum + (l.amount || 0), 0);

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Dava Takipleri</h1>
          <p className="text-muted-foreground mt-1">Açılan davalar ve duruşma takibi</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Dava Ekle
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Dava</p>
                <p className="text-2xl font-medium">{lawsuits.length}</p>
              </div>
              <Gavel className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Devam Eden</p>
                <p className="text-2xl font-medium text-blue-600">{activeCases}</p>
              </div>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kazanılan</p>
                <p className="text-2xl font-medium text-green-600">{wonCases}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                <p className="text-xl font-medium text-purple-600">{formatCurrency(totalAmount)}</p>
              </div>
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Dava ara..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[120px] shrink-0">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="medeni">Medeni</SelectItem>
              <SelectItem value="ceza">Ceza</SelectItem>
              <SelectItem value="is">İş</SelectItem>
              <SelectItem value="idare">İdare</SelectItem>
              <SelectItem value="ticaret">Ticaret</SelectItem>
              <SelectItem value="aile">Aile</SelectItem>
              <SelectItem value="icra">İcra</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="devam">Devam Ediyor</SelectItem>
              <SelectItem value="kazanildi">Kazanıldı</SelectItem>
              <SelectItem value="kaybedildi">Kaybedildi</SelectItem>
              <SelectItem value="uzlasti">Uzlaştı</SelectItem>
              <SelectItem value="askida">Askıda</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-[130px] shrink-0">
              <SelectValue placeholder="Aşama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Aşamalar</SelectItem>
              <SelectItem value="baslangic">Başlangıç</SelectItem>
              <SelectItem value="delil">Delil Toplama</SelectItem>
              <SelectItem value="savunma">Savunma</SelectItem>
              <SelectItem value="yargilama">Yargılama</SelectItem>
              <SelectItem value="karar">Karar</SelectItem>
              <SelectItem value="temyiz">Temyiz</SelectItem>
              <SelectItem value="kesinlesti">Kesinleşti</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Devam Eden</TabsTrigger>
          <TabsTrigger value="won">Kazanılan</TabsTrigger>
          <TabsTrigger value="priority">Öncelikli</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid gap-4">
            {filteredLawsuits.map((lawsuit) => (
              <Card key={lawsuit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-medium">{lawsuit.subject}</CardTitle>
                        {getPriorityIcon(lawsuit.priority)}
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Dava No: {lawsuit.caseNumber} - {lawsuit.court}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {getStatusBadge(lawsuit.status)}
                        {getStageBadge(lawsuit.stage)}
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(lawsuit.caseType)}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedLawsuit(lawsuit);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Detayları Görüntüle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">Davacı: {lawsuit.plaintiff}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">Davalı: {lawsuit.defendant}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">Başlangıç: {formatDate(lawsuit.startDate)}</span>
                    </div>
                    {lawsuit.nextHearing && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">Duruşma: {formatDate(lawsuit.nextHearing)}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {lawsuit.amount && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">
                          {formatCurrency(lawsuit.amount)}
                        </div>
                        <div className="text-xs text-blue-600">Dava Tutarı</div>
                      </div>
                    )}

                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-medium text-red-800">
                        {formatCurrency(lawsuit.costs)}
                      </div>
                      <div className="text-xs text-red-600">Masraf</div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        {lawsuit.documents.length}
                      </div>
                      <div className="text-xs text-green-600">Belge</div>
                    </div>

                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-800">{lawsuit.lawyer}</div>
                      <div className="text-xs text-purple-600">Avukat</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Lawsuit Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              {selectedLawsuit?.subject} - {selectedLawsuit?.caseNumber}
            </DialogTitle>
          </DialogHeader>

          {selectedLawsuit && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mahkeme</label>
                    <p>{selectedLawsuit.court}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Davacı</label>
                    <p>{selectedLawsuit.plaintiff}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Davalı</label>
                    <p>{selectedLawsuit.defendant}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Avukat</label>
                    <p>{selectedLawsuit.lawyer}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Durum</label>
                    <div className="mt-1">{getStatusBadge(selectedLawsuit.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Aşama</label>
                    <div className="mt-1">{getStageBadge(selectedLawsuit.stage)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Başlangıç Tarihi
                    </label>
                    <p>{formatDate(selectedLawsuit.startDate)}</p>
                  </div>
                  {selectedLawsuit.nextHearing && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Sonraki Duruşma
                      </label>
                      <p>{formatDate(selectedLawsuit.nextHearing)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedLawsuit.amount && (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-medium text-blue-800">
                      {formatCurrency(selectedLawsuit.amount)}
                    </div>
                    <div className="text-sm text-blue-600">Dava Tutarı</div>
                  </div>
                )}

                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-lg font-medium text-red-800">
                    {formatCurrency(selectedLawsuit.costs)}
                  </div>
                  <div className="text-sm text-red-600">Masraf</div>
                </div>

                {selectedLawsuit.estimatedDuration && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-medium text-green-800">
                      {selectedLawsuit.estimatedDuration} ay
                    </div>
                    <div className="text-sm text-green-600">Tahmini Süre</div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Belgeler</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedLawsuit.documents.map((doc, index) => (
                    <Badge key={index} variant="secondary">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedLawsuit.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notlar</label>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-lg">{selectedLawsuit.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default export
export default LawsuitTrackingPage;
