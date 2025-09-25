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
    .filter(([_, active]) => active)
    .map(([condition, _]) => condition);

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

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Genel Sağlık Durumu</span>
                <Badge
                  variant={
                    activeConditions.length === 0
                      ? 'default'
                      : activeConditions.length < 3
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {activeConditions.length === 0
                    ? 'Sağlıklı'
                    : activeConditions.length < 3
                      ? 'Orta Risk'
                      : 'Yüksek Risk'}
                </Badge>
              </div>

              <div className="text-sm text-gray-600">
                <p>Aktif Sağlık Sorunu: {activeConditions.length}</p>
                <p>
                  Risk Seviyesi:{' '}
                  {activeConditions.length === 0
                    ? 'Düşük'
                    : activeConditions.length < 3
                      ? 'Orta'
                      : 'Yüksek'}
                </p>
              </div>
            </div>

            {activeConditions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Mevcut Sağlık Sorunları
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeConditions.map((condition) => (
                    <Badge key={condition} variant="outline" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="bloodType">Kan Grubu</Label>
            {editMode ? (
              <Input
                id="bloodType"
                value={beneficiary?.bloodType ?? ''}
                onChange={(e) => {
                  onUpdate('bloodType', e.target.value);
                }}
                placeholder="Kan grubu (A+, B-, vb.)"
              />
            ) : (
              <p className="p-2 text-sm">{beneficiary?.bloodType ?? '-'}</p>
            )}
          </div>

          <div>
            <Label htmlFor="emergencyContact">Acil Durum İletişim</Label>
            {editMode ? (
              <Input
                id="emergencyContact"
                value={beneficiary?.emergencyContact ?? ''}
                onChange={(e) => {
                  onUpdate('emergencyContact', e.target.value);
                }}
                placeholder="Acil durum iletişim bilgisi"
              />
            ) : (
              <p className="p-2 text-sm">{beneficiary?.emergencyContact ?? '-'}</p>
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

        <CardContent className="space-y-4">
          {editMode ? (
            <>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {healthConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={healthConditionsState[condition] ?? false}
                      onCheckedChange={(checked: boolean) => {
                        handleConditionChange(condition, checked);
                      }}
                    />
                    <Label htmlFor={condition} className="text-sm">
                      {condition}
                    </Label>
                  </div>
                ))}
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
