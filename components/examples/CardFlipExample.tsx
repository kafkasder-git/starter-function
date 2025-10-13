import { useState } from 'react';
import { CardFlip, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

export default function CardFlipExample() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const cardVariants = [
    {
      id: 'mvp',
      title: 'MVP Geliştirme',
      subtitle: 'Hızlı prototip oluşturun',
      description: 'Fikirlerinizi hızla hayata geçirin. Copy-paste hazır componentlerle MVP&apos;nizi günler içinde tamamlayın.',
      features: [
        'Hazır Componentler',
        'Geliştirici Dostu',
        'MVP Optimizasyonu',
        'Sıfır Kurulum',
      ],
    },
    {
      id: 'ngo',
      title: 'Dernek Yönetimi',
      subtitle: 'Kapsamlı yönetim sistemi',
      description: 'Kar amacı gütmeyen kuruluşlar için özel olarak tasarlanmış modern yönetim platformu.',
      features: [
        'Yardım Yönetimi',
        'Bağış Takibi',
        'Kullanıcı Yönetimi',
        'Raporlama',
      ],
    },
    {
      id: 'dashboard',
      title: 'Dashboard Analytics',
      subtitle: 'Veri görselleştirme',
      description: 'Gerçek zamanlı veri analizi ve görselleştirme ile kararlarınızı destekleyin.',
      features: [
        'Gerçek Zamanlı Veri',
        'Görsel Raporlar',
        'Performans Metrikleri',
        'Özelleştirilebilir',
      ],
    },
    {
      id: 'mobile',
      title: 'Mobil Uyumlu',
      subtitle: 'Her cihazda mükemmel',
      description: 'Responsive tasarım ile masaüstü, tablet ve mobil cihazlarda kusursuz deneyim.',
      features: [
        'Responsive Tasarım',
        'Touch Optimized',
        'Offline Support',
        'PWA Ready',
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          CardFlip Component Örnekleri
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Farklı kullanım senaryoları ile CardFlip component&apos;inin esnekliğini keşfedin.
          Hover yaparak kartların 3D flip animasyonunu deneyimleyin.
        </p>
      </div>

      {/* Status */}
      {activeCard && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              Aktif Kart: {cardVariants.find(c => c.id === activeCard)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              CardFlip component&apos;inin onFlip callback fonksiyonu ile gerçek zamanlı durum takibi.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardVariants.map((variant) => (
          <div key={variant.id} className="flex justify-center">
            <CardFlip
              title={variant.title}
              subtitle={variant.subtitle}
              description={variant.description}
              features={variant.features}
              onFlip={(isFlipped) => {
                setActiveCard(isFlipped ? variant.id : null);
              }}
            />
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
          Component Özellikleri
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: '3D Animasyon',
              description: 'CSS 3D transform ile gerçekçi flip animasyonu',
              badge: 'Core Feature',
            },
            {
              title: 'Hover Etkileşimi',
              description: 'Mouse hover ile otomatik flip tetikleme',
              badge: 'UX',
            },
            {
              title: 'Dark Mode',
              description: 'Otomatik dark/light theme desteği',
              badge: 'Accessibility',
            },
            {
              title: 'Özelleştirilebilir',
              description: 'Props ile tam özelleştirme imkanı',
              badge: 'Flexibility',
            },
            {
              title: 'TypeScript',
              description: 'Tam tip güvenliği ve IntelliSense desteği',
              badge: 'Developer Experience',
            },
            {
              title: 'Responsive',
              description: 'Tüm ekran boyutlarında mükemmel görünüm',
              badge: 'Mobile First',
            },
          ].map((feature, index) => (
            <Card key={index} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage Code Example */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Kullanım Örneği</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`import { CardFlip } from '@/components/ui';

export default function MyComponent() {
  return (
    <CardFlip
      title="Dernek Yönetimi"
      subtitle="Kapsamlı yönetim sistemi"
      description="Kar amacı gütmeyen kuruluşlar için özel olarak tasarlanmış modern yönetim platformu."
      features={[
        'Yardım Yönetimi',
        'Bağış Takibi', 
        'Kullanıcı Yönetimi',
        'Raporlama'
      ]}
      onFlip={(isFlipped) => {
        console.log('Card flipped:', isFlipped);
      }}
    />
  );
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
