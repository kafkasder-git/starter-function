/**
 * @fileoverview PartnerSponsorsPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Award, DollarSign, Target, Star, Plus } from 'lucide-react';

const mockSponsors = [
  {
    id: 1,
    name: 'Teknoloji Holding A.Ş.',
    type: 'Kurumsal',
    sponsorshipType: 'Sürekli',
    contactPerson: 'Zeynep Kaya',
    status: 'Aktif',
    totalSponsorship: 450000,
    currentProjects: 3,
    completedProjects: 12,
    rating: 5,
  },
  {
    id: 2,
    name: 'Ankara Belediyesi',
    type: 'Kamu',
    sponsorshipType: 'Etkinlik',
    contactPerson: 'Mehmet Özkan',
    status: 'Aktif',
    totalSponsorship: 285000,
    currentProjects: 2,
    completedProjects: 8,
    rating: 4,
  },
];

/**
 * PartnerSponsorsPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function PartnerSponsorsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalSponsorship = mockSponsors.reduce((sum, sponsor) => sum + sponsor.totalSponsorship, 0);
  const activeSponsors = mockSponsors.filter((s) => s.status === 'Aktif').length;
  const majorSponsors = mockSponsors.filter((s) => s.totalSponsorship >= 300000).length;
  const totalProjects = mockSponsors.reduce((sum, sponsor) => sum + sponsor.currentProjects, 0);

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Sponsor Kuruluşlar</h1>
          <p className="text-muted-foreground mt-1">
            Sponsorluk ilişkileri ve proje destekleri yönetimi
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Sponsor
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Sponsorluk</p>
                <p className="text-xl font-medium text-green-600">
                  {formatCurrency(totalSponsorship)}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Sponsor</p>
                <p className="text-2xl font-medium text-blue-600">{activeSponsors}</p>
              </div>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Büyük Sponsor</p>
                <p className="text-2xl font-medium text-purple-600">{majorSponsors}</p>
              </div>
              <Star className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Proje</p>
                <p className="text-2xl font-medium text-orange-600">{totalProjects}</p>
              </div>
              <Target className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsors List */}
      <div className="grid gap-4">
        {mockSponsors.map((sponsor) => (
          <Card key={sponsor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium">{sponsor.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                    >
                      {sponsor.status}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 text-xs px-2 py-1 border-0">
                      {sponsor.type}
                    </Badge>
                    <Badge variant="outline" className="bg-cyan-50 text-cyan-700 text-xs px-2 py-1">
                      {sponsor.sponsorshipType}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">{sponsor.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">
                    {formatCurrency(sponsor.totalSponsorship)}
                  </div>
                  <div className="text-xs text-green-600">Toplam Sponsorluk</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">{sponsor.currentProjects}</div>
                  <div className="text-xs text-blue-600">Aktif Proje</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">
                    {sponsor.completedProjects}
                  </div>
                  <div className="text-xs text-purple-600">Tamamlanan</div>
                </div>

                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">{sponsor.contactPerson}</div>
                  <div className="text-xs text-orange-600">İletişim Kişisi</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
