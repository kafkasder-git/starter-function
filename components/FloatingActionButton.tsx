/**
 * @fileoverview FloatingActionButton Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { Plus, X, UserPlus, Heart, CreditCard, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface FloatingActionButtonProps {
  activeModule?: string;
  onQuickAction?: (actionId: string) => void;
}

/**
 * FloatingActionButton function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function FloatingActionButton({
  activeModule = 'genel',
  onQuickAction,
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Quick actions based on active module
  const getQuickActions = (): QuickAction[] => {
    switch (activeModule) {
      case 'yardim':
        return [
          {
            id: 'new-beneficiary',
            label: 'Yeni İhtiyaç Sahibi',
            icon: <UserPlus className="w-5 h-5" />,
            color: 'bg-blue-500 hover:bg-blue-600',
            action: () => {
              toast.success('Yeni ihtiyaç sahibi formu açılıyor...');
              onQuickAction?.('new-beneficiary');
            },
          },
          {
            id: 'new-aid-application',
            label: 'Yardım Başvurusu',
            icon: <Heart className="w-5 h-5" />,
            color: 'bg-red-500 hover:bg-red-600',
            action: () => {
              toast.success('Yeni yardım başvurusu formu açılıyor...');
              onQuickAction?.('new-aid-application');
            },
          },
          {
            id: 'quick-aid',
            label: 'Hızlı Yardım',
            icon: <FileText className="w-5 h-5" />,
            color: 'bg-green-500 hover:bg-green-600',
            action: () => {
              toast.success('Hızlı yardım formu açılıyor...');
              onQuickAction?.('quick-aid');
            },
          },
        ];
      case 'bagis':
        return [
          {
            id: 'new-donation',
            label: 'Yeni Bağış',
            icon: <CreditCard className="w-5 h-5" />,
            color: 'bg-green-500 hover:bg-green-600',
            action: () => {
              toast.success('Yeni bağış formu açılıyor...');
              onQuickAction?.('new-donation');
            },
          },
          {
            id: 'new-donor',
            label: 'Yeni Bağışçı',
            icon: <UserPlus className="w-5 h-5" />,
            color: 'bg-blue-500 hover:bg-blue-600',
            action: () => {
              toast.success('Yeni bağışçı formu açılıyor...');
              onQuickAction?.('new-donor');
            },
          },
        ];
      case 'uye':
        return [
          {
            id: 'new-member',
            label: 'Yeni Üye',
            icon: <UserPlus className="w-5 h-5" />,
            color: 'bg-purple-500 hover:bg-purple-600',
            action: () => {
              toast.success('Yeni üye formu açılıyor...');
              onQuickAction?.('new-member');
            },
          },
        ];
      default:
        return [
          {
            id: 'quick-entry',
            label: 'Hızlı Kayıt',
            icon: <FileText className="w-5 h-5" />,
            color: 'bg-primary hover:bg-primary/90',
            action: () => {
              toast.success('Hızlı kayıt menüsü açılıyor...');
              onQuickAction?.('quick-entry');
            },
          },
        ];
    }
  };

  const quickActions = getQuickActions();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30">
      <div className="relative">
        {/* Quick Action Buttons */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: 20, x: 20 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                  }}
                  className="flex items-center gap-3"
                >
                  {/* Action Label */}
                  <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg whitespace-nowrap">
                    {action.label}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => {
                      action.action();
                      setIsExpanded(false);
                    }}
                    className={cn(
                      'w-12 h-12 rounded-full shadow-lg text-white transition-all duration-200',
                      action.color,
                    )}
                    size="sm"
                  >
                    {action.icon}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={toggleExpanded}
            className={cn(
              'w-14 h-14 rounded-full shadow-xl transition-all duration-300',
              isExpanded
                ? 'bg-gray-600 hover:bg-gray-700 rotate-45'
                : 'bg-primary hover:bg-primary/90',
            )}
            size="sm"
          >
            <motion.div animate={{ rotate: isExpanded ? 45 : 0 }} transition={{ duration: 0.2 }}>
              {isExpanded ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
