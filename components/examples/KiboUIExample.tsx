import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/kibo-ui';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18 years old'),
});

type FormData = z.infer<typeof formSchema>;

// Sample data for table
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', role: 'Moderator' },
];

export const KiboUIExample: React.FC = () => {
  const [tableData, setTableData] = useState(sampleData);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    // Add new user to table
    const newUser = {
      id: tableData.length + 1,
      name: data.name,
      email: data.email,
      status: 'Active',
      role: 'User',
    };
    setTableData([...tableData, newUser]);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'Inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Kibo UI Components Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Modern, accessible UI components built with React and Tailwind CSS
        </p>
      </div>

      {/* Form Example */}
      <Card>
        <CardHeader>
          <CardTitle>User Registration Form</CardTitle>
          <CardDescription>
            A comprehensive form built with Kibo UI components and react-hook-form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field} 
                        clearable
                        helperText="This will be displayed on your profile"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
                        {...field}
                        clearable
                      />
                    </FormControl>
                    <FormDescription>
                      We'll use this to send you important updates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter your age" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  loading={form.formState.isSubmitting}
                  loadingText="Creating User..."
                >
                  Create User
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Table Example */}
      <Card>
        <CardHeader>
          <CardTitle>Users Table</CardTitle>
          <CardDescription>
            A responsive data table with status indicators and actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Button Variants</CardTitle>
          <CardDescription>
            Different button styles and states available in Kibo UI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Button Sizes</h4>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
              <Button size="icon">🎯</Button>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Button States</h4>
            <div className="flex flex-wrap gap-4">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button ripple>With Ripple</Button>
              <Button badge="3">With Badge</Button>
              <Button tooltip="This is a tooltip">With Tooltip</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Input Variants</CardTitle>
          <CardDescription>
            Different input styles and states available in Kibo UI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Input Sizes</h4>
              <div className="space-y-3">
                <Input placeholder="Small input" inputSize="sm" />
                <Input placeholder="Medium input" inputSize="md" />
                <Input placeholder="Large input" inputSize="lg" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Input States</h4>
              <div className="space-y-3">
                <Input placeholder="Normal input" />
                <Input placeholder="Error input" error errorText="This field is required" />
                <Input placeholder="Success input" success successText="Great job!" />
                <Input placeholder="Warning input" warning warningText="Please check this field" />
                <Input placeholder="Loading input" loading />
                <Input placeholder="Disabled input" disabled />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Input Features</h4>
              <div className="space-y-3">
                <Input placeholder="Clearable input" clearable />
                <Input type="password" placeholder="Password input" />
                <Input 
                  placeholder="Input with helper text" 
                  helperText="This is helpful information"
                />
                <Input 
                  placeholder="Input with character limit" 
                  maxLength={50}
                  showCharacterCount
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KiboUIExample;
