/**
 * @fileoverview EmptyState Component - Boş durumlar için UI component
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Users, 
  Heart, 
  GraduationCap, 
  MessageSquare, 
  Calendar,
  Search,
  RefreshCw
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Empty state component for showing when no data is available
 * Farklı modüller için özelleştirilmiş icon'lar ve mesajlar
 */
const EmptyStateComponent = memo(({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md'
}: EmptyStateProps) => {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  };

  const iconSizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size],
      className
    )}>
      {icon && (
        <div className={cn('text-gray-400 mb-4', iconSizes[size])}>
          {icon}
        </div>
      )}
      
      <h3 className={cn(
        'font-medium text-gray-900 mb-2',
        size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
      )}>
        {title}
      </h3>
      
      <p className={cn(
        'text-gray-500 mb-6 max-w-md',
        size === 'sm' ? 'text-sm' : 'text-base'
      )}>
        {description}
      </p>
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="min-w-[120px]"
            >
              {action.label}
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
              className="min-w-[120px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

// Predefined empty states for common modules
export const EmptyStates = {
  Beneficiaries: memo(({ onCreate }: { onCreate: () => void }) => {
    return (
      <EmptyStateComponent
        icon={<Users className="w-16 h-16" />}
        title="İhtiyaç Sahibi Bulunamadı"
        description="Henüz kayıtlı ihtiyaç sahibi bulunmuyor. Yeni bir ihtiyaç sahibi eklemek için butona tıklayın."
        action={{
          label: 'İhtiyaç Sahibi Ekle',
          onClick: onCreate,
          variant: 'default'
        }}
        secondaryAction={{
          label: 'Yenile',
          onClick: () => { window.location.reload(); },
          variant: 'outline'
        }}
      />
    );
  }),

  Donations: memo(({ onCreate }: { onCreate: () => void }) => {
    return (
      <EmptyStateComponent
        icon={<Heart className="w-16 h-16" />}
        title="Bağış Bulunamadı"
        description="Henüz kayıtlı bağış bulunmuyor. Yeni bir bağış kaydı oluşturmak için butona tıklayın."
        action={{
          label: 'Bağış Kaydet',
          onClick: onCreate,
          variant: 'default'
        }}
        secondaryAction={{
          label: 'Yenile',
          onClick: () => { window.location.reload(); },
          variant: 'outline'
        }}
      />
    );
  }),

  Scholarships: memo(({ onCreate }: { onCreate: () => void }) => {
    return (
      <EmptyStateComponent
        icon={<GraduationCap className="w-16 h-16" />}
        title="Burs Kaydı Bulunamadı"
        description="Henüz kayıtlı burs bulunmuyor. Yeni bir burs kaydı oluşturmak için butona tıklayın."
        action={{
          label: 'Burs Kaydı Ekle',
          onClick: onCreate,
          variant: 'default'
        }}
        secondaryAction={{
          label: 'Yenile',
          onClick: () => { window.location.reload(); },
          variant: 'outline'
        }}
      />
    );
  }),

  Messages: memo(({ onNewMessage }: { onNewMessage: () => void }) => {
    return (
      <EmptyStateComponent
        icon={<MessageSquare className="w-16 h-16" />}
        title="Mesaj Bulunamadı"
        description="Henüz mesajınız bulunmuyor. Yeni bir mesaj göndermek için butona tıklayın."
        action={{
          label: 'Yeni Mesaj',
          onClick: onNewMessage,
          variant: 'default'
        }}
        secondaryAction={{
          label: 'Yenile',
          onClick: () => { window.location.reload(); },
          variant: 'outline'
        }}
      />
    );
  }),

  Events: memo(({ onCreate }: { onCreate: () => void }) => {
    return (
      <EmptyStateComponent
        icon={<Calendar className="w-16 h-16" />}
        title="Etkinlik Bulunamadı"
        description="Henüz kayıtlı etkinlik bulunmuyor. Yeni bir etkinlik oluşturmak için butona tıklayın."
        action={{
          label: 'Etkinlik Oluştur',
          onClick: onCreate,
          variant: 'default'
        }}
        secondaryAction={{
          label: 'Yenile',
          onClick: () => { window.location.reload(); },
          variant: 'outline'
        }}
      />
    );
  }),

  Search: memo(({ onClearSearch }: { onClearSearch: () => void }) => {
    return (
      <EmptyStateComponent
        icon={<Search className="w-16 h-16" />}
        title="Arama Sonucu Bulunamadı"
        description="Arama kriterlerinize uygun sonuç bulunamadı. Farklı anahtar kelimeler deneyin."
        action={{
          label: 'Aramayı Temizle',
          onClick: onClearSearch,
          variant: 'outline'
        }}
        size="sm"
      />
    );
  }),

  Documents: memo(({ onUpload }: { onUpload: () => void }) => {
    return (
      <EmptyStateComponent
        icon={<FileText className="w-16 h-16" />}
        title="Doküman Bulunamadı"
        description="Henüz yüklenmiş doküman bulunmuyor. Yeni doküman yüklemek için butona tıklayın."
        action={{
          label: 'Doküman Yükle',
          onClick: onUpload,
          variant: 'default'
        }}
        secondaryAction={{
          label: 'Yenile',
          onClick: () => { window.location.reload(); },
          variant: 'outline'
        }}
      />
    );
  }),

  Loading: memo(() => {
    return (
      <EmptyStateComponent
        icon={<RefreshCw className="w-16 h-16 animate-spin" />}
        title="Yükleniyor..."
        description="Veriler getiriliyor, lütfen bekleyin."
        size="sm"
      />
    );
  })
};

export default EmptyStateComponent;