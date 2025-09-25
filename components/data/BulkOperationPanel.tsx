/**
 * @fileoverview BulkOperationPanel Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Trash2,
  Edit3,
  Download,
  Upload,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import { useIsMobile } from '../../hooks/useTouchDevice';
import { cn } from '../ui/utils';
import type { BulkOperation } from '../../types/data';

interface BulkOperationPanelProps {
  className?: string;
  maxHeight?: string;
  showCompleted?: boolean;
  autoHide?: boolean;
}

/**
 * BulkOperationPanel function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function BulkOperationPanel({
  className,
  maxHeight = '400px',
  showCompleted = true,
  autoHide = false,
}: BulkOperationPanelProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!autoHide);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  const {
    activeOperations,
    cancelOperation,
    getAllOperations,
    getActiveOperations,
    clearCompletedOperations,
    getOperationStats,
  } = useBulkOperations();

  const stats = getOperationStats();
  const visibleOperations = showCompleted ? getAllOperations() : getActiveOperations();
  const hasActiveOperations = stats.running > 0 ?? stats.pending > 0;

  // Auto-hide when no active operations
  if (autoHide && !hasActiveOperations && visibleOperations.length === 0) {
    return null;
  }

  // Get operation icon
  const getOperationIcon = (operation: BulkOperation) => {
    switch (operation.type) {
      case 'update':
        return <Edit3 className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'export':
        return <Download className="w-4 h-4" />;
      case 'import':
        return <Upload className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  // Get operation status color
  const getStatusColor = (status: BulkOperation['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'running':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'cancelled':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get operation status text
  const getStatusText = (status: BulkOperation['status']) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'running':
        return 'Çalışıyor';
      case 'completed':
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  // Get operation type text
  const getTypeText = (type: BulkOperation['type']) => {
    switch (type) {
      case 'update':
        return 'Toplu Güncelleme';
      case 'delete':
        return 'Toplu Silme';
      case 'export':
        return 'Dışa Aktarma';
      case 'import':
        return 'İçe Aktarma';
      default:
        return type;
    }
  };

  // Format duration
  const formatDuration = (operation: BulkOperation) => {
    const start = operation.startTime;
    const end = operation.endTime ?? new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);

    if (duration < 60) {
      return `${duration}s`;
    } else if (duration < 3600) {
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    } 
      return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
    
  };

  // Render operation item
  const renderOperationItem = (operation: BulkOperation) => {
    const isSelected = selectedOperation === operation.id;
    const canCancel = operation.status === 'pending' || operation.status === 'running';

    return (
      <motion.div
        key={operation.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <Collapsible
          open={isSelected}
          onOpenChange={(open) => {
            setSelectedOperation(open ? operation.id : null);
          }}
        >
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getOperationIcon(operation)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 truncate">
                        {getTypeText(operation.type)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getStatusColor(operation.status))}
                      >
                        {getStatusText(operation.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{operation.totalItems} öğe</span>
                      {operation.status === 'running' && <span>{operation.progress}%</span>}
                      {operation.endTime && <span>{formatDuration(operation)}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelOperation(operation.id);
                      }}
                      className="w-8 h-8 p-0 text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}

                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-gray-400 transition-transform',
                      isSelected && 'rotate-180',
                    )}
                  />
                </div>
              </div>

              {/* Progress bar for running operations */}
              {operation.status === 'running' && (
                <div className="mt-3">
                  <Progress value={operation.progress} className="h-1.5" />
                </div>
              )}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 bg-gray-50/50">
              {/* Operation details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">İşlenen</span>
                  <div className="font-medium">{operation.processedItems}</div>
                </div>
                <div>
                  <span className="text-gray-500">Başarılı</span>
                  <div className="font-medium text-green-600">{operation.successItems}</div>
                </div>
                <div>
                  <span className="text-gray-500">Hatalı</span>
                  <div className="font-medium text-red-600">{operation.errorItems}</div>
                </div>
                <div>
                  <span className="text-gray-500">Başlangıç</span>
                  <div className="font-medium">
                    {operation.startTime.toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              </div>

              {/* Errors */}
              {operation.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                    <AlertCircle className="w-4 h-4" />
                    <span>Hatalar ({operation.errors.length})</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    <div className="space-y-1">
                      {operation.errors.slice(0, 5).map((error, index) => (
                        <div
                          key={index}
                          className="text-xs bg-red-50 border border-red-200 rounded p-2"
                        >
                          <div className="font-medium text-red-800">ID: {error.itemId}</div>
                          <div className="text-red-700">{error.message}</div>
                        </div>
                      ))}
                      {operation.errors.length > 5 && (
                        <div className="text-xs text-gray-500 italic">
                          ve {operation.errors.length - 5} hata daha...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>
    );
  };

  return (
    <Card className={cn('bg-white shadow-lg border-gray-200', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Toplu İşlemler
            </CardTitle>
            <CardDescription>
              {hasActiveOperations
                ? `${stats.running} çalışıyor, ${stats.pending} bekliyor`
                : 'Aktif işlem bulunmuyor'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats */}
            {visibleOperations.length > 0 && (
              <div className="flex items-center gap-1">
                {stats.running > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {stats.running}
                  </Badge>
                )}
                {stats.completed > 0 && showCompleted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {stats.completed}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearCompletedOperations}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Tamamlananları Temizle
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Daralt
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Genişlet
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              {visibleOperations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Henüz toplu işlem yok</p>
                </div>
              ) : (
                <ScrollArea className={maxHeight ? `max-h-[${maxHeight}]` : ''}>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {visibleOperations.map((operation) => renderOperationItem(operation))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
