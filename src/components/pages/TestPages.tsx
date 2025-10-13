/**
 * @fileoverview TestPages - Test sayfaları için React component'leri
 * @description Uygulamaya entegre edilebilir test sayfaları
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { beneficiariesService } from '../../services/beneficiariesService';
import { donationsService } from '../../services/donationsService';
import { aidRequestsService } from '../../services/aidRequestsService';
import type { Beneficiary } from '../../types/beneficiary';
import type { Donation } from '../../types/donation';
import type { AidRequest } from '../../types/aidRequest';

/**
 * Beneficiaries Test Component
 * İhtiyaç sahipleri test arayüzü
 */
export function BeneficiariesTestPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBeneficiaries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await beneficiariesService.getAll();
      if (result.error) {
        setError(result.error);
      } else {
        setBeneficiaries(result.data || []);
      }
    } catch (err) {
      setError('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  return (
    <PageLayout title="İhtiyaç Sahipleri Test">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Kontrolleri
              <Button onClick={loadBeneficiaries} disabled={loading}>
                {loading ? 'Yükleniyor...' : 'Verileri Yenile'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Hata:</strong> {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {beneficiaries.length}
                  </div>
                  <div className="text-sm text-gray-600">Toplam İhtiyaç Sahibi</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {beneficiaries.filter(b => b.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600">Aktif</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {beneficiaries.filter(b => b.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Beklemede</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>İhtiyaç Sahipleri Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{beneficiary.name}</h3>
                        <p className="text-sm text-gray-600">{beneficiary.email}</p>
                        <p className="text-sm text-gray-600">{beneficiary.phone}</p>
                      </div>
                      <Badge variant={beneficiary.status === 'active' ? 'default' : 'secondary'}>
                        {beneficiary.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {beneficiaries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Henüz ihtiyaç sahibi bulunmuyor
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

/**
 * Donations Test Component
 * Bağış yönetimi test arayüzü
 */
export function DonationsTestPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDonations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await donationsService.getDonations(1, 10);
      if (result.error) {
        setError(result.error);
      } else {
        setDonations(result.data?.data || []);
      }
    } catch (err) {
      setError('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  return (
    <PageLayout title="Bağış Yönetimi Test">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Kontrolleri
              <Button onClick={loadDonations} disabled={loading}>
                {loading ? 'Yükleniyor...' : 'Verileri Yenile'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Hata:</strong> {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {donations.length}
                  </div>
                  <div className="text-sm text-gray-600">Toplam Bağış</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {donations.filter(d => d.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Tamamlanan</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {donations.filter(d => d.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Beklemede</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {donations.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('tr-TR')} TRY
                  </div>
                  <div className="text-sm text-gray-600">Toplam Tutar</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bağış Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{donation.donor_name}</h3>
                        <p className="text-sm text-gray-600">{donation.donor_email}</p>
                        <p className="text-sm text-gray-600">
                          {donation.amount?.toLocaleString('tr-TR')} {donation.currency}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                          {donation.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {donation.donation_type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {donations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Henüz bağış bulunmuyor
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

/**
 * Aid Requests Test Component
 * Yardım başvuruları test arayüzü
 */
export function AidRequestsTestPage() {
  const [aidRequests, setAidRequests] = useState<AidRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAidRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aidRequestsService.getAidRequests(1, 10);
      if (result.error) {
        setError(result.error);
      } else {
        setAidRequests(result.data || []);
      }
    } catch (err) {
      setError('Veri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAidRequests();
  }, []);

  return (
    <PageLayout title="Yardım Başvuruları Test">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Test Kontrolleri
              <Button onClick={loadAidRequests} disabled={loading}>
                {loading ? 'Yükleniyor...' : 'Verileri Yenile'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Hata:</strong> {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {aidRequests.length}
                  </div>
                  <div className="text-sm text-gray-600">Toplam Başvuru</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {aidRequests.filter(a => a.status === 'approved').length}
                  </div>
                  <div className="text-sm text-gray-600">Onaylanan</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {aidRequests.filter(a => a.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Beklemede</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {aidRequests.filter(a => a.urgency === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600">Yüksek Öncelik</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yardım Başvuruları Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Yükleniyor...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aidRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{request.applicant_name}</h3>
                        <p className="text-sm text-gray-600">{request.aid_type}</p>
                        <p className="text-sm text-gray-600">
                          {request.requested_amount?.toLocaleString('tr-TR')} TRY
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          request.status === 'approved' ? 'default' : 
                          request.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {request.status}
                        </Badge>
                        <Badge variant={
                          request.urgency === 'high' ? 'destructive' :
                          request.urgency === 'medium' ? 'secondary' : 'default'
                        } className="mt-1">
                          {request.urgency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {aidRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Henüz yardım başvurusu bulunmuyor
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

/**
 * Main Test Pages Component
 * Tüm test sayfalarını içeren ana component
 */
export function TestPagesMain() {
  return (
    <PageLayout title="Test Sayfaları">
      <Tabs defaultValue="beneficiaries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="beneficiaries">İhtiyaç Sahipleri</TabsTrigger>
          <TabsTrigger value="donations">Bağışlar</TabsTrigger>
          <TabsTrigger value="aid-requests">Yardım Başvuruları</TabsTrigger>
        </TabsList>
        
        <TabsContent value="beneficiaries">
          <BeneficiariesTestPage />
        </TabsContent>
        
        <TabsContent value="donations">
          <DonationsTestPage />
        </TabsContent>
        
        <TabsContent value="aid-requests">
          <AidRequestsTestPage />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default TestPagesMain;
