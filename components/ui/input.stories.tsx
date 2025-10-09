import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

export const Phone: Story = {
  args: {
    type: 'tel',
    placeholder: '0555 123 45 67',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Ara...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <label className="text-sm font-medium">Email Address</label>
      <Input type="email" placeholder="email@example.com" />
      <p className="text-sm text-muted-foreground">
        We&apos;ll never share your email.
      </p>
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <label className="text-sm font-medium">Email Address</label>
      <Input
        type="email"
        placeholder="email@example.com"
        className="border-red-500"
      />
      <p className="text-sm text-red-500">
        Please enter a valid email address.
      </p>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Ad Soyad</label>
        <Input placeholder="Ahmet Yılmaz" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">E-posta</label>
        <Input type="email" placeholder="ahmet@example.com" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Telefon</label>
        <Input type="tel" placeholder="0555 123 45 67" />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">TC Kimlik No</label>
        <Input type="text" placeholder="12345678901" maxLength={11} />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <Input placeholder="Default size" />
      <Input placeholder="Small size" className="h-8 text-sm" />
      <Input placeholder="Large size" className="h-12 text-lg" />
    </div>
  ),
};
