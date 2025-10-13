import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Heart,
  GraduationCap,
  Shield,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Orphan {
  id: string;
  name: string;
  surname: string;
  age: number;
  gender: 'male' | 'female';
  birthDate: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  schoolName?: string;
  grade?: string;
  specialNeeds?: string;
  status: 'active' | 'inactive' | 'graduated';
  registrationDate: string;
  lastUpdate: string;
  notes?: string;
  photo?: string;
}

const OrphanListPage: React.FC = () => {
  const [orphans, setOrphans] = useState<Orphan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real data from API
  useEffect(() => {
    const mockOrphans: Orphan[] = [
      {
        id: '1',
        name: 'Ahmet',
        surname: 'Yılmaz',
        age: 12,
        gender: 'male',
        birthDate: '2012-03-15',
        address: 'Merkez Mahallesi, Atatürk Caddesi No:45',
        city: 'İstanbul',
        phone: '0532 123 45 67',
        guardianName: 'Fatma Yılmaz',
        guardianPhone: '0532 987 65 43',
        guardianRelation: 'Anne',
        schoolName: 'Atatürk İlkokulu',
        grade: '6. Sınıf',
        status: 'active',
        registrationDate: '2023-09-01',
        lastUpdate: '2024-01-15',
        notes: 'Matematik dersinde başarılı, sosyal aktivitelere katılıyor.',
      },
      {
        id: '2',
        name: 'Ayşe',
        surname: 'Demir',
        age: 14,
        gender: 'female',
        birthDate: '2010-07-22',
        address: 'Cumhuriyet Mahallesi, İnönü Sokak No:12',
        city: 'Ankara',
        phone: '0533 456 78 90',
        guardianName: 'Mehmet Demir',
        guardianPhone: '0533 111 22 33',
        guardianRelation: 'Baba',
        schoolName: 'Cumhuriyet Ortaokulu',
        grade: '8. Sınıf',
        status: 'active',
        registrationDate: '2023-08-15',
        lastUpdate: '2024-01-10',
        notes: 'Sanat alanında yetenekli, müzik dersleri alıyor.',
      },
      {
        id: '3',
        name: 'Mehmet',
        surname: 'Kaya',
        age: 16,
        gender: 'male',
        birthDate: '2008-11-08',
        address: 'Yeni Mahalle, Gazi Bulvarı No:78',
        city: 'İzmir',
        guardianName: 'Zeynep Kaya',
        guardianPhone: '0534 555 66 77',
        guardianRelation: 'Anne',
        schoolName: 'Gazi Lisesi',
        grade: '10. Sınıf',
        status: 'active',
        registrationDate: '2023-07-01',
        lastUpdate: '2024-01-05',
        notes: 'Fen bilimleri alanında başarılı, üniversite hedefli.',
      },
      {
        id: '4',
        name: 'Fatma',
        surname: 'Öz',
        age: 18,
        gender: 'female',
        birthDate: '2006-04-12',
        address: 'Bahçelievler Mahallesi, Çiçek Sokak No:23',
        city: 'Bursa',
        guardianName: 'Ali Öz',
        guardianPhone: '0535 777 88 99',
        guardianRelation: 'Baba',
        schoolName: 'Bahçelievler Lisesi',
        grade: '12. Sınıf',
        status: 'graduated',
        registrationDate: '2022-09-01',
        lastUpdate: '2024-01-20',
        notes: 'Mezun oldu, üniversiteye yerleşti.',
      },
      {
        id: '5',
        name: 'Ali',
        surname: 'Şahin',
        age: 10,
        gender: 'male',
        birthDate: '2014-09-30',
        address: 'Kızılay Mahallesi, Atatürk Caddesi No:56',
        city: 'Antalya',
        phone: '0536 999 00 11',
        guardianName: 'Hatice Şahin',
        guardianPhone: '0536 222 33 44',
        guardianRelation: 'Anne',
        schoolName: 'Kızılay İlkokulu',
        grade: '4. Sınıf',
        status: 'active',
        registrationDate: '2023-10-01',
        lastUpdate: '2024-01-12',
        notes: 'Spor aktivitelerine ilgili, futbol oynuyor.',
      },
    ];

    setTimeout(() => {
      setOrphans(mockOrphans);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredOrphans = orphans.filter((orphan) => {
    const matchesSearch = 
      orphan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orphan.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orphan.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orphan.guardianName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || orphan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'inactive':
        return <Badge className="bg-neutral-100 text-neutral-800">Pasif</Badge>;
      case 'graduated':
        return <Badge className="bg-blue-100 text-blue-800">Mezun</Badge>;
      default:
        return <Badge className="bg-neutral-100 text-neutral-800">Bilinmiyor</Badge>;
    }
  };

  const getGenderIcon = (gender: string) => {
    return gender === 'male' ? (
      <User className="h-4 w-4 text-blue-600" />
    ) : (
      <Heart className="h-4 w-4 text-pink-600" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Yetim Listesi</h1>
          <p className="text-neutral-600">Yetim çocukların bilgilerini görüntüleyin ve yönetin</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Excel İndir
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Yetim Ekle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Yetim</p>
                <p className="text-2xl font-bold text-gray-900">{orphans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif Yetim</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orphans.filter(o => o.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <GraduationCap className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Mezun Olanlar</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orphans.filter(o => o.status === 'graduated').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bu Ay Eklenen</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="İsim, soyisim, şehir veya vasi adı ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Durum: {statusFilter === 'all' ? 'Tümü' : 
                           statusFilter === 'active' ? 'Aktif' :
                           statusFilter === 'inactive' ? 'Pasif' : 'Mezun'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    Tümü
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Aktif
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                    Pasif
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('graduated')}>
                    Mezun
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orphans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Yetim Listesi ({filteredOrphans.length} kayıt)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fotoğraf</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Yaş/Cinsiyet</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Vasi</TableHead>
                  <TableHead>Okul/Sınıf</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrphans.map((orphan) => (
                  <TableRow key={orphan.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={orphan.photo} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {orphan.name.charAt(0)}{orphan.surname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {orphan.name} {orphan.surname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {orphan.birthDate}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getGenderIcon(orphan.gender)}
                        <span className="text-sm">{orphan.age} yaş</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{orphan.city}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{orphan.guardianName}</p>
                        <p className="text-xs text-gray-500">{orphan.guardianRelation}</p>
                        {orphan.guardianPhone && (
                          <p className="text-xs text-gray-500">{orphan.guardianPhone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {orphan.schoolName ? (
                        <div>
                          <p className="text-sm font-medium">{orphan.schoolName}</p>
                          <p className="text-xs text-gray-500">{orphan.grade}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Okul bilgisi yok</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(orphan.status)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuItem>Detayları Görüntüle</DropdownMenuItem>
                          <DropdownMenuItem>Düzenle</DropdownMenuItem>
                          <DropdownMenuItem>Belgeler</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Arşivle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrphanListPage;
