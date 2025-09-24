import { Bot, Lightbulb, MessageSquare, Zap } from 'lucide-react';
import { PageLayout } from '../PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function AIAssistantPage() {
  return (
    <PageLayout title="AI Asistan" subtitle="Tüm modüllerle çalışabilen akıllı asistan sistemi">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI Asistan Sistemi
            </CardTitle>
            <CardDescription>Cursor AI ile optimize edilmiş akıllı asistan sistemi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <MessageSquare className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-medium mb-1">Akıllı Sohbet</h3>
                <p className="text-sm text-gray-600">Doğal dil ile sistem kontrolü</p>
              </div>

              <div className="p-4 border rounded-lg">
                <Lightbulb className="w-8 h-8 text-yellow-500 mb-2" />
                <h3 className="font-medium mb-1">Öneriler</h3>
                <p className="text-sm text-gray-600">Akıllı süreç önerileri</p>
              </div>

              <div className="p-4 border rounded-lg">
                <Zap className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="font-medium mb-1">Otomatik İşlemler</h3>
                <p className="text-sm text-gray-600">Rutin görevlerin otomasyonu</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Cursor AI Integration:</strong> Bu sistem Cursor AI ile tam entegre
                çalışmaktadır. Ctrl/Cmd + K ile AI Chat'i açarak tüm özelliklerden
                yararlanabilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
