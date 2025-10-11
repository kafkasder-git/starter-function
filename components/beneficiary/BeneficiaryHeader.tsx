/**
 * @fileoverview BeneficiaryHeader Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';
import { Calendar, Mail, MapPin, Phone, Save, User, X } from 'lucide-react';
import { actionIcons } from '../../lib/design-system/icons';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatDate } from '../../lib/utils/dateFormatter';

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
    <Card className="mb-6 shadow-sm border-0 bg-gradient-to-r from-white to-gray-50">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="hover:bg-gray-100 rounded-lg p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                  {beneficiary?.name ?? 'İhtiyaç Sahibi Detayı'}
                </CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <Badge
                    variant="outline"
                    className="text-xs font-medium px-3 py-1 bg-gray-100 text-gray-700 border-gray-300"
                  >
                    ID: {beneficiary?.id ?? 'N/A'}
                  </Badge>
                  <Badge
                    variant={beneficiary?.status === 'Aktif' ? 'default' : 'secondary'}
                    className={`text-xs font-medium px-3 py-1 ${
                      beneficiary?.status === 'Aktif'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {beneficiary?.status === 'Aktif' ? '✓ Aktif' : beneficiary?.status ?? 'Bilinmiyor'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {editMode ? (
              <>
                <Button
                  size="sm"
                  onClick={onSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEditToggle}
                  className="px-4 py-2 text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditToggle}
                className="px-4 py-2 text-blue-700 border-blue-300 hover:bg-blue-50 rounded-lg font-medium transition-all duration-200"
              >
                {React.createElement(actionIcons.edit, { className: 'w-4 h-4 mr-2' })}
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefon</p>
              <p className="text-sm font-medium text-gray-900">
                {beneficiary?.phone ?? 'Telefon bilgisi yok'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <Mail className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">E-mail</p>
              <p className="text-sm font-medium text-gray-900">
                {beneficiary?.email ?? 'E-mail bilgisi yok'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
              <MapPin className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adres</p>
              <p className="text-sm font-medium text-gray-900">
                {beneficiary?.address ?? 'Adres bilgisi yok'}
              </p>
            </div>
          </div>
        </div>

        {beneficiary?.registrationDate && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Kayıt Tarihi</p>
                <p className="text-sm font-medium text-blue-900">
                  {formatDate(beneficiary.registrationDate, 'long')}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
