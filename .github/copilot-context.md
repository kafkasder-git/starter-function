# GitHub Copilot Bağlam Dosyaları

## Kafkasder Yönetim Paneli - Geliştirme Bağlamı

Bu doküman, GitHub Copilot'a projenizin mimarisi ve standartları hakkında
kapsamlı bağlam sağlar.

## 🏗️ **Proje Mimarisi**

### **Temel Yapı**

```
kafkasder-management-panel/
├── components/          # React bileşenleri
│   ├── ui/             # Temel UI bileşenleri
│   ├── pages/          # Sayfa bileşenleri
│   ├── forms/          # Form bileşenleri
│   └── [feature]/      # Özellik bazlı bileşenler
├── services/           # İş mantığı katmanı
├── hooks/              # Custom React hook'ları
├── stores/             # Zustand state yönetimi
├── types/              # TypeScript tip tanımları
├── lib/                # Yardımcı kütüphaneler
└── contexts/           # React context'leri
```

### **Veri Akışı Deseni**

```
Service Layer → Hook Layer → Component Layer
     ↓              ↓              ↓
Supabase API → use[Entity] → UI Components
```

## 🔧 **Teknoloji Stack'i**

### **Frontend**

- **React 18.3.1** - UI framework
- **TypeScript 5.9.2** - Tip güvenliği
- **Vite 6.3.5** - Build tool
- **Tailwind CSS 4.0.0** - Styling
- **Radix UI** - Component library
- **Zustand 5.0.3** - State management

### **Backend & Database**

- **Supabase 2.57.4** - Backend as a Service
- **PostgreSQL** - Veritabanı
- **Row Level Security (RLS)** - Güvenlik

### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Testing framework
- **Playwright** - E2E testing
- **Sentry** - Error monitoring

## 📋 **Kod Standartları**

### **TypeScript Kuralları**

```typescript
// ✅ DOĞRU: Interface tanımları
interface Member {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// ✅ DOĞRU: Type exports
export type { Member, MemberInsert, MemberUpdate };

// ✅ DOĞRU: Generic types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
```

### **Import Kuralları**

```typescript
// ✅ DOĞRU: Path kısayolları kullan
import { membersService } from '@/services/membersService';
import { useMembers } from '@/hooks/useMembers';
import { useUIStore } from '@/stores/uiStore';

// ❌ YANLIŞ: Relative paths
import { membersService } from '../../../services/membersService';
```

### **Naming Conventions**

```typescript
// ✅ DOĞRU: PascalCase for components
export const MemberList: React.FC<MemberListProps> = () => {};

// ✅ DOĞRU: camelCase for functions
const getMemberById = (id: string) => {};

// ✅ DOĞRU: camelCase for variables
const memberData = await membersService.getById(id);

// ✅ DOĞRU: UPPER_CASE for constants
const API_ENDPOINTS = {
  MEMBERS: '/api/members',
  DONATIONS: '/api/donations',
};
```

## 🏛️ **Mimari Desenler**

### **Service Layer Pattern**

```typescript
// ✅ DOĞRU: Service katmanı kullanımı
export class MembersService extends BaseService<
  Member,
  MemberInsert,
  MemberUpdate
> {
  async getActiveMembers(): Promise<ApiResponse<Member[]>> {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null, success: true };
    } catch (error) {
      return { data: null, error: error.message, success: false };
    }
  }
}
```

### **Hook Pattern**

```typescript
// ✅ DOĞRU: Custom hook kullanımı
export function useMembers(options: UseMembersOptions = {}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await membersService.getAll();
      if (response.success) {
        setMembers(response.data || []);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { members, loading, error, fetchMembers };
}
```

### **Component Pattern**

```typescript
// ✅ DOĞRU: Component yapısı
interface MemberListProps {
  onMemberSelect?: (member: Member) => void;
  showActions?: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({
  onMemberSelect,
  showActions = true
}) => {
  const { members, loading, error } = useMembers();
  const { theme } = useUIStore();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="member-list">
      {members.map(member => (
        <MemberCard
          key={member.id}
          member={member}
          onClick={() => onMemberSelect?.(member)}
          showActions={showActions}
        />
      ))}
    </div>
  );
};
```

## 🔐 **Güvenlik Standartları**

### **Input Validation**

```typescript
// ✅ DOĞRU: Input sanitization
import { sanitizeInput } from '@/utils/sanitization';
import { validateEmail } from '@/lib/validation';

const handleSubmit = (data: FormData) => {
  const sanitizedData = {
    name: sanitizeInput(data.name),
    email: validateEmail(data.email) ? data.email : null,
    phone: sanitizeInput(data.phone),
  };

  // Process sanitized data
};
```

### **Authentication**

```typescript
// ✅ DOĞRU: Auth context kullanımı
const { user, isAuthenticated, signOut } = useSupabaseAuth();

if (!isAuthenticated) {
  return <LoginPage />;
}
```

### **Error Handling**

```typescript
// ✅ DOĞRU: Hata yönetimi
try {
  const result = await membersService.create(memberData);
  if (!result.success) {
    throw new Error(result.error);
  }
  toast.success('Üye başarıyla eklendi');
} catch (error) {
  logger.error('Member creation failed:', error);
  toast.error('Üye eklenirken hata oluştu');
}
```

## 🎨 **UI/UX Standartları**

### **Türkçe Dil Desteği**

```typescript
// ✅ DOĞRU: Türkçe UI metinleri
const messages = {
  loading: 'Yükleniyor...',
  error: 'Bir hata oluştu',
  success: 'İşlem başarılı',
  confirm: 'Emin misiniz?',
  cancel: 'İptal',
  save: 'Kaydet',
};
```

### **Responsive Design**

```typescript
// ✅ DOĞRU: Responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} className="p-4">
      <CardContent>{item.content}</CardContent>
    </Card>
  ))}
</div>
```

### **Accessibility**

```typescript
// ✅ DOĞRU: Accessibility attributes
<button
  onClick={handleClick}
  aria-label="Üyeyi düzenle"
  aria-describedby="member-description"
  className="btn btn-primary"
>
  Düzenle
</button>
```

## 📊 **State Management**

### **Zustand Store Kullanımı**

```typescript
// ✅ DOĞRU: UI state için Zustand
const { sidebarCollapsed, toggleSidebar } = useUIStore();

// ✅ DOĞRU: Auth state için Context
const { user, isAuthenticated } = useSupabaseAuth();

// ✅ DOĞRU: Local state için useState
const [localData, setLocalData] = useState<LocalData[]>([]);
```

### **State Update Patterns**

```typescript
// ✅ DOĞRU: Immutable updates
setMembers((prev) => [...prev, newMember]);

// ✅ DOĞRU: Zustand updates
set((state) => {
  state.members.push(newMember);
});
```

## 🧪 **Testing Standartları**

### **Unit Tests**

```typescript
// ✅ DOĞRU: Test yapısı
describe('MembersService', () => {
  it('should fetch all members successfully', async () => {
    const mockData = [{ id: 1, name: 'Test User' }];
    vi.mock('@/lib/supabase').mockResolvedValue({
      data: mockData,
      error: null,
    });

    const result = await membersService.getAll();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
  });
});
```

### **Component Tests**

```typescript
// ✅ DOĞRU: Component test
describe('MemberList', () => {
  it('should render members list', () => {
    const mockMembers = [{ id: 1, name: 'Test User' }];
    vi.mock('@/hooks/useMembers').mockReturnValue({
      members: mockMembers,
      loading: false,
      error: null
    });

    render(<MemberList />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
```

## 🤖 **AI Entegrasyonu**

### **useAI Hook Kullanımı**

```typescript
// ✅ DOĞRU: AI hook kullanımı
const { generateText, isLoading, error } = useAI();

const handleAIAnalysis = async () => {
  try {
    const response = await generateText(
      `Bu veri için Türkçe analiz yap: ${JSON.stringify(data)}`,
    );
    setAnalysisResult(response.content);
  } catch (error) {
    toast.error('AI analizi başarısız');
  }
};
```

## 📱 **Mobil Optimizasyon**

### **Responsive Hooks**

```typescript
// ✅ DOĞRU: Mobil hook kullanımı
const { isMobile, isTablet } = useTouchDevice();
const { optimizeForMobile } = useMobilePerformance();

useEffect(() => {
  if (isMobile) {
    optimizeForMobile();
  }
}, [isMobile, optimizeForMobile]);
```

## 🔍 **Performance Optimizasyonu**

### **Memoization**

```typescript
// ✅ DOĞRU: Memoization kullanımı
const MemoizedComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);

  return <div>{processedData}</div>;
});
```

### **Lazy Loading**

```typescript
// ✅ DOĞRU: Lazy loading
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyComponent />
  </Suspense>
);
```

## 🚫 **Yasaklı Desenler**

### **❌ Doğrudan Supabase Kullanımı**

```typescript
// ❌ YANLIŞ: Component'te doğrudan Supabase
const { data } = await supabase.from('members').select('*');

// ✅ DOĞRU: Service katmanı üzerinden
const { data } = await membersService.getAll();
```

### **❌ Mock Data Kullanımı**

```typescript
// ❌ YANLIŞ: Mock data
const mockMembers = [{ id: 1, name: 'Test' }];

// ✅ DOĞRU: Gerçek veri
const { members } = useMembers();
```

### **❌ Console.log Kullanımı**

```typescript
// ❌ YANLIŞ: Console.log
console.log('Debug:', data);

// ✅ DOĞRU: Logger kullanımı
import { logger } from '@/lib/logging/logger';
logger.debug('Debug:', data);
```

## 📝 **Dokümantasyon Standartları**

### **JSDoc Comments**

```typescript
/**
 * Üye bilgilerini getirir
 * @param id - Üye ID'si
 * @param includeDeleted - Silinmiş üyeleri dahil et
 * @returns Promise<ApiResponse<Member>>
 */
async getMemberById(id: string, includeDeleted = false): Promise<ApiResponse<Member>> {
  // Implementation
}
```

### **README Updates**

````markdown
## Yeni Özellik: [Özellik Adı]

### Açıklama

[Özellik açıklaması]

### Kullanım

```typescript
import { useNewFeature } from '@/hooks/useNewFeature';

const { data, loading } = useNewFeature();
```
````

### API

- `useNewFeature()` - Hook kullanımı
- `newFeatureService.create()` - Servis metodu

```

---

## 🎯 **Copilot İçin Önemli Notlar**

1. **Her zaman mevcut mimariyi takip edin**
2. **Service → Hook → Component akışını koruyun**
3. **TypeScript tiplerini kullanın**
4. **Türkçe UI metinleri yazın**
5. **Hata yönetimi ekleyin**
6. **Güvenlik kontrollerini yapın**
7. **Test yazın**
8. **Performance'ı optimize edin**
9. **Accessibility'yi unutmayın**
10. **Dokümantasyonu güncelleyin**

Bu bağlam dosyası, GitHub Copilot'ın projenizin standartlarına uygun kod üretmesini sağlar.
```
