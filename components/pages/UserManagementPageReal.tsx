// 👥 REAL USER MANAGEMENT PAGE
// Enhanced user management with real Supabase integration

import {
  Activity,
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  Edit,
  Key,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import type { ControllerRenderProps } from 'react-hook-form';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useDebounce } from '../../hooks/useDebounce';
// import { useMobileForm } from '../../hooks/useMobileForm'; // Unused for now
import useUserManagement from '../../hooks/useUserManagement';
import type { ManagedUser } from '../../services/userManagementService';
import { useAuthStore } from '../../stores/authStore';
import { Permission, UserRole } from '../../types/auth';

// Form validation schemas
const createUserSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz').min(1, 'Email adresi zorunludur'),
  name: z
    .string()
    .trim()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(100, 'Ad en fazla 100 karakter olabilir')
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, 'Ad sadece harf ve boşluk içerebilir'),
  role: z.nativeEnum(UserRole),
  phone: z
    .string()
    .regex(/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası giriniz')
    .optional()
    .or(z.literal('')),
  department: z.string().optional(),
  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional(),
  sendInvitation: z.boolean().default(true),
}) satisfies z.ZodType<{
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
  notes?: string;
  sendInvitation: boolean;
}>;

const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true, sendInvitation: true })
  .extend({
    status: z.enum(['active', 'inactive', 'suspended'] as const).optional(),
  }) satisfies z.ZodType<{
  name?: string;
  role?: UserRole;
  phone?: string;
  department?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'suspended';
}>;

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// Role and status configurations
const ROLES = {
  [UserRole.ADMIN]: { label: 'Yönetici', color: 'bg-red-100 text-red-800 border-red-200' },
  [UserRole.MANAGER]: { label: 'Müdür', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  [UserRole.OPERATOR]: { label: 'Operatör', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  [UserRole.VIEWER]: { label: 'Görüntüleyici', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const STATUS_CONFIG = {
  active: {
    label: 'Aktif',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle,
  },
  inactive: { label: 'Pasif', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
  pending: {
    label: 'Beklemede',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock,
  },
  suspended: { label: 'Askıda', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const DEPARTMENTS = [
  'Yönetim',
  'Finans',
  'Yardım Koordinasyonu',
  'Üye İşleri',
  'Halkla İlişkiler',
  'Teknoloji',
  'Hukuk',
  'Muhasebe',
] as const;

export function UserManagementPageReal() {
  // Real user management hook
  const {
    users,
    activities,
    loading,
    error,
    totalUsers,
    currentPage,
    stats,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    refreshData,
    clearError,
  } = useUserManagement();

  // Auth context for permission checks
  const { hasPermission } = useAuthStore();

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('users');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  // const [showInactive, setShowInactive] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Check permissions
  const canManageUsers =
    hasPermission(Permission.VIEW_USERS) && hasPermission(Permission.CREATE_USER);
  const canViewActivities = hasPermission(Permission.VIEW_REPORTS);

  // Forms
  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema) as any,  
    defaultValues: {
      role: UserRole.VIEWER,
      sendInvitation: true,
    },
  });

  const updateForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema) as any,  
  });

  // Load users when filters change
  useEffect(() => {
    const filters = {
      search: debouncedSearch || undefined,
      role: roleFilter !== 'all' ? (roleFilter as UserRole) : undefined,
      status:
        statusFilter !== 'all'
          ? (statusFilter as 'active' | 'inactive' | 'pending' | 'suspended')
          : undefined,
      department: departmentFilter !== 'all' ? departmentFilter : undefined,
      page: currentPage,
    };

    loadUsers(filters);
  }, [debouncedSearch, roleFilter, statusFilter, departmentFilter, currentPage, loadUsers]);

  // Handle create user
  const handleCreateUser = async (data: CreateUserFormData) => {
    try {
      await createUser(data);
      setIsCreateDialogOpen(false);
      createForm.reset();
    } catch {
      // Error already handled in hook
    }
  };

  // Handle update user
  const handleUpdateUser = async (data: UpdateUserFormData) => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, data);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      updateForm.reset();
    } catch {
      // Error already handled in hook
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
    } catch {
      // Error already handled in hook
    }
  };

  // Handle reset password
  const handleResetPassword = async (userId: string) => {
    try {
      await resetPassword(userId);
    } catch {
      // Error already handled in hook
    }
  };

  // Open edit dialog
  const openEditDialog = (user: ManagedUser) => {
    setSelectedUser(user);
    updateForm.reset({
      name: user.name,
      role: user.role,
      status: user.status === 'pending' ? 'inactive' : user.status,
      phone: user.phone || '',
      department: user.department || '',
      notes: user.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  // Permission check
  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erişim Engellendi</h3>
            <p className="text-gray-600">
              Bu sayfayı görüntülemek için kullanıcı yönetimi yetkisine ihtiyacınız var.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-gray-600 mt-2">
            Sistem kullanıcılarını yönetin, roller atayın ve aktiviteleri takip edin.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateUserFormData, 'email'>;
                    }) => (
                      <FormItem>
                        <FormLabel>Email Adresi</FormLabel>
                        <FormControl>
                          <Input placeholder="user@dernek.org" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateUserFormData, 'name'>;
                    }) => (
                      <FormItem>
                        <FormLabel>Ad Soyad</FormLabel>
                        <FormControl>
                          <Input placeholder="Ahmet Yılmaz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="role"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateUserFormData, 'role'>;
                    }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Rol seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ROLES).map(([role, config]) => (
                              <SelectItem key={role} value={role}>
                                {config.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="phone"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateUserFormData, 'phone'>;
                    }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="05551234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="department"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateUserFormData, 'department'>;
                    }) => (
                      <FormItem>
                        <FormLabel>Departman</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Departman seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEPARTMENTS.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="sendInvitation"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<CreateUserFormData, 'sendInvitation'>;
                    }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Davet Emaili Gönder</FormLabel>
                          <div className="text-xs text-gray-500">
                            Kullanıcıya hesap aktivasyon emaili gönderilsin
                          </div>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                      }}
                    >
                      İptal
                    </Button>
                    <Button type="submit" disabled={createForm.formState.isSubmitting}>
                      {createForm.formState.isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="mr-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </motion.div>
                          Oluşturuluyor...
                        </>
                      ) : (
                        'Oluştur'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Beklemede</p>
                <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <UserX className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pasif</p>
                <p className="text-xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Askıda</p>
                <p className="text-xl font-bold text-red-600">{stats.suspended}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Kullanıcılar ({totalUsers})</TabsTrigger>
          {canViewActivities && (
            <TabsTrigger value="activities">Aktiviteler ({activities.length})</TabsTrigger>
          )}
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Kullanıcı ara..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Rol filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Roller</SelectItem>
                    {Object.entries(ROLES).map(([role, config]) => (
                      <SelectItem key={role} value={role}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Departman filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Departmanlar</SelectItem>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardContent className="p-0">
              {loading && users.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <span className="ml-3 text-gray-600">Kullanıcılar yükleniyor...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kullanıcı bulunamadı</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                      ? 'Arama kriterlerinize uygun kullanıcı bulunamadı'
                      : 'Henüz hiç kullanıcı eklenmemiş'}
                  </p>
                  <Button
                    onClick={() => {
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Kullanıcıyı Ekle
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  <AnimatePresence>
                    {users.map((user) => {
                      const roleConfig = ROLES[user.role];
                      const statusConfig = STATUS_CONFIG[user.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                  {user.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{user.name}</h3>
                                  <Badge className={roleConfig.color}>{roleConfig.label}</Badge>
                                  <div
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig.color}`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusConfig.label}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                  </span>
                                  {user.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {user.phone}
                                    </span>
                                  )}
                                  {user.department && (
                                    <span className="flex items-center gap-1">
                                      <Building className="h-3 w-3" />
                                      {user.department}
                                    </span>
                                  )}
                                </div>
                                {user.lastLoginAt && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Son giriş: {user.lastLoginAt.toLocaleDateString('tr-TR')}
                                  </p>
                                )}
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    openEditDialog(user);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Düzenle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                  <Key className="h-4 w-4 mr-2" />
                                  Şifre Sıfırla
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onSelect={(e: Event) => {
                                        e.preventDefault();
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Sil
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {user.name} kullanıcısını silmek istediğinizden emin
                                        misiniz? Bu işlem geri alınamaz.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>İptal</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Sil
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        {canViewActivities && (
          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Kullanıcı Aktiviteleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz aktivite kaydı bulunmuyor</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              activity.status === 'success'
                                ? 'bg-green-100'
                                : activity.status === 'failed'
                                  ? 'bg-red-100'
                                  : 'bg-yellow-100'
                            }`}
                          >
                            <Activity
                              className={`h-4 w-4 ${
                                activity.status === 'success'
                                  ? 'text-green-600'
                                  : activity.status === 'failed'
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{activity.userName}</span>
                              <Badge variant="outline" className="text-xs">
                                {activity.action}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {activity.timestamp.toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(handleUpdateUser)} className="space-y-4">
                <FormField
                  control={updateForm.control}
                  name="name"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<UpdateUserFormData, 'name'>;
                  }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="role"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<UpdateUserFormData, 'role'>;
                  }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ROLES).map(([role, config]) => (
                            <SelectItem key={role} value={role}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="status"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<UpdateUserFormData, 'status'>;
                  }) => (
                    <FormItem>
                      <FormLabel>Durum</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG)
                            .filter(([status]) => status !== 'pending')
                            .map(([status, config]) => (
                              <SelectItem key={status} value={status}>
                                {config.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                    }}
                  >
                    İptal
                  </Button>
                  <Button type="submit" disabled={updateForm.formState.isSubmitting}>
                    {updateForm.formState.isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Güncelleniyor...
                      </>
                    ) : (
                      'Güncelle'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { UserManagementPageReal as UserManagementPage };
export default UserManagementPageReal;
