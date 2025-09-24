import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Users, Building2, Heart, Award, Plus } from 'lucide-react';

const mockAssociations = [
  {
    id: 1,
    name: 'Toplum Kalkınma Derneği',
    type: 'Dernek',
    focusArea: 'Sosyal Yardım',
    location: 'Ankara',
    contactPerson: 'Hasan Çelik',
    position: 'Başkan',
    status: 'Aktif',
    memberCount: 150,
    establishedDate: '2005-04-08',
    sharedProjects: 2,
    rating: 4,
  },
  {
    id: 2,
    name: 'Çocuk Eğitimi Vakfı',
    type: 'Vakıf',
    focusArea: 'Eğitim',
    location: 'İstanbul',
    contactPerson: 'Dr. Fatma Demir',
    position: 'Genel Müdür',
    status: 'Aktif',
    memberCount: 85,
    establishedDate: '1998-09-15',
    sharedProjects: 3,
    rating: 5,
  },
  {
    id: 3,
    name: 'Yaşlı Bakım Derneği',
    type: 'Dernek',
    focusArea: 'Yaşlı',
    location: 'İzmir',
    contactPerson: 'Mehmet Özkan',
    position: 'Koordinatör',
    status: 'Aktif',
    memberCount: 65,
    establishedDate: '2010-11-22',
    sharedProjects: 2,
    rating: 4,
  },
];

export function PartnerAssociationsPage() {
  const activeAssociations = mockAssociations.filter((a) => a.status === 'Aktif').length;
  const totalMembers = mockAssociations.reduce((sum, a) => sum + (a.memberCount || 0), 0);
  const collaborativeAssociations = mockAssociations.filter((a) => a.sharedProjects > 0).length;
  const largeAssociations = mockAssociations.filter(
    (a) => a.memberCount && a.memberCount >= 100,
  ).length;

  const getStatusBadge = (status: string) => {
    const config = {
      Aktif: { label: 'Aktif', className: 'bg-green-50 text-green-700 border-green-200' },
      Pasif: { label: 'Pasif', className: 'bg-gray-50 text-gray-700 border-gray-200' },
      'İşbirliği Arayışı': {
        label: 'İşbirliği Arayışı',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      },
    };

    const { label, className } = config[status as keyof typeof config] || config.Aktif;
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const config = {
      Dernek: { label: 'Dernek', className: 'bg-blue-50 text-blue-700' },
      Vakıf: { label: 'Vakıf', className: 'bg-purple-50 text-purple-700' },
      Platform: { label: 'Platform', className: 'bg-green-50 text-green-700' },
      Federasyon: { label: 'Federasyon', className: 'bg-orange-50 text-orange-700' },
      Birlik: { label: 'Birlik', className: 'bg-indigo-50 text-indigo-700' },
    };

    const { label, className } = config[type as keyof typeof config] || config.Dernek;
    return <Badge className={`${className} text-xs px-2 py-1 border-0`}>{label}</Badge>;
  };

  const getFocusAreaBadge = (area: string) => {
    const config = {
      'Sosyal Yardım': { label: 'Sosyal Yardım', className: 'bg-red-50 text-red-700' },
      Eğitim: { label: 'Eğitim', className: 'bg-blue-50 text-blue-700' },
      Sağlık: { label: 'Sağlık', className: 'bg-green-50 text-green-700' },
      Çevre: { label: 'Çevre', className: 'bg-emerald-50 text-emerald-700' },
      Kadın: { label: 'Kadın', className: 'bg-pink-50 text-pink-700' },
      Gençlik: { label: 'Gençlik', className: 'bg-orange-50 text-orange-700' },
      Yaşlı: { label: 'Yaşlı', className: 'bg-purple-50 text-purple-700' },
      Engelli: { label: 'Engelli', className: 'bg-cyan-50 text-cyan-700' },
    };

    const { label, className } = config[area as keyof typeof config] || config['Sosyal Yardım'];
    return (
      <Badge variant="outline" className={`${className} text-xs px-2 py-1`}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Diğer Dernekler</h1>
          <p className="text-muted-foreground mt-1">Dernek ağı ve işbirliği ilişkileri</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Dernek Ekle
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Dernek</p>
                <p className="text-2xl font-medium text-green-600">{activeAssociations}</p>
              </div>
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Üye</p>
                <p className="text-2xl font-medium text-blue-600">
                  {totalMembers.toLocaleString()}
                </p>
              </div>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">İşbirlikçi</p>
                <p className="text-2xl font-medium text-purple-600">{collaborativeAssociations}</p>
              </div>
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Büyük Dernek</p>
                <p className="text-2xl font-medium text-orange-600">{largeAssociations}</p>
              </div>
              <Award className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Associations List */}
      <div className="grid gap-4">
        {mockAssociations.map((association) => (
          <Card key={association.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium">{association.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {association.location} • {association.position}: {association.contactPerson}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {getStatusBadge(association.status)}
                    {getTypeBadge(association.type)}
                    {getFocusAreaBadge(association.focusArea)}
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">{association.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {association.memberCount && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">
                      {association.memberCount}
                    </div>
                    <div className="text-xs text-blue-600">Üye Sayısı</div>
                  </div>
                )}

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">
                    {association.sharedProjects}
                  </div>
                  <div className="text-xs text-purple-600">Ortak Proje</div>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">
                    {new Date(association.establishedDate).getFullYear()}
                  </div>
                  <div className="text-xs text-green-600">Kuruluş Yılı</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
