'use client';

import * as React from 'react';
import { Code, Copy, Check, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const codeExamples = {
  button: `import { Button } from "@/components/ui/button"

export function ButtonExample() {
  return (
    <div className="space-x-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}`,

  card: `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Your content here</p>
      </CardContent>
    </Card>
  )
}`,

  form: `import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export function FormExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}`,
};

function CodeBlock({ children, title }: { children: string; title: string }) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          <code>{children}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

export function UIComponentsShowcase() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">shadcn/ui Bileşen Galerisi</h1>
        <p className="text-muted-foreground">
          Kafkasder Yönetim Sistemi&apos;nde kullanılan tüm UI bileşenlerinin örnekleri
        </p>
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Navigasyon</CardTitle>
          <CardDescription>Bileşen kategorilerine hızlı erişim</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Code className="h-6 w-6" />
              <span>Form Bileşenleri</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Card className="h-6 w-6" />
              <span>Layout Bileşenleri</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <Badge className="h-6 w-6" />
              <span>Feedback Bileşenleri</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
              <ExternalLink className="h-6 w-6" />
              <span>Overlay Bileşenleri</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Component Categories */}
      <Tabs defaultValue="buttons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="buttons">Butonlar</TabsTrigger>
          <TabsTrigger value="forms">Formlar</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Bileşenleri</CardTitle>
                <CardDescription>Farklı varyantlar ve boyutlar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Varyantlar</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Boyutlar</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">🚀</Button>
                  </div>
                </div>
                <CodeBlock title="Button Kullanımı">{codeExamples.button}</CodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Badge Bileşenleri</CardTitle>
                <CardDescription>Durum göstergeleri ve etiketler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Bileşenleri</CardTitle>
                <CardDescription>Input, Select, Checkbox ve diğer form elemanları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="ornek@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input id="password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mesaj</Label>
                    <Textarea id="message" placeholder="Mesajınızı yazın..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Seçenekler</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Bir seçenek seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Seçenek 1</SelectItem>
                        <SelectItem value="option2">Seçenek 2</SelectItem>
                        <SelectItem value="option3">Seçenek 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Şartları kabul ediyorum</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">Bildirimleri aç</Label>
                  </div>
                </div>
                <CodeBlock title="Form Bileşenleri Kullanımı">{codeExamples.form}</CodeBlock>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Card Bileşenleri</CardTitle>
                <CardDescription>İçerik gruplama ve düzenleme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basit Kart</CardTitle>
                      <CardDescription>Bu bir basit kart örneğidir</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Kart içeriği burada yer alır.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>İstatistik Kartı</CardTitle>
                      <CardDescription>Sayısal veriler için</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,234</div>
                      <p className="text-xs text-muted-foreground">+20.1% geçen aydan</p>
                    </CardContent>
                  </Card>
                </div>
                <CodeBlock title="Card Kullanımı">{codeExamples.card}</CodeBlock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress ve Slider</CardTitle>
                <CardDescription>İlerleme göstergeleri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>İlerleme: 65%</Label>
                  <Progress value={65} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label>Slider: 50</Label>
                  <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Bileşenleri</CardTitle>
                <CardDescription>Bildirimler ve uyarılar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>Bu bir bilgi mesajıdır.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertDescription>Bu bir hata mesajıdır.</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tooltip ve Hover Card</CardTitle>
                <CardDescription>Yardımcı bilgiler ve açıklamalar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Hover for tooltip</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bu bir tooltip mesajıdır</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="outline">Hover for card</Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">@nextjs</h4>
                        <p className="text-sm">
                          The React Framework – created and maintained by @vercel.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Installation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Kurulum Rehberi</CardTitle>
          <CardDescription>shadcn/ui bileşenlerini projenize nasıl ekleyeceğiniz</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>1. Bağımlılıkları Yükleyin</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-muted p-4 rounded-lg text-sm">
                  <code>
                    npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
                  </code>
                </pre>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>2. Bileşenleri Ekleyin</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-muted p-4 rounded-lg text-sm">
                  <code>npx shadcn@latest add button card form input</code>
                </pre>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>3. Kullanmaya Başlayın</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-muted p-4 rounded-lg text-sm">
                  <code>{codeExamples.button}</code>
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

export default UIComponentsShowcase;
