'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';

import { useFormAutoScroll } from '@/hooks/useFormAutoScroll';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormHelperText,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Lütfen geçerli bir email adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isLoading: authLoading, error: authError, clearError } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Add auto-scroll to first error
  useFormAutoScroll(form, {
    behavior: 'smooth',
    block: 'center',
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      clearError();
      
      await login(values.email, values.password, values.rememberMe);
      
      // Başarılı giriş sonrası yönlendirme
      navigate('/dashboard');
    } catch {
      // Hata zaten auth store'da handle ediliyor
      // console.error('Giriş hatası:', error); // TODO: Implement proper error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Heading level={1} size="3xl" weight="bold" className="tracking-tight">
            Dernek Yönetim Sistemi
          </Heading>
          <Text size="sm" color="neutral" className="mt-2">
            Hesabınıza giriş yapın
          </Text>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hoş Geldiniz</CardTitle>
            <CardDescription>Devam etmek için giriş yapın</CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {authError}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Adresi</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ornek@email.com" {...field} />
                      </FormControl>
                      <FormHelperText variant="default">
                        Hesabınızla ilişkili email adresinizi giriniz
                      </FormHelperText>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Şifrenizi giriniz" {...field} />
                      </FormControl>
                      <FormHelperText variant="default">
                        Hesabınızın şifresini giriniz
                      </FormHelperText>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Beni Hatırla</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">
                    Şifremi Unuttum?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || authLoading}
                >
                  {isLoading || authLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </Button>

                {/* Development Mode Bilgisi */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Geliştirme Modu</h4>
                  <p className="text-xs text-blue-700 mb-2">Test için kullanabileceğiniz hesaplar:</p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div><strong>Admin:</strong> admin@dernek.org / admin123</div>
                    <div><strong>Manager:</strong> manager@dernek.org / manager123</div>
                    <div><strong>Operator:</strong> operator@dernek.org / operator123</div>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
