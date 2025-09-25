/**
 * @fileoverview PartnerDonorsPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Heart, Building2, DollarSign, Star, Plus } from 'lucide-react';

const mockDonors = [
  {
    id: 1,
    name: 'Hayırsever Ailesi Vakfı',
    type: 'Vakıf',
    totalDonations: 450000,
    donationCount: 25,
    rating: 5,
    status: 'Aktif',
  },
  {
    id: 2,
    name: 'Teknoloji Şirketi AŞ',
    type: 'Kurumsal',
    totalDonations: 275000,
    donationCount: 15,
    rating: 4,
    status: 'Aktif',
  },
];

/**
 * PartnerDonorsPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function PartnerDonorsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalDonations = mockDonors.reduce((sum, donor) => sum + donor.totalDonations, 0);

  return (
    <div className="flex-1 space-y-4 p-4 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Bağışçı Kurumlar</h1>
          <p className="text-muted-foreground mt-1">Kurumsal bağışçı yönetimi ve ilişki takibi</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Yeni Bağışçı
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Bağış</p>
                <p className="text-xl font-medium text-green-600">
                  {formatCurrency(totalDonations)}
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
                <p className="text-sm text-muted-foreground">Aktif Bağışçı</p>
                <p className="text-2xl font-medium text-blue-600">{mockDonors.length}</p>
              </div>
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kurum</p>
                <p className="text-2xl font-medium">{mockDonors.length}</p>
              </div>
              <Building2 className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En İyi</p>
                <p className="text-2xl font-medium text-orange-600">
                  {mockDonors.filter((d) => d.rating >= 4).length}
                </p>
              </div>
              <Star className="w-5 h-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donors List */}
      <div className="grid gap-4">
        {mockDonors.map((donor) => (
          <Card key={donor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium">{donor.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-1"
                    >
                      {donor.status}
                    </Badge>
                    <Badge className="bg-blue-50 text-blue-700 text-xs px-2 py-1 border-0">
                      {donor.type}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">{donor.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">
                    {formatCurrency(donor.totalDonations)}
                  </div>
                  <div className="text-xs text-green-600">Toplam Bağış</div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">{donor.donationCount}</div>
                  <div className="text-xs text-blue-600">Bağış Sayısı</div>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">
                    {formatCurrency(donor.totalDonations / donor.donationCount)}
                  </div>
                  <div className="text-xs text-purple-600">Ortalama</div>
                </div>

                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">{donor.rating}</div>
                  <div className="text-xs text-orange-600">Değerlendirme</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
