import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area where you can put any content.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithStats: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Toplam Üye Sayısı</CardTitle>
        <CardDescription>Aktif üye istatistikleri</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">1,234</div>
        <p className="text-sm text-muted-foreground mt-2">
          +12% son aydan beri
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Yeni Üye Ekle</CardTitle>
        <CardDescription>Üye bilgilerini girin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ad Soyad</label>
          <input
            type="text"
            placeholder="Ahmet Yılmaz"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">E-posta</label>
          <input
            type="email"
            placeholder="ahmet@example.com"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Telefon</label>
          <input
            type="tel"
            placeholder="0555 123 45 67"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">İptal</Button>
        <Button>Kaydet</Button>
      </CardFooter>
    </Card>
  ),
};

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Toplam Bağış</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">₺125,430</div>
          <p className="text-sm text-green-600 mt-1">+18% bu ay</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Aktif Kampanya</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">8</div>
          <p className="text-sm text-muted-foreground mt-1">3 tamamlandı</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Yardım Başvurusu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">42</div>
          <p className="text-sm text-orange-600 mt-1">12 beklemede</p>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
        </div>
      </CardContent>
    </Card>
  ),
};
