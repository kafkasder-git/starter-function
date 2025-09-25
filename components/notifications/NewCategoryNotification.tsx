/**
 * @fileoverview NewCategoryNotification Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { AlertCircle, CheckCircle, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface NewCategoryNotificationProps {
  onDismiss?: () => void;
}

/**
 * NewCategoryNotification function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function NewCategoryNotification({ onDismiss }: NewCategoryNotificationProps) {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('newCategoryNotificationDismissed') === 'true';
  });

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('newCategoryNotificationDismissed', 'true');
    onDismiss?.();
  };

  useEffect(() => {
    if (!dismissed) {
      // Show toast notification about new category
      toast.success('🎉 Yeni Kategori Eklendi!', {
        description: '"Bakmakla Yükümlü Olunan Kişi" kategorisi sisteme eklendi.',
        duration: 6000,
        // action: ... (removed or refactored to match allowed properties)
      });
    }
  }, [dismissed]);

  if (dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-purple-200 bg-purple-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-purple-900">Yeni Özellik</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-purple-600 hover:bg-purple-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-purple-800">
            İhtiyaç Sahipleri modülüne yeni kategori eklendi:
          </p>

          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Users className="w-3 h-3 mr-1" />
            Bakmakla Yükümlü Olunan Kişi
          </Badge>

          <div className="flex items-center gap-2 text-xs text-purple-700">
            <CheckCircle className="w-3 h-3" />
            <span>Form ve filtreleme seçeneklerinde mevcut</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-purple-700">
            <CheckCircle className="w-3 h-3" />
            <span>Detay sayfasında kategori seçeneği eklendi</span>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={handleDismiss}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Anladım
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NewCategoryNotification;
