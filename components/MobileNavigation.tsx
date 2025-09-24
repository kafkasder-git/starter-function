import { useState, useEffect } from 'react';
import {
  Home,
  Heart,
  Users,
  HelpingHand,
  GraduationCap,
  Wallet,
  MessageSquare,
  Calendar,
  Menu,
  X,
  Building2,
  Shield,
  Scale,
} from 'lucide-react';
import { cn } from './ui/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { motion, AnimatePresence } from 'motion/react';
// Auth imports removed for simplified implementation

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  subPages: { name: string; href: string }[];
  badge?: number;
}

// Permission mapping removed - all modules accessible

// Web ile aynı modüller - consistent navigation
const modules: Module[] = [
  {
    id: 'genel',
    name: 'Ana Sayfa',
    icon: <Home className="w-5 h-5" />,
    subPages: [{ name: 'Dashboard', href: '/dashboard' }],
  },
  {
    id: 'bagis',
    name: 'Bağışlar',
    icon: <Heart className="w-5 h-5" />,
    subPages: [
      { name: 'Bağış Listesi', href: '/bagis/liste' },
      { name: 'Bağış Raporları', href: '/bagis/raporlar' },
      { name: 'Kumbara Takibi', href: '/bagis/kumbara' },
    ],
  },
  {
    id: 'uye',
    name: 'Üyeler',
    icon: <Users className="w-5 h-5" />,
    subPages: [
      { name: 'Üye Listesi', href: '/uye/liste' },
      { name: 'Aidat Takibi', href: '/uye/aidat' },
      { name: 'Yeni Üye', href: '/uye/yeni' },
    ],
  },
  {
    id: 'yardim',
    name: 'Yardım',
    icon: <HelpingHand className="w-5 h-5" />,
    subPages: [
      { name: 'İhtiyaç Sahipleri', href: '/yardim/ihtiyac-sahipleri' },
      { name: 'Başvurular', href: '/yardim/basvurular' },
      { name: 'Yardım Listesi', href: '/yardim/liste' },
      { name: 'Nakit Yardım Vezne', href: '/yardim/nakdi-vezne' },
      { name: 'Banka Ödeme Emirleri', href: '/yardim/banka-odeme' },
      { name: 'Nakit Yardım İşlemleri', href: '/yardim/nakdi-islemler' },
      { name: 'Ayni Yardım İşlemleri', href: '/yardim/ayni-islemler' },
      { name: 'Hizmet Takibi', href: '/yardim/hizmet-takip' },
      { name: 'Hastane Sevk', href: '/yardim/hastane-sevk' },
    ],
  },
  {
    id: 'burs',
    name: 'Burs',
    icon: <GraduationCap className="w-5 h-5" />,
    subPages: [
      { name: 'Öğrenci Listesi', href: '/burs/ogrenciler' },
      { name: 'Burs Başvuruları', href: '/burs/basvurular' },
    ],
  },
  {
    id: 'fon',
    name: 'Fon',
    icon: <Wallet className="w-5 h-5" />,
    subPages: [
      { name: 'Gelir Gider', href: '/fon/gelir-gider' },
      { name: 'Raporlar', href: '/fon/raporlar' },
    ],
  },
  {
    id: 'mesaj',
    name: 'Mesaj',
    icon: <MessageSquare className="w-5 h-5" />,
    subPages: [
      { name: 'Toplu Mesaj', href: '/mesaj/toplu' },
      { name: 'Kurum İçi Mesajlaşma', href: '/mesaj/kurum-ici' },
    ],
  },
  {
    id: 'is',
    name: 'İş',
    icon: <Calendar className="w-5 h-5" />,
    subPages: [
      { name: 'Etkinlikler', href: '/is/etkinlikler' },
      { name: 'Toplantılar', href: '/is/toplantilar' },
      { name: 'Görevlerim', href: '/is/gorevler' },
    ],
  },
  {
    id: 'partner',
    name: 'Partner Yönetimi',
    icon: <Building2 className="w-5 h-5" />,
    subPages: [
      { name: 'Tüm Partnerler', href: '/partner/liste' },
      { name: 'Bağışçı Kurumlar', href: '/partner/bagiscilar' },
      { name: 'Devlet Kurumları', href: '/partner/kurumlar' },
      { name: 'Tedarikçiler', href: '/partner/tedarikci' },
      { name: 'Sponsor Kuruluşlar', href: '/partner/sponsorlar' },
      { name: 'İş Birliği Anlaşmaları', href: '/partner/anlasmalar' },
      { name: 'Diğer Dernekler', href: '/partner/dernekler' },
    ],
  },
  {
    id: 'hukuki',
    name: 'Hukuki Yardım',
    icon: <Scale className="w-5 h-5" />,
    subPages: [
      { name: 'Hukuki Danışmanlık', href: '/hukuki/danismanlik' },
      { name: 'Avukat Atamaları', href: '/hukuki/avukatlar' },
      { name: 'Dava Takipleri', href: '/hukuki/davalar' },
      { name: 'Hukuki Belgeler', href: '/hukuki/belgeler' },
      { name: 'Hukuki Raporlar', href: '/hukuki/raporlar' },
      { name: 'Barolar ile İlişkiler', href: '/hukuki/barolar' },
    ],
  },
  {
    id: 'user-management',
    name: 'Kullanıcı Yönetimi',
    icon: <Shield className="w-5 h-5" />,
    subPages: [
      { name: 'Kullanıcılar', href: '/user-management/users' },
      { name: 'Roller', href: '/user-management/roles' },
      { name: 'İzinler', href: '/user-management/permissions' },
    ],
  },
  {
    id: 'security',
    name: 'Güvenlik & Doküman',
    icon: <Shield className="w-5 h-5" />,
    subPages: [
      { name: 'Güvenlik Merkezi', href: '/security/dashboard' },
      { name: 'Doküman Yönetimi', href: '/security/documents' },
      { name: 'Erişim Kontrolü', href: '/security/access-control' },
      { name: 'Audit Günlükleri', href: '/security/audit-log' },
    ],
  },
];

interface MobileNavigationProps {
  activeModule?: string;
  onModuleChange?: (moduleId: string) => void;
  onSubPageChange?: (href: string) => void;
}

export function MobileNavigation({
  activeModule = 'genel',
  onModuleChange,
  onSubPageChange,
}: MobileNavigationProps) {
  // Auth removed for simplified implementation
  const [isOpen, setIsOpen] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // Tüm modüller erişilebilir - permission kontrolü kaldırıldı
  const filteredModules = modules;

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
    setExpandedModule(null);
  }, [activeModule]);

  const handleModuleClick = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    } else {
      setExpandedModule(moduleId);
      onModuleChange?.(moduleId);
    }
  };

  const handleSubPageClick = (href: string, moduleId: string) => {
    // Special handling for user management module (same as Sidebar)
    if (moduleId === 'user-management') {
      // Handle user management navigation via special prop if available
      onModuleChange?.(moduleId);
    } else {
      onModuleChange?.(moduleId);
      onSubPageChange?.(href);
    }

    setIsOpen(false);
    setExpandedModule(null);
  };

  return (
    <>
      {/* Mobile Bottom Navigation - Always visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="grid grid-cols-5 h-16">
          {/* Primary modules for quick access */}
          {filteredModules.slice(0, 4).map((module) => (
            <button
              key={module.id}
              onClick={() => {
                onModuleChange?.(module.id);
                if (module.subPages.length === 1) {
                  onSubPageChange?.(module.subPages[0].href);
                }
              }}
              className={cn(
                'flex flex-col items-center justify-center p-2 transition-all duration-200 relative',
                activeModule === module.id
                  ? 'text-primary bg-primary/5'
                  : 'text-slate-500 hover:text-primary hover:bg-slate-50',
              )}
            >
              <div className="relative">{module.icon}</div>
              <span className="text-xs mt-1 font-medium leading-none">{module.name}</span>
              {activeModule === module.id && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </button>
          ))}

          {/* Menu button for all modules */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-primary hover:bg-slate-50 transition-all duration-200">
                <Menu className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium leading-none">Menü</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] p-0">
              <SheetHeader className="p-4 pb-2 border-b border-slate-100">
                <SheetTitle className="text-left">Navigasyon Menüsü</SheetTitle>
                <SheetDescription className="text-left text-sm text-slate-600">
                  Tüm modüllere ve alt sayfalara buradan erişebilirsiniz
                </SheetDescription>
              </SheetHeader>

              <div className="overflow-y-auto h-full pb-20">
                <div className="p-4 space-y-2">
                  {filteredModules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="space-y-2"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => {
                          handleModuleClick(module.id);
                        }}
                        className={cn(
                          'w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 group',
                          activeModule === module.id
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">{module.icon}</div>
                          <span className="font-medium">{module.name}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedModule === module.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </motion.div>
                      </button>

                      {/* Sub Pages */}
                      <AnimatePresence>
                        {expandedModule === module.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 space-y-1">
                              {module.subPages.map((subPage, subIndex) => (
                                <motion.button
                                  key={subPage.href}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: subIndex * 0.05 }}
                                  onClick={() => {
                                    handleSubPageClick(subPage.href, module.id);
                                  }}
                                  className="w-full text-left p-3 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 flex items-center gap-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  {subPage.name}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="md:hidden h-16" />
    </>
  );
}
