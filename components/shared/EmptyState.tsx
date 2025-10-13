/**
 * @fileoverview EmptyState Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import {
  Search,
  Users,
  Heart,
  Package,
  FileX,
  Database,
  Inbox,
  Calendar,
  WifiOff,
  SearchX,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Heading } from '../ui/heading';
import { Text } from '../ui/text';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'error' | 'offline' | 'no-results';
  className?: string;
  animated?: boolean;
}

/**
 * EmptyState function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = '',
  animated = true,
}: EmptyStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'search':
        return {
          background: 'bg-gradient-to-br from-info-50 to-info-100',
          iconBg: 'bg-gradient-to-br from-info-500 to-info-600',
          buttonBg:
            'bg-gradient-to-r from-info-600 to-info-700 hover:from-info-700 hover:to-info-800',
        };
      case 'error':
        return {
          background: 'bg-gradient-to-br from-error-50 to-error-100',
          iconBg: 'bg-gradient-to-br from-error-500 to-error-600',
          buttonBg:
            'bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800',
        };
      case 'offline':
        return {
          background: 'bg-gradient-to-br from-neutral-50 to-neutral-100',
          iconBg: 'bg-gradient-to-br from-neutral-500 to-neutral-600',
          buttonBg:
            'bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-neutral-700 hover:to-neutral-800',
        };
      case 'no-results':
        return {
          background: 'bg-gradient-to-br from-warning-50 to-warning-100',
          iconBg: 'bg-gradient-to-br from-warning-500 to-warning-600',
          buttonBg:
            'bg-gradient-to-r from-warning-600 to-warning-700 hover:from-warning-700 hover:to-warning-800',
        };
      case 'default':
      default:
        return {
          background: 'bg-gradient-to-br from-neutral-50 to-neutral-100',
          iconBg: 'bg-gradient-to-br from-neutral-500 to-neutral-600',
          buttonBg:
            'bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-neutral-700 hover:to-neutral-800',
        };
    }
  };

  const styles = getVariantStyles();

  const getDefaultIcon = () => {
    switch (variant) {
      case 'offline':
        return <WifiOff className="w-10 h-10" />;
      case 'no-results':
        return <SearchX className="w-10 h-10" />;
      case 'error':
        return <AlertTriangle className="w-10 h-10" />;
      case 'search':
        return <SearchX className="w-10 h-10" />;
      case 'default':
        return <FileX className="w-10 h-10" />;
      default:
        return <FileX className="w-10 h-10" />;
    }
  };

  const content = (
    <Card
      className={`border-none shadow-lg ${styles.background} ${className}`}
      role="status"
      aria-live="polite"
    >
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div
            className={`w-20 h-20 ${styles.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}
          >
            <div className="text-white" aria-hidden="true">
              {icon ?? getDefaultIcon()}
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3 max-w-md">
            <Heading level={2} size="2xl" weight="semibold" color="neutral">
              {title}
            </Heading>
            <Text color="neutral" className="leading-relaxed">
              {description}
            </Text>
          </div>

          {/* Action Button */}
          {action && (
            <Button
              onClick={action.onClick}
              className={`h-12 px-6 ${styles.buttonBg} rounded-xl shadow-lg transition-all duration-300 hover:scale-105`}
              aria-label={action.label}
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// Predefined empty states for common scenarios
export const NoSearchResults = ({
  searchTerm,
  onClearSearch,
}: {
  searchTerm: string;
  onClearSearch: () => void;
}) => (
  <EmptyState
    icon={<Search className="w-10 h-10" />}
    title="Arama Sonucu Bulunamadı"
    description={`"${searchTerm}" için herhangi bir sonuç bulunamadı. Farklı anahtar kelimeler deneyebilirsiniz.`}
    action={{
      label: 'Aramayı Temizle',
      onClick: onClearSearch,
    }}
    variant="no-results"
  />
);

export const NoInternetConnection = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={<WifiOff className="w-10 h-10" />}
    title="İnternet Bağlantısı Yok"
    description="İnternet bağlantınızı kontrol edin ve tekrar deneyin."
    action={
      onRetry
        ? {
            label: 'Tekrar Dene',
            onClick: onRetry,
          }
        : undefined
    }
    variant="offline"
  />
);

export const NoResultsFound = ({ onClearFilters }: { onClearFilters?: () => void }) => (
  <EmptyState
    icon={<SearchX className="w-10 h-10" />}
    title="Sonuç Bulunamadı"
    description="Arama kriterlerinizi değiştirerek tekrar deneyin."
    action={
      onClearFilters
        ? {
            label: 'Filtreleri Temizle',
            onClick: onClearFilters,
          }
        : undefined
    }
    variant="no-results"
  />
);

export const ServerError = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    icon={<AlertTriangle className="w-10 h-10" />}
    title="Sunucu Hatası"
    description="Bir şeyler yanlış gitti. Lütfen daha sonra tekrar deneyin."
    action={
      onRetry
        ? {
            label: 'Tekrar Dene',
            onClick: onRetry,
          }
        : undefined
    }
    variant="error"
  />
);

export const NoMembers = ({ onAddMember }: { onAddMember: () => void }) => (
  <EmptyState
    icon={<Users className="w-10 h-10" />}
    title="Henüz Üye Yok"
    description="Derneğinize ilk üyeyi ekleyerek başlayın. Üye bilgilerini düzenleyebilir ve takip edebilirsiniz."
    action={{
      label: 'İlk Üyeyi Ekle',
      onClick: onAddMember,
    }}
  />
);

export const NoDonations = ({ onAddDonation }: { onAddDonation: () => void }) => (
  <EmptyState
    icon={<Heart className="w-10 h-10" />}
    title="Henüz Bağış Yok"
    description="İlk bağışı kaydedin ve hayırseverlerin desteklerini takip etmeye başlayın."
    action={{
      label: 'İlk Bağışı Ekle',
      onClick: onAddDonation,
    }}
  />
);

export const NoKumbaras = ({ onAddKumbara }: { onAddKumbara: () => void }) => (
  <EmptyState
    icon={<Package className="w-10 h-10" />}
    title="Henüz Kumbara Yok"
    description="İlk kumbarayı yerleştirin ve QR kodlu takip sistemi ile gelirlerinizi izlemeye başlayın."
    action={{
      label: 'İlk Kumbarayı Ekle',
      onClick: onAddKumbara,
    }}
  />
);

export const NoData = ({
  title = 'Veri Bulunamadı',
  description = 'Bu bölümde henüz herhangi bir veri bulunmuyor.',
}: {
  title?: string;
  description?: string;
}) => (
  <EmptyState icon={<Database className="w-10 h-10" />} title={title} description={description} />
);

export const NoActivity = () => (
  <EmptyState
    icon={<Inbox className="w-10 h-10" />}
    title="Henüz Etkinlik Yok"
    description="Sistem kullanımı başladığında burada son etkinlikleri göreceksiniz."
  />
);

export const NoEvents = ({ onAddEvent }: { onAddEvent: () => void }) => (
  <EmptyState
    icon={<Calendar className="w-10 h-10" />}
    title="Henüz Etkinlik Yok"
    description="İlk etkinliğinizi ekleyin ve takvim üzerinden takip etmeye başlayın."
    action={{
      label: 'İlk Etkinliği Ekle',
      onClick: onAddEvent,
    }}
  />
);
