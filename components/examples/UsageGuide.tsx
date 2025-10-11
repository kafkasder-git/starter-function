"use client"

import * as React from "react"
import { Code, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const codeExamples = {
  login: `import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return <LoginForm />
}`,
  
  dashboard: `import { DashboardExample } from "@/components/dashboard/DashboardExample"

export default function DashboardPage() {
  return <DashboardExample />
}`,
  
  card: `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MyCard() {
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

export function MyForm() {
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
}`
}

function CodeBlock({ children, title }: { children: string; title: string }) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          <code>{children}</code>
        </pre>
      </CardContent>
    </Card>
  )
}

export function UsageGuide() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">shadcn/ui Usage Guide</h1>
        <p className="text-muted-foreground">
          Complete examples and implementation guides for shadcn/ui components
        </p>
      </div>

      {/* Quick Start */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Quick Start</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Installation
              </CardTitle>
              <CardDescription>
                Get started with shadcn/ui in your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Install dependencies</h4>
                <pre className="bg-muted p-2 rounded text-sm">
                  <code>npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge</code>
                </pre>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">2. Add components</h4>
                <pre className="bg-muted p-2 rounded text-sm">
                  <code>npx shadcn@latest add button card form input</code>
                </pre>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">3. Start building</h4>
                <p className="text-sm text-muted-foreground">
                  Import and use components in your React application
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Components</CardTitle>
              <CardDescription>
                Complete list of shadcn/ui components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  "accordion", "alert", "alert-dialog", "aspect-ratio",
                  "avatar", "badge", "breadcrumb", "button",
                  "calendar", "card", "carousel", "chart",
                  "checkbox", "collapsible", "command", "context-menu",
                  "dialog", "drawer", "dropdown-menu", "empty",
                  "field", "form", "hover-card", "input",
                  "input-group", "input-otp", "item", "kbd",
                  "label", "menubar", "navigation-menu", "pagination",
                  "popover", "progress", "radio-group", "resizable",
                  "scroll-area", "select", "separator", "sheet",
                  "sidebar", "skeleton", "slider", "sonner",
                  "spinner", "switch", "table", "tabs",
                  "textarea", "toggle", "toggle-group", "tooltip"
                ].map((component) => (
                  <Badge key={component} variant="outline" className="text-xs">
                    {component}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Code Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Code Examples</h2>
        <div className="space-y-6">
          <CodeBlock title="Login Form Implementation" children={codeExamples.login} />
          <CodeBlock title="Dashboard Component" children={codeExamples.dashboard} />
          <CodeBlock title="Basic Card Usage" children={codeExamples.card} />
          <CodeBlock title="Form with Validation" children={codeExamples.form} />
        </div>
      </section>

      {/* Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Best Practices</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Component Composition</CardTitle>
              <CardDescription>
                How to effectively compose shadcn/ui components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Do</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use semantic HTML elements</li>
                  <li>• Compose components for complex layouts</li>
                  <li>• Leverage variant props for styling</li>
                  <li>• Follow accessibility guidelines</li>
                </ul>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">❌ Don't</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Override component internals</li>
                  <li>• Use inline styles excessively</li>
                  <li>• Ignore responsive design</li>
                  <li>• Skip form validation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Styling Guidelines</CardTitle>
              <CardDescription>
                Tips for consistent styling with shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">CSS Variables</h4>
                <p className="text-sm text-muted-foreground">
                  Use CSS custom properties for theming and consistency
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Tailwind Classes</h4>
                <p className="text-sm text-muted-foreground">
                  Leverage Tailwind utilities for spacing, colors, and layout
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Responsive Design</h4>
                <p className="text-sm text-muted-foreground">
                  Use responsive prefixes (sm:, md:, lg:) for mobile-first design
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Resources</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Official shadcn/ui documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
                  Visit Docs
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GitHub</CardTitle>
              <CardDescription>
                Source code and examples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://github.com/shadcn-ui/ui" target="_blank" rel="noopener noreferrer">
                  View Source
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community</CardTitle>
              <CardDescription>
                Get help and share ideas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://discord.gg/shadcn" target="_blank" rel="noopener noreferrer">
                  Join Discord
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
