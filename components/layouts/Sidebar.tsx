/**
 * @fileoverview Sidebar Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  BarChart3,
  Building2,
  Calendar,
  GraduationCap,
  Heart,
  HelpingHand,
  Home,
  MessageSquare,
  Scale,
  Shield,
  Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../ui/utils';
// Auth imports removed for simplified implementation
// Real notification badges will come from API

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  subPages: { name: string; href: string }[];
  badge?: number;
}

// Permission mapping removed - all modules accessible

// Static modules array removed - using dynamicModules only

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

/**
 * Sidebar function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function Sidebar({
  isMobileOpen = false,
  onMobileToggle,
}: SidebarProps) {
  // Auth removed for simplified implementation
  // Real notification badges will come from API
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [isPopoverHovered, setIsPopoverHovered] = useState(false);

  // Auth context for permission checks
  const { user } = useAuthStore();

  // Permission checks
  const canViewReports =
    user?.role === 'admin' ||
    user?.role === 'manager' ||
    user?.role === 'operator' ||
    user?.role === 'viewer';

  // Dynamic modules with notification badges - CLEANED UP
  const dynamicModules: Module[] = [
    {
      id: 'genel',
      name: 'Ana Sayfa',
      icon: <Home className="w-5 h-5" />,
      subPages: [{ name: 'Dashboard', href: '/dashboard' }],
      // badge removed - no unnecessary notifications
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
      // badge: 3 will come from API
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
      // badge: 2 will come from API
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
      ],
      // badge: 1 will come from API
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
    // Conditionally show reporting module based on permissions
    ...(canViewReports
      ? [
          {
            id: 'raporlama',
            name: 'Raporlama & Analitik',
            icon: <BarChart3 className="w-5 h-5" />,
            subPages: [
              { name: 'Ana Dashboard', href: '/raporlama/dashboard' },
              { name: 'Mali Raporlar', href: '/raporlama/mali' },
              { name: 'Bağış Analitiği', href: '/raporlama/bagis' },
              { name: 'Üye Analitiği', href: '/raporlama/uye' },
              { name: 'Sosyal Etki', href: '/raporlama/etki' },
              { name: 'Rapor Oluşturucu', href: '/raporlama/builder' },
              { name: 'Zamanlanmış Raporlar', href: '/raporlama/zamanli' },
            ],
          },
        ]
      : []),
  ];

  // Timing refs for better control
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverLeaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
      if (popoverLeaveTimeoutRef.current) clearTimeout(popoverLeaveTimeoutRef.current);
    };
  }, []);

  const handleModuleMouseEnter = (moduleId: string) => {
    // Clear any pending leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (popoverLeaveTimeoutRef.current) {
      clearTimeout(popoverLeaveTimeoutRef.current);
      popoverLeaveTimeoutRef.current = null;
    }

    setHoveredModule(moduleId);

    // Delay before opening popover for smoother experience
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenPopover(moduleId);
    }, 150); // Short delay to prevent accidental opens
  };

  const handleModuleMouseLeave = () => {
    // Clear hover timeout if mouse leaves before delay completes
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setHoveredModule(null);

    // Delay before closing to allow mouse to move to popover
    leaveTimeoutRef.current = setTimeout(() => {
      if (!isPopoverHovered) {
        setOpenPopover(null);
      }
    }, 100); // Quick delay to allow moving to popover
  };

  const handlePopoverMouseEnter = () => {
    // Clear any pending close timeout when entering popover
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (popoverLeaveTimeoutRef.current) {
      clearTimeout(popoverLeaveTimeoutRef.current);
      popoverLeaveTimeoutRef.current = null;
    }

    setIsPopoverHovered(true);
  };

  const handlePopoverMouseLeave = () => {
    setIsPopoverHovered(false);

    // Close popover after a short delay
    popoverLeaveTimeoutRef.current = setTimeout(() => {
      setOpenPopover(null);
    }, 150);
  };

  const handleModuleClick = (moduleId: string) => {
    // On click, immediately show popover and keep it open
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (popoverLeaveTimeoutRef.current) clearTimeout(popoverLeaveTimeoutRef.current);

    setOpenPopover(openPopover === moduleId ? null : moduleId);
    setHoveredModule(moduleId);
  };

  const handleSubPageClick = () => {
    // Close popover after selection
    setOpenPopover(null);
    setHoveredModule(null);
    setIsPopoverHovered(false);
    
    // Close mobile menu if open
    if (isMobileOpen) {
      onMobileToggle?.();
    }
  };
  
  // Get current location for active state
  const location = useLocation();
  const currentPath = location.pathname;

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const popoverElement = target.closest('[data-radix-popper-content-wrapper]');
      const triggerElement = target.closest('[data-sidebar-trigger]');

      if (!popoverElement && !triggerElement) {
        setOpenPopover(null);
        setHoveredModule(null);
        setIsPopoverHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <TooltipProvider delayDuration={500}>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
        hidden md:flex w-20 h-full bg-gray-900 border-r border-gray-800 flex-col
        ${isMobileOpen ? '!flex fixed inset-y-0 left-0 z-50 w-64' : ''}
      `}
      >
        {/* Navigation Icons */}
        <div className="flex-1 px-2 pt-6">
          <div className="space-y-2">
            {dynamicModules.map((module) => (
              <div
                key={module.id}
                className="relative"
                onMouseEnter={() => {
                  handleModuleMouseEnter(module.id);
                }}
                onMouseLeave={handleModuleMouseLeave}
              >
                <Popover
                  open={openPopover === module.id}
                  onOpenChange={(open: boolean) => {
                    if (!open) {
                      setOpenPopover(null);
                      setIsPopoverHovered(false);
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <div data-sidebar-trigger>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              handleModuleClick(module.id);
                            }}
                            className={cn(
                              'w-full flex items-center justify-center p-4 rounded-lg transition-all duration-200 group relative',
                              // Check if any subpage of this module is active
                              module.subPages.some(sp => currentPath === sp.href || currentPath.startsWith(sp.href + '/'))
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200',
                              hoveredModule === module.id &&
                                !module.subPages.some(sp => currentPath === sp.href || currentPath.startsWith(sp.href + '/')) &&
                                'bg-gray-800',
                            )}
                          >
                            <div className="flex-shrink-0 relative">
                              {module.icon}
                              {module.badge && (
                                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-blue-500 text-white text-xs flex items-center justify-center">
                                  {module.badge}
                                </Badge>
                              )}
                            </div>

                            {module.subPages.some(sp => currentPath === sp.href || currentPath.startsWith(sp.href + '/')) && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={8}
                          className="bg-gray-800 text-white border border-gray-700"
                        >
                          <p className="font-medium">{module.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </PopoverTrigger>

                  <PopoverContent
                    side="right"
                    align="start"
                    className="w-auto p-0 ml-3 border border-gray-200 bg-white animate-in slide-in-from-left-2 fade-in-0 duration-200"
                    sideOffset={8}
                    onMouseEnter={handlePopoverMouseEnter}
                    onMouseLeave={handlePopoverMouseLeave}
                    onInteractOutside={(e: Event) => {
                      // Prevent closing when clicking on trigger
                      const target = e.target as Element;
                      const isTrigger = target.closest('[data-sidebar-trigger]');
                      if (isTrigger) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div className="min-w-[220px] overflow-hidden rounded-lg">
                      {/* Header */}
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          {module.icon}
                          {module.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {module.subPages.length} seçenek
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2 space-y-1">
                        {module.subPages.map((subPage, index) => {
                          const isActive = currentPath === subPage.href || currentPath.startsWith(subPage.href + '/');
                          return (
                            <Link
                              key={subPage.href}
                              to={subPage.href}
                              onClick={handleSubPageClick}
                              className={cn(
                                'w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 group flex items-center justify-between animate-in fade-in-0 slide-in-from-left-1 animate-fill-both',
                                isActive 
                                  ? 'bg-gray-200 text-gray-900 font-semibold' 
                                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
                                index === 0 ? 'animate-delay-0' :
                                index === 1 ? 'animate-delay-50' :
                                index === 2 ? 'animate-delay-100' :
                                index === 3 ? 'animate-delay-150' :
                                index === 4 ? 'animate-delay-200' :
                                index === 5 ? 'animate-delay-250' :
                                index === 6 ? 'animate-delay-300' :
                                index === 7 ? 'animate-delay-350' :
                                index === 8 ? 'animate-delay-400' :
                                index === 9 ? 'animate-delay-450' :
                                'animate-delay-500'
                              )}
                            >
                              <span className="font-medium">{subPage.name}</span>
                              <div className={cn(
                                'w-1.5 h-1.5 rounded-full transition-all duration-200 transform',
                                isActive 
                                  ? 'bg-gray-900 opacity-100 scale-110' 
                                  : 'bg-gray-400 opacity-0 group-hover:opacity-100 group-hover:scale-110'
                              )} />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
