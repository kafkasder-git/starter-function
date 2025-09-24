import type { ReactNode } from 'react';
import { Search, Users, Heart, Package, FileX, Database, Inbox, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'search' | 'error';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'search':
        return {
          background: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          buttonBg:
            'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
        };
      case 'error':
        return {
          background: 'bg-gradient-to-br from-red-50 to-orange-50',
          iconBg: 'bg-gradient-to-br from-red-500 to-orange-600',
          buttonBg:
            'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700',
        };
      default:
        return {
          background: 'bg-gradient-to-br from-slate-50 to-gray-50',
          iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
          buttonBg:
            'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={`border-0 shadow-lg ${styles.background} ${className}`}>
      <CardContent className="p-12 text-center">
        <div className="flex flex-col items-center space-y-6">
          {/* Icon */}
          <div
            className={`w-20 h-20 ${styles.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}
          >
            <div className="text-white">{icon || <FileX className="w-10 h-10" />}</div>
          </div>

          {/* Text Content */}
          <div className="space-y-3 max-w-md">
            <h3 className="text-2xl font-semibold text-slate-800">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
          </div>

          {/* Action Button */}
          {action && (
            <Button
              onClick={action.onClick}
              className={`h-12 px-6 ${styles.buttonBg} rounded-xl shadow-lg transition-all duration-300 hover:scale-105`}
            >
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
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
    variant="search"
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
