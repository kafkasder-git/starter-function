/**
 * @fileoverview ContextEmptyState Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Heart,
  Users,
  Calendar,
  FileText,
  Camera,
  Building2,
  Search,
  Filter,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  icon?: React.ReactNode;
}

interface ContextEmptyStateProps {
  type:
    | 'donations'
    | 'beneficiaries'
    | 'events'
    | 'documents'
    | 'photos'
    | 'members'
    | 'search'
    | 'filter'
    | 'people';
  title?: string;
  description?: string;
  actions?: EmptyStateAction[];
  className?: string;
}

const EMPTY_STATE_CONFIG = {
  donations: {
    icon: Heart,
    title: 'Henüz bağış kaydı yok',
    description: 'İlk bağışı kaydetmek için yeni bağış ekleyin',
    defaultAction: { label: 'Bağış Ekle', icon: Plus },
  },
  beneficiaries: {
    icon: Users,
    title: 'İhtiyaç sahibi bulunamadı',
    description: 'Yeni ihtiyaç sahibi eklemek için butona tıklayın',
    defaultAction: { label: 'İhtiyaç Sahibi Ekle', icon: Plus },
  },
  events: {
    icon: Calendar,
    title: 'Etkinlik bulunamadı',
    description: 'Yeni etkinlik oluşturmak için butona tıklayın',
    defaultAction: { label: 'Etkinlik Oluştur', icon: Plus },
  },
  documents: {
    icon: FileText,
    title: 'Doküman bulunamadı',
    description: 'Yeni doküman yüklemek için butona tıklayın',
    defaultAction: { label: 'Doküman Yükle', icon: Plus },
  },
  photos: {
    icon: Camera,
    title: 'Fotoğraf bulunamadı',
    description: 'Yeni fotoğraf yüklemek için butona tıklayın',
    defaultAction: { label: 'Fotoğraf Yükle', icon: Plus },
  },
  members: {
    icon: Building2,
    title: 'Üye bulunamadı',
    description: 'Yeni üye eklemek için butona tıklayın',
    defaultAction: { label: 'Üye Ekle', icon: Plus },
  },
  search: {
    icon: Search,
    title: 'Arama sonucu bulunamadı',
    description: 'Farklı anahtar kelimeler deneyin veya filtreleri değiştirin',
    defaultAction: { label: 'Filtreleri Temizle', icon: RefreshCw },
  },
  filter: {
    icon: Filter,
    title: 'Filtre sonucu bulunamadı',
    description: 'Filtre kriterlerinizi değiştirin veya tüm kayıtları görüntüleyin',
    defaultAction: { label: 'Filtreleri Sıfırla', icon: RefreshCw },
  },
  people: {
    icon: Users,
    title: 'Kişi bulunamadı',
    description: 'Yeni kişi eklemek için butona tıklayın',
    defaultAction: { label: 'Kişi Ekle', icon: Plus },
  },
};

export function ContextEmptyState({
  type,
  title,
  description,
  actions,
  className = '',
}: ContextEmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const IconComponent = config.icon;

  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActions = actions || [config.defaultAction];

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <IconComponent className="w-8 h-8 text-gray-400" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{finalTitle}</h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{finalDescription}</p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {finalActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for easy empty state management
export function useEmptyState(type: ContextEmptyStateProps['type']) {
  const config = EMPTY_STATE_CONFIG[type];

  return {
    config,
    createEmptyState: (customProps?: Partial<ContextEmptyStateProps>) => (
      <ContextEmptyState type={type} {...customProps} />
    ),
  };
}
