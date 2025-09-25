import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Square,
  Trash2,
  Mail,
  Download,
  Archive,
  Tag,
  AlertCircle,
  X,
  Settings,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useAdvancedMobile } from '../../hooks/useAdvancedMobile';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: 'default' | 'destructive' | 'secondary';
  requiresConfirmation: boolean;
  requiresInput?: boolean;
  inputType?: 'text' | 'select' | 'textarea';
  inputOptions?: { value: string; label: string }[];
  inputPlaceholder?: string;
}

interface BulkOperationsPanelProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkAction: (actionId: string, selectedIds: string[], inputValue?: any) => Promise<void>;
  actions: BulkAction[];
  entityName: string; // "üye", "bağış", "yardım talebi" etc.
  className?: string;
}

const defaultActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'Sil',
    icon: <Trash2 className="w-4 h-4" />,
    color: 'destructive',
    requiresConfirmation: true,
  },
  {
    id: 'archive',
    label: 'Arşivle',
    icon: <Archive className="w-4 h-4" />,
    color: 'secondary',
    requiresConfirmation: true,
  },
  {
    id: 'export',
    label: 'Dışa Aktar',
    icon: <Download className="w-4 h-4" />,
    color: 'default',
    requiresConfirmation: false,
  },
  {
    id: 'tag',
    label: 'Etiketle',
    icon: <Tag className="w-4 h-4" />,
    color: 'default',
    requiresConfirmation: false,
    requiresInput: true,
    inputType: 'select',
    inputOptions: [
      { value: 'urgent', label: 'Acil' },
      { value: 'high', label: 'Yüksek Öncelik' },
      { value: 'normal', label: 'Normal' },
      { value: 'low', label: 'Düşük Öncelik' },
    ],
    inputPlaceholder: 'Etiket seçin',
  },
  {
    id: 'email',
    label: 'E-posta Gönder',
    icon: <Mail className="w-4 h-4" />,
    color: 'default',
    requiresConfirmation: false,
    requiresInput: true,
    inputType: 'textarea',
    inputPlaceholder: 'E-posta mesajını yazın...',
  },
];

export function BulkOperationsPanel({
  selectedItems,
  totalItems,
  onSelectAll,
  onDeselectAll,
  onBulkAction,
  actions = defaultActions,
  entityName,
  className = '',
}: BulkOperationsPanelProps) {
  const [showConfirmation, setShowConfirmation] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<any>('');
  const [isExecuting, setIsExecuting] = useState(false);

  const { deviceInfo, triggerHapticFeedback } = useAdvancedMobile();

  const isAllSelected = selectedItems.length === totalItems && totalItems > 0;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < totalItems;

  const handleSelectToggle = () => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }

    if (deviceInfo.isMobile) {
      triggerHapticFeedback('light');
    }
  };

  const handleAction = async (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    if (!action) return;

    if (action.requiresInput) {
      setShowConfirmation(actionId);
      return;
    }

    if (action.requiresConfirmation) {
      setShowConfirmation(actionId);
      return;
    }

    await executeAction(actionId);
  };

  const executeAction = async (actionId: string, value?: any) => {
    try {
      setIsExecuting(true);
      await onBulkAction(actionId, selectedItems, value);
      setShowConfirmation(null);
      setInputValue('');

      if (deviceInfo.isMobile) {
        triggerHapticFeedback('success');
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      if (deviceInfo.isMobile) {
        triggerHapticFeedback('error');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const renderActionButton = (action: BulkAction) => (
    <Button
      key={action.id}
      variant={action.color}
      size="sm"
      onClick={() => handleAction(action.id)}
      disabled={selectedItems.length === 0 || isExecuting}
      className="gap-2 min-w-0 flex-shrink-0"
    >
      {action.icon}
      <span className="hidden sm:inline">{action.label}</span>
    </Button>
  );

  const renderConfirmationDialog = () => {
    if (!showConfirmation) return null;

    const action = actions.find((a) => a.id === showConfirmation);
    if (!action) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={() => {
          setShowConfirmation(null);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            {action.color === 'destructive' ? (
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            ) : (
              <div className="p-2 bg-blue-100 rounded-lg">{action.icon}</div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900">
                {action.label} - {selectedItems.length} {entityName}
              </h3>
              <p className="text-sm text-gray-600">Bu işlem geri alınamaz olabilir.</p>
            </div>
          </div>

          {action.requiresInput && (
            <div className="mb-4">
              {action.inputType === 'select' ? (
                <Select value={inputValue} onValueChange={setInputValue}>
                  <SelectTrigger>
                    <SelectValue placeholder={action.inputPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {action.inputOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : action.inputType === 'textarea' ? (
                <Textarea
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                  placeholder={action.inputPlaceholder}
                  rows={4}
                />
              ) : (
                <Input
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                  placeholder={action.inputPlaceholder}
                />
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(null);
                setInputValue('');
              }}
              disabled={isExecuting}
            >
              İptal
            </Button>
            <Button
              variant={action.color}
              onClick={() => executeAction(showConfirmation, inputValue)}
              disabled={isExecuting || (action.requiresInput && !inputValue)}
              className="gap-2"
            >
              {isExecuting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                action.icon
              )}
              {isExecuting ? 'İşleniyor...' : action.label}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`sticky top-0 z-40 ${className}`}
      >
        <Card className="shadow-lg border-0 bg-blue-50/90 backdrop-blur-sm border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Selection Info */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectToggle}
                  className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors"
                >
                  <div className="relative">
                    {isAllSelected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : isPartiallySelected ? (
                      <div className="w-5 h-5 border-2 border-current rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-current rounded-sm" />
                      </div>
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </div>
                </button>

                <div className="text-sm">
                  <span className="font-semibold text-blue-900">
                    {selectedItems.length} {entityName} seçildi
                  </span>
                  {totalItems > 0 && <span className="text-blue-700 ml-2">/ {totalItems}</span>}
                </div>

                {isPartiallySelected && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSelectAll}
                    className="text-blue-700 hover:text-blue-800 hover:bg-blue-100 h-7 px-2 text-xs"
                  >
                    Tümünü Seç
                  </Button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {actions.slice(0, deviceInfo.isMobile ? 3 : actions.length).map(renderActionButton)}

                {deviceInfo.isMobile && actions.length > 3 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="px-2">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="end">
                      <div className="space-y-1">
                        {actions.slice(3).map((action) => (
                          <Button
                            key={action.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(action.id)}
                            disabled={selectedItems.length === 0 || isExecuting}
                            className="w-full justify-start gap-2"
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                <Separator orientation="vertical" className="h-6" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeselectAll}
                  className="text-gray-600 hover:text-gray-800 px-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence>{renderConfirmationDialog()}</AnimatePresence>
    </>
  );
}

export default BulkOperationsPanel;
