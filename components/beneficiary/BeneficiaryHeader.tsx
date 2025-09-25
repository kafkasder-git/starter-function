/**
 * @fileoverview BeneficiaryHeader Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Calendar, Edit3, Mail, MapPin, Phone, Save, User, X } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface BeneficiaryHeaderProps {
  beneficiary: any;
  editMode: boolean;
  onEditToggle: () => void;
  onSave: () => void;
  onBack?: () => void;
}

/**
 * BeneficiaryHeader function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiaryHeader({
  beneficiary,
  editMode,
  onEditToggle,
  onSave,
  onBack,
}: BeneficiaryHeaderProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <X className="w-4 h-4" />
              </Button>
            )}
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {beneficiary?.name ?? 'İhtiyaç Sahibi Detayı'}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  ID: {beneficiary?.id ?? 'N/A'}
                </Badge>
                <Badge
                  variant={beneficiary?.status === 'Aktif' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {beneficiary?.status ?? 'Bilinmiyor'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <Button size="sm" onClick={onSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
                <Button variant="outline" size="sm" onClick={onEditToggle}>
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={onEditToggle}>
                <Edit3 className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{beneficiary?.phone ?? 'Telefon bilgisi yok'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{beneficiary?.email ?? 'E-mail bilgisi yok'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{beneficiary?.address ?? 'Adres bilgisi yok'}</span>
          </div>
        </div>

        {beneficiary?.registrationDate && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>
                Kayıt Tarihi: {new Date(beneficiary.registrationDate).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
