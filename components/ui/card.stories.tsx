import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'bordered', 'flat', 'outlined'],
    },
    interactive: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    hoverable: {
      control: 'boolean',
    },
    clickable: {
      control: 'boolean',
    },
  },
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

export const Elevated: Story = {
  render: () => (
    <Card variant="elevated" className="w-[350px]">
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>This card has elevation shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Elevated cards stand out more from the background.</p>
      </CardContent>
    </Card>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Card 
      variant="elevated" 
      interactive 
      className="w-[350px]"
      onClick={() => { alert('Card clicked!'); }}
    >
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>Click me to see the interaction</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card responds to hover and click events.</p>
      </CardContent>
    </Card>
  ),
};

export const WithLoading: Story = {
  render: () => (
    <Card loading className="w-[350px]">
      <CardHeader>
        <CardTitle>Loading Card</CardTitle>
        <CardDescription>This card is in loading state</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content is loading...</p>
      </CardContent>
    </Card>
  ),
};

export const WithBadges: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Card with Badges</CardTitle>
          <Badge variant="success">Active</Badge>
        </div>
        <CardDescription>This card includes status badges</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Card content with additional elements.</p>
          <div className="flex gap-2">
            <Badge variant="default">Tag 1</Badge>
            <Badge variant="secondary">Tag 2</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card variant="default" className="w-[300px]">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Standard card appearance</p>
        </CardContent>
      </Card>
      
      <Card variant="elevated" className="w-[300px]">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card with shadow elevation</p>
        </CardContent>
      </Card>
      
      <Card variant="bordered" className="w-[300px]">
        <CardHeader>
          <CardTitle>Bordered</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card with thick border</p>
        </CardContent>
      </Card>
      
      <Card variant="flat" className="w-[300px]">
        <CardHeader>
          <CardTitle>Flat</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card without border or shadow</p>
        </CardContent>
      </Card>
      
      <Card variant="outlined" className="w-[300px]">
        <CardHeader>
          <CardTitle>Outlined</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card with dashed border</p>
        </CardContent>
      </Card>
    </div>
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
