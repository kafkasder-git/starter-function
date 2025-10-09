/**
 * @fileoverview BeneficiaryHealthInfo Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Activity, AlertTriangle, Heart, Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface BeneficiaryHealthInfoProps {
  beneficiary: any;
  editMode: boolean;
  onUpdate: (field: string, value: any) => void;
}

const healthConditions = [
  'Diyabet',
  'Hipertansiyon',
  'Kalp Hastalığı',
  'Astım',
  'Böbrek Hastalığı',
  'Karaciğer Hastalığı',
  'Kanser',
  'Depresyon',
  'Anksiyete',
  'Artrit',
  'Osteoporoz',
  'Yüksek Kolesterol',
  'Yüksek Tansiyon',
];

/**
 * BeneficiaryHealthInfo function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiaryHealthInfo({
  beneficiary,
  editMode,
  onUpdate,
}: BeneficiaryHealthInfoProps) {
  const [healthConditionsState, setHealthConditionsState] = useState<Record<string, boolean>>(
    beneficiary?.healthConditions || {},
  );
  const [newCondition, setNewCondition] = useState('');

  const handleConditionChange = (condition: string, checked: boolean) => {
    const updated = { ...healthConditionsState, [condition]: checked };
    setHealthConditionsState(updated);
    onUpdate('healthConditions', updated);
  };

  const addCustomCondition = () => {
    if (newCondition.trim()) {
      handleConditionChange(newCondition.trim(), true);
      setNewCondition('');
    }
  };

  const activeConditions = Object.entries(healthConditionsState)
    .filter(([, active]) => active)
    .map(([condition]) => condition);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sağlık Durumu Özeti */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Sağlık Durumu Özeti
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Genel Sağlık Durumu</h4>
                    <p className="text-sm text-gray-600">Sağlık durumu özeti</p>
                  </div>
                </div>
                <Badge
                  variant={
                    activeConditions.length === 0
                      ? 'default'
                      : activeConditions.length < 3
                        ? 'secondary'
                        : 'destructive'
                  }
                  className={`px-4 py-2 text-sm font-medium ${
                    activeConditions.length === 0
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : activeConditions.length < 3
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                  }`}
                >
                  {activeConditions.length === 0
                    ? '✓ Sağlıklı'
                    : activeConditions.length < 3
                      ? '⚠ Orta Risk'
                      : '⚠ Yüksek Risk'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-gray-600">Aktif Sağlık Sorunu</p>
                  <p className="text-2xl font-bold text-blue-600">{activeConditions.length}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-gray-600">Risk Seviyesi</p>
                  <p className={`text-lg font-semibold ${
                    activeConditions.length === 0
                      ? 'text-green-600'
                      : activeConditions.length < 3
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {activeConditions.length === 0
                      ? 'Düşük'
                      : activeConditions.length < 3
                        ? 'Orta'
                        : 'Yüksek'}
                  </p>
                </div>
              </div>
            </div>

            {activeConditions.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Mevcut Sağlık Sorunları
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeConditions.map((condition) => (
                    <Badge 
                      key={condition} 
                      variant="outline" 
                      className="text-xs font-medium px-3 py-1 bg-orange-100 text-orange-700 border-orange-300"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodType" className="form-label">
              Kan Grubu
            </Label>
            {editMode ? (
              <Input
                id="bloodType"
                value={beneficiary?.bloodType ?? ''}
                onChange={(e) => {
                  onUpdate('bloodType', e.target.value);
                }}
                placeholder="A+, B-, O+, AB- vb."
                className="form-input"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{beneficiary?.bloodType ?? '-'}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact" className="form-label">
              Acil Durum İletişim
            </Label>
            {editMode ? (
              <Input
                id="emergencyContact"
                value={beneficiary?.emergencyContact ?? ''}
                onChange={(e) => {
                  onUpdate('emergencyContact', e.target.value);
                }}
                placeholder="Acil durumda aranacak kişi ve telefon"
                className="form-input"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{beneficiary?.emergencyContact ?? '-'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sağlık Koşulları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Sağlık Koşulları
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {editMode ? (
            <>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Sağlık Durumları</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {healthConditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors duration-200">
                      <Checkbox
                        id={condition}
                        checked={healthConditionsState[condition] ?? false}
                        onCheckedChange={(checked: boolean) => {
                          handleConditionChange(condition, checked);
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor={condition} className="text-sm font-medium text-gray-700 cursor-pointer">
                        {condition}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Özel Durum Ekleme */}
              <div className="pt-4 border-t">
                <Label htmlFor="customCondition">Özel Sağlık Durumu</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="customCondition"
                    value={newCondition}
                    onChange={(e) => {
                      setNewCondition(e.target.value);
                    }}
                    placeholder="Özel sağlık durumu ekle"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={addCustomCondition}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              {activeConditions.length > 0 ? (
                activeConditions.map((condition) => (
                  <div key={condition} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">{condition}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Bilinen sağlık sorunu yok</p>
                </div>
              )}
            </div>
          )}

          {/* Sağlık Notları */}
          <div className="pt-4 border-t">
            <Label htmlFor="healthNotes">Sağlık Notları</Label>
            {editMode ? (
              <Textarea
                id="healthNotes"
                value={beneficiary?.healthNotes ?? ''}
                onChange={(e) => {
                  onUpdate('healthNotes', e.target.value);
                }}
                placeholder="Özel sağlık notları, ilaç kullanımı, vb."
                rows={3}
              />
            ) : (
              <p className="p-2 text-sm">{beneficiary?.healthNotes ?? 'Sağlık notu bulunmuyor'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
