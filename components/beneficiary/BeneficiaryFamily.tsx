/**
 * @fileoverview BeneficiaryFamily Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Heart, Plus, User, Users } from 'lucide-react';
import { actionIcons } from '../../lib/design-system/icons';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age?: number;
  occupation?: string;
  income?: number;
  healthStatus?: string;
}

interface BeneficiaryFamilyProps {
  beneficiaryId: string;
  familyMembers?: FamilyMember[];
  editMode: boolean;
  onFamilyUpdate: (members: FamilyMember[]) => void;
}

/**
 * BeneficiaryFamily function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BeneficiaryFamily({
  familyMembers = [],
  editMode,
  onFamilyUpdate,
}: BeneficiaryFamilyProps) {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({
    name: '',
    relationship: '',
    age: 0,
    occupation: '',
    income: 0,
    healthStatus: 'Sağlıklı',
  });

  const relationships = [
    'Eş',
    'Çocuk',
    'Anne',
    'Baba',
    'Kardeş',
    'Büyükanne',
    'Büyükbaba',
    'Diğer',
  ];

  const healthStatuses = ['Sağlıklı', 'Kronik Hastalık', 'Engelli', 'Yaşlılık', 'Diğer'];

  const occupations = [
    'İşsiz',
    'Emekli',
    'Memur',
    'İşçi',
    'Serbest Meslek',
    'Öğrenci',
    'Ev Hanımı',
  ];

  const handleAddMember = () => {
    if (!newMember.name || !newMember.relationship) {
      toast.error('Ad ve yakınlık derecesi zorunludur!');
      return;
    }

    const member: FamilyMember = {
      id: Date.now().toString(),
      name: newMember.name,
      relationship: newMember.relationship,
      age: newMember.age,
      occupation: newMember.occupation,
      income: newMember.income,
      healthStatus: newMember.healthStatus,
    };

    const updatedMembers = [...familyMembers, member];
    onFamilyUpdate(updatedMembers);

    setNewMember({
      name: '',
      relationship: '',
      age: 0,
      occupation: '',
      income: 0,
      healthStatus: 'Sağlıklı',
    });

    setIsAddMemberModalOpen(false);
    toast.success('Aile üyesi eklendi!');
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setNewMember(member);
    setIsAddMemberModalOpen(true);
  };

  const handleUpdateMember = () => {
    if (!editingMember || !newMember.name || !newMember.relationship) {
      toast.error('Ad ve yakınlık derecesi zorunludur!');
      return;
    }

    const updatedMembers = familyMembers.map((member) =>
      member.id === editingMember.id ? ({ ...member, ...newMember } as FamilyMember) : member
    );

    onFamilyUpdate(updatedMembers);

    setEditingMember(null);
    setNewMember({
      name: '',
      relationship: '',
      age: 0,
      occupation: '',
      income: 0,
      healthStatus: 'Sağlıklı',
    });

    setIsAddMemberModalOpen(false);
    toast.success('Aile üyesi güncellendi!');
  };

  const handleDeleteMember = (memberId: string) => {
    const updatedMembers = familyMembers.filter((member) => member.id !== memberId);
    onFamilyUpdate(updatedMembers);
    toast.success('Aile üyesi silindi!');
  };

  const totalFamilyIncome = familyMembers.reduce(
    (total, member) => total + (member.income ?? 0),
    0
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Aile Bilgileri
            </CardTitle>
            {editMode && (
              <Button
                size="sm"
                onClick={() => {
                  setIsAddMemberModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Aile Üyesi Ekle
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {familyMembers.length > 0 ? (
            <div className="space-y-4">
              {/* Aile Özeti */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{familyMembers.length}</p>
                  <p className="text-sm font-medium text-gray-600">Aile Üyesi</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {totalFamilyIncome.toLocaleString('tr-TR')} ₺
                  </p>
                  <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(totalFamilyIncome / (familyMembers.length + 1)).toLocaleString(
                      'tr-TR'
                    )}{' '}
                    ₺
                  </p>
                  <p className="text-sm font-medium text-gray-600">Kişi Başı Gelir</p>
                </div>
              </div>

              {/* Aile Üyeleri Listesi */}
              <div className="space-y-4">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{member.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge
                            variant="outline"
                            className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {member.relationship}
                          </Badge>
                          {member.age && (
                            <span className="text-sm text-gray-600 font-medium">
                              {member.age} yaş
                            </span>
                          )}
                          {member.occupation && (
                            <span className="text-sm text-gray-600">• {member.occupation}</span>
                          )}
                        </div>
                        {member.income && member.income > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <p className="text-sm font-medium text-green-600">
                              Gelir: {member.income.toLocaleString('tr-TR')} ₺
                            </p>
                          </div>
                        )}
                        {member.healthStatus && member.healthStatus !== 'Sağlıklı' && (
                          <div className="mt-2">
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium px-2 py-1 bg-orange-50 text-orange-700 border-orange-200"
                            >
                              <Heart className="w-3 h-3 mr-1" />
                              {member.healthStatus}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {editMode && (
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleEditMember(member);
                              }}
                              className="hover:bg-blue-50 text-blue-600 hover:text-blue-700 p-2 rounded-lg transition-all duration-200"
                              aria-label={`Edit family member ${member.name}`}
                            >
                              {React.createElement(actionIcons.edit, { className: 'w-4 h-4' })}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Düzenle</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                handleDeleteMember(member.id);
                              }}
                              className="hover:bg-red-50 text-red-600 hover:text-red-700 p-2 rounded-lg transition-all duration-200"
                              aria-label={`Delete family member ${member.name}`}
                            >
                              {React.createElement(actionIcons.delete, { className: 'w-4 h-4' })}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Sil</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aile üyesi bilgisi bulunmuyor</p>
              {editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setIsAddMemberModalOpen(true);
                  }}
                >
                  İlk aile üyesini ekle
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Family Member Modal */}
      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Aile Üyesi Düzenle' : 'Aile Üyesi Ekle'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="memberName">Ad Soyad *</Label>
              <Input
                id="memberName"
                value={newMember.name ?? ''}
                onChange={(e) => {
                  setNewMember((prev) => ({ ...prev, name: e.target.value }));
                }}
                placeholder="Aile üyesi adı"
              />
            </div>

            <div>
              <Label htmlFor="relationship">Yakınlık Derecesi *</Label>
              <Select
                value={newMember.relationship ?? ''}
                onValueChange={(value: string) => {
                  setNewMember((prev) => ({ ...prev, relationship: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Yakınlık derecesi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memberAge">Yaş</Label>
                <Input
                  id="memberAge"
                  type="number"
                  value={newMember.age ?? ''}
                  onChange={(e) => {
                    setNewMember((prev) => ({ ...prev, age: parseInt(e.target.value) || 0 }));
                  }}
                  placeholder="Yaş"
                  min="0"
                  max="120"
                />
              </div>

              <div>
                <Label htmlFor="memberIncome">Gelir (₺)</Label>
                <Input
                  id="memberIncome"
                  type="number"
                  value={newMember.income ?? ''}
                  onChange={(e) => {
                    setNewMember((prev) => ({ ...prev, income: parseInt(e.target.value) || 0 }));
                  }}
                  placeholder="Aylık gelir"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="memberOccupation">Meslek</Label>
              <Select
                value={newMember.occupation ?? ''}
                onValueChange={(value: string) => {
                  setNewMember((prev) => ({ ...prev, occupation: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Meslek seçin" />
                </SelectTrigger>
                <SelectContent>
                  {occupations.map((occ) => (
                    <SelectItem key={occ} value={occ}>
                      {occ}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="memberHealth">Sağlık Durumu</Label>
              <Select
                value={newMember.healthStatus ?? 'Sağlıklı'}
                onValueChange={(value: string) => {
                  setNewMember((prev) => ({ ...prev, healthStatus: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sağlık durumu seçin" />
                </SelectTrigger>
                <SelectContent>
                  {healthStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setEditingMember(null);
                setNewMember({
                  name: '',
                  relationship: '',
                  age: 0,
                  occupation: '',
                  income: 0,
                  healthStatus: 'Sağlıklı',
                });
              }}
            >
              İptal
            </Button>
            <Button onClick={editingMember ? handleUpdateMember : handleAddMember}>
              {editingMember ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
