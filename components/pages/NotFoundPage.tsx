/**
 * @fileoverview NotFoundPage - 404 Error Page
 * @description Page displayed when route is not found
 * @version 1.0.0
 */

import { Home, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

/**
 * NotFoundPage Component
 * Displays a user-friendly 404 error page
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 md:p-12 text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-gray-200 select-none">
              404
            </div>
            <div className="mt-4 flex justify-center">
              <Search className="w-16 h-16 text-gray-400 animate-pulse" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Sayfa Bulunamadı
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir. 
            Lütfen URL'yi kontrol edin veya ana sayfaya dönün.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
            
            <Link to="/">
              <Button className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Ana Sayfaya Git
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Hızlı Erişim:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link to="/yardim">
                <Button variant="ghost" size="sm">
                  Yardım Yönetimi
                </Button>
              </Link>
              <Link to="/bagis">
                <Button variant="ghost" size="sm">
                  Bağışlar
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  Ayarlar
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NotFoundPage;