import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Building2, Shield, Users, CheckCircle, Plus } from 'lucide-react';

const mockInstitutions = [
  {
    id: 1,
    name: 'Ankara Büyükşehir Belediyesi Sosyal İşler Müdürlüğü',
    type: 'Belediye',
    level: 'İl',
    contactPerson: 'Ahmet Özkan',
    position: 'Sosyal İşler Müdürü',
    status: 'Aktif',
    collaborationType: 'Protokol',
  },
  {
    id: 2,
    name: 'Aile ve Sosyal Hizmetler İl Müdürlüğü',
    type: 'Müdürlük',
    level: 'İl',
    contactPerson: 'Fatma Demir',
    position: 'İl Müdürü',
    status: 'Aktif',
    collaborationType: 'Koordinasyon',
  },
];

export function PartnerInstitutionsPage() {
  const activeInstitutions = mockInstitutions.filter((i) => i.status === 'Aktif').length;
  const protocolInstitutions = mockInstitutions.filter(
    (i) => i.collaborationType === 'Protokol',
  ).length;

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Devlet Kurumları</h1>
          <p className="text-muted-foreground mt-1">Kamu kurumları ile işbirliği ve koordinasyon</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Kurum
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kurum</p>
                <p className="text-2xl font-medium">{mockInstitutions.length}</p>
              </div>
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif İşbirliği</p>
                <p className="text-2xl font-medium text-green-600">{activeInstitutions}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Protokol</p>
                <p className="text-2xl font-medium text-blue-600">{protocolInstitutions}</p>
              </div>
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yerel Kurum</p>
                <p className="text-2xl font-medium text-purple-600">{mockInstitutions.length}</p>
              </div>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Institutions List */}
      <div className="grid gap-4">
        {mockInstitutions.map((institution) => (
          <Card key={institution.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium">{institution.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                    >
                      {institution.status}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 text-xs px-2 py-1 border-0">
                      {institution.type}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs px-2 py-1">
                      {institution.level}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 text-xs px-2 py-1"
                    >
                      {institution.collaborationType}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{institution.contactPerson}</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">{institution.position}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
