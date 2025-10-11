"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, ChevronDown, ChevronRight, Mail, User, MapPin, FileText, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/components/ui/utils"
import { format } from "date-fns"

// Form schemas
const basicFormSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email adresi girin"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalı"),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalı"),
})

const multiStepFormSchema = z.object({
  // Step 1: Personal Info
  firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email adresi girin"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalı"),
  
  // Step 2: Address Info
  address: z.string().min(5, "Adres en az 5 karakter olmalı"),
  city: z.string().min(2, "Şehir en az 2 karakter olmalı"),
  postalCode: z.string().min(5, "Posta kodu en az 5 karakter olmalı"),
  country: z.string().min(2, "Ülke seçin"),
  
  // Step 3: Preferences
  newsletter: z.boolean().default(false),
  notifications: z.boolean().default(true),
  language: z.string().min(1, "Dil seçin"),
  terms: z.boolean().refine(val => val, "Şartları kabul etmelisiniz"),
})

const validationFormSchema = z.object({
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string()
    .min(8, "Şifre en az 8 karakter olmalı")
    .regex(/[A-Z]/, "En az bir büyük harf içermeli")
    .regex(/[a-z]/, "En az bir küçük harf içermeli")
    .regex(/[0-9]/, "En az bir rakam içermeli"),
  confirmPassword: z.string(),
  age: z.number().min(18, "Yaş en az 18 olmalı"),
  website: z.string().url("Geçerli bir URL girin").optional().or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
})

type BasicFormValues = z.infer<typeof basicFormSchema>
type MultiStepFormValues = z.infer<typeof multiStepFormSchema>
type ValidationFormValues = z.infer<typeof validationFormSchema>

export function FormExamplesPage() {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [date, setDate] = React.useState<Date>()
  const [open, setOpen] = React.useState(false)

  // Basic Form
  const basicForm = useForm<BasicFormValues>({
    resolver: zodResolver(basicFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
  })

  // Multi-step Form
  const multiStepForm = useForm<MultiStepFormValues>({
    resolver: zodResolver(multiStepFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      newsletter: false,
      notifications: true,
      language: "",
      terms: false,
    },
  })

  // Validation Form
  const validationForm = useForm<ValidationFormValues>({
    resolver: zodResolver(validationFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      age: 18,
      website: "",
    },
  })

  const onBasicSubmit = (data: BasicFormValues) => {
    // Form submitted successfully
    // In a real application, you would send this data to your API
    alert(`Form başarıyla gönderildi! Ad: ${data.firstName} ${data.lastName}`)
  }

  const onMultiStepSubmit = (data: MultiStepFormValues) => {
    // Multi-step form submitted successfully
    // In a real application, you would send this data to your API
    alert(`Çok adımlı form başarıyla gönderildi! Email: ${data.email}`)
  }

  const onValidationSubmit = (data: ValidationFormValues) => {
    // Validation form submitted successfully
    // In a real application, you would send this data to your API
    alert(`Validasyonlu form başarıyla gönderildi! Email: ${data.email}`)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Form Örnekleri</h1>
        <p className="text-muted-foreground">
          React Hook Form + Zod ile farklı form tipleri ve validasyon örnekleri
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basit Form</TabsTrigger>
          <TabsTrigger value="multistep">Çok Adımlı Form</TabsTrigger>
          <TabsTrigger value="validation">Validasyon Formu</TabsTrigger>
        </TabsList>

        {/* Basic Form */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basit İletişim Formu</CardTitle>
              <CardDescription>
                Temel form elemanları ve validasyon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...basicForm}>
                <form onSubmit={basicForm.handleSubmit(onBasicSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={basicForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad</FormLabel>
                          <FormControl>
                            <Input placeholder="Adınız" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={basicForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Soyad</FormLabel>
                          <FormControl>
                            <Input placeholder="Soyadınız" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={basicForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ornek@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={basicForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="0555 123 45 67" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={basicForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mesaj</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Mesajınızı buraya yazın..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Mesaj Gönder
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-step Form */}
        <TabsContent value="multistep" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Çok Adımlı Kayıt Formu</CardTitle>
              <CardDescription>
                Adım adım form doldurma örneği
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Adım {currentStep} / 3</span>
                  <span className="text-sm text-muted-foreground">
                    %{Math.round((currentStep / 3) * 100)} tamamlandı
                  </span>
                </div>
                <Progress value={(currentStep / 3) * 100} className="h-2" />
              </div>

              <Form {...multiStepForm}>
                <form onSubmit={multiStepForm.handleSubmit(onMultiStepSubmit)} className="space-y-6">
                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Kişisel Bilgiler</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={multiStepForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ad</FormLabel>
                              <FormControl>
                                <Input placeholder="Adınız" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={multiStepForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Soyad</FormLabel>
                              <FormControl>
                                <Input placeholder="Soyadınız" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={multiStepForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="ornek@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={multiStepForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefon</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="0555 123 45 67" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2: Address Info */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <h3 className="text-lg font-semibold">Adres Bilgileri</h3>
                      </div>

                      <FormField
                        control={multiStepForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adres</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Tam adresinizi yazın..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={multiStepForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Şehir</FormLabel>
                              <FormControl>
                                <Input placeholder="Şehir" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={multiStepForm.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Posta Kodu</FormLabel>
                              <FormControl>
                                <Input placeholder="34000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={multiStepForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ülke</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Ülke seçin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="tr">Türkiye</SelectItem>
                                  <SelectItem value="us">Amerika</SelectItem>
                                  <SelectItem value="de">Almanya</SelectItem>
                                  <SelectItem value="fr">Fransa</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Preferences */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold">Tercihler ve Şartlar</h3>
                      </div>

                      <div className="space-y-4">
                        <FormField
                          control={multiStepForm.control}
                          name="newsletter"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Bülten</FormLabel>
                                <FormDescription>
                                  Email bültenimize abone olmak istiyorum
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={multiStepForm.control}
                          name="notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Bildirimler</FormLabel>
                                <FormDescription>
                                  Push bildirimleri almak istiyorum
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={multiStepForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tercih Edilen Dil</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Dil seçin" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="tr">Türkçe</SelectItem>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="de">Deutsch</SelectItem>
                                  <SelectItem value="fr">Français</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={multiStepForm.control}
                          name="terms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  <a href="#" className="text-primary hover:underline">
                                    Kullanım şartlarını
                                  </a>{" "}
                                  ve{" "}
                                  <a href="#" className="text-primary hover:underline">
                                    gizlilik politikasını
                                  </a>{" "}
                                  kabul ediyorum
                                </FormLabel>
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 1}
                    >
                      <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
                      Önceki
                    </Button>
                    
                    {currentStep < 3 ? (
                      <Button type="button" onClick={nextStep}>
                        Sonraki
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Kaydı Tamamla
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Form */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gelişmiş Validasyon Formu</CardTitle>
              <CardDescription>
                Karmaşık validasyon kuralları ve gerçek zamanlı kontrol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...validationForm}>
                <form onSubmit={validationForm.handleSubmit(onValidationSubmit)} className="space-y-6">
                  <FormField
                    control={validationForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Adresi</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ornek@email.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Geçerli bir email adresi girin
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={validationForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          En az 8 karakter, büyük harf, küçük harf ve rakam içermeli
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={validationForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre Tekrar</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={validationForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yaş</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="18" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value) || 0)
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          En az 18 yaşında olmalısınız
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={validationForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (İsteğe Bağlı)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Geçerli bir URL formatında olmalı
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Bu form gelişmiş validasyon kuralları içerir. Tüm alanların doğru şekilde doldurulması gerekmektedir.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validasyonlu Kayıt
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>Ek Form Bileşenleri</CardTitle>
          <CardDescription>
            Tarih seçici, dropdown ve diğer özel bileşenler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Tarih Seçici</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Command Palette */}
            <div className="space-y-2">
              <Label>Komut Paleti</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    Seçenek seçin...
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Ara..." />
                    <CommandList>
                      <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="option1">Seçenek 1</CommandItem>
                        <CommandItem value="option2">Seçenek 2</CommandItem>
                        <CommandItem value="option3">Seçenek 3</CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Radio Group */}
          <div className="space-y-2">
            <Label>Cinsiyet</Label>
            <RadioGroup defaultValue="male">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Erkek</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Kadın</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Diğer</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}