/**
 * @fileoverview Input Component Stories
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Mail, Lock, Search, DollarSign, User } from 'lucide-react';
import { Input, FloatingLabelInput, InputGroup, InputAddon } from './input';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Input Stories
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithPrefixIcon: Story = {
  args: {
    placeholder: 'Search...',
    prefixIcon: <Search />,
  },
};

export const WithSuffixIcon: Story = {
  args: {
    placeholder: 'Enter email',
    suffixIcon: <Mail />,
  },
};

export const Clearable: Story = {
  args: {
    placeholder: 'Type to see clear button',
    clearable: true,
    defaultValue: 'Clear me',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
    prefixIcon: <Lock />,
  },
};

export const Loading: Story = {
  args: {
    placeholder: 'Loading...',
    loading: true,
    prefixIcon: <Search />,
  },
};

// Size Variants
export const SmallSize: Story = {
  args: {
    inputSize: 'sm',
    placeholder: 'Small input',
    prefixIcon: <Search />,
  },
};

export const MediumSize: Story = {
  args: {
    inputSize: 'md',
    placeholder: 'Medium input (default)',
    prefixIcon: <Search />,
  },
};

export const LargeSize: Story = {
  args: {
    inputSize: 'lg',
    placeholder: 'Large input',
    prefixIcon: <Search />,
  },
};

// Validation States
export const ErrorState: Story = {
  args: {
    placeholder: 'Enter email',
    error: true,
    errorText: 'This email is already taken',
    prefixIcon: <Mail />,
  },
};

export const WarningState: Story = {
  args: {
    placeholder: 'Enter password',
    warning: true,
    warningText: 'Password strength is weak',
    prefixIcon: <Lock />,
  },
};

export const SuccessState: Story = {
  args: {
    placeholder: 'Enter username',
    success: true,
    successText: 'Username is available',
    prefixIcon: <User />,
  },
};

export const WithHelperText: Story = {
  args: {
    placeholder: 'Enter email',
    helperText: "We'll never share your email",
    prefixIcon: <Mail />,
  },
};

export const WithCharacterCount: Story = {
  args: {
    placeholder: 'Enter bio',
    maxLength: 100,
    showCharacterCount: true,
    helperText: 'Tell us about yourself',
  },
};

// Floating Label Stories
export const FloatingLabelDefault: StoryObj<typeof FloatingLabelInput> = {
  render: (args) => <FloatingLabelInput {...args} />,
  args: {
    label: 'Email Address',
    type: 'email',
  },
};

export const FloatingLabelRequired: StoryObj<typeof FloatingLabelInput> = {
  render: (args) => <FloatingLabelInput {...args} />,
  args: {
    label: 'Email Address',
    type: 'email',
    required: true,
  },
};

export const FloatingLabelWithError: StoryObj<typeof FloatingLabelInput> = {
  render: (args) => <FloatingLabelInput {...args} />,
  args: {
    label: 'Email',
    type: 'email',
    error: true,
    errorText: 'Invalid email format',
  },
};

export const FloatingLabelWithWarning: StoryObj<typeof FloatingLabelInput> = {
  render: (args) => <FloatingLabelInput {...args} />,
  args: {
    label: 'Username',
    warning: true,
    warningText: 'Username should be at least 6 characters',
  },
};

export const FloatingLabelSmall: StoryObj<typeof FloatingLabelInput> = {
  render: (args) => <FloatingLabelInput {...args} />,
  args: {
    label: 'Search',
    inputSize: 'sm',
  },
};

export const FloatingLabelLarge: StoryObj<typeof FloatingLabelInput> = {
  render: (args) => <FloatingLabelInput {...args} />,
  args: {
    label: 'Phone Number',
    type: 'tel',
    inputSize: 'lg',
  },
};

// Input Group Stories
export const InputGroupWebsite: StoryObj<typeof InputGroup> = {
  render: () => (
    <InputGroup>
      <InputAddon>https://</InputAddon>
      <Input placeholder="example.com" />
      <InputAddon>.com</InputAddon>
    </InputGroup>
  ),
};

export const InputGroupPrice: StoryObj<typeof InputGroup> = {
  render: () => (
    <InputGroup>
      <InputAddon>
        <DollarSign className="h-4 w-4" />
      </InputAddon>
      <Input type="number" placeholder="0.00" />
      <InputAddon>USD</InputAddon>
    </InputGroup>
  ),
};

export const InputGroupSmall: StoryObj<typeof InputGroup> = {
  render: () => (
    <InputGroup inputSize="sm">
      <InputAddon>@</InputAddon>
      <Input placeholder="username" />
    </InputGroup>
  ),
};

export const InputGroupLarge: StoryObj<typeof InputGroup> = {
  render: () => (
    <InputGroup inputSize="lg">
      <Input type="number" placeholder="0.00" />
      <InputAddon>₺</InputAddon>
    </InputGroup>
  ),
};

// Combined Features
export const AllFeaturesCombined: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
    prefixIcon: <Mail />,
    clearable: true,
    maxLength: 50,
    showCharacterCount: true,
    helperText: "We'll never share your email",
    inputSize: 'md',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    prefixIcon: <User />,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 'Read-only value',
    readOnly: true,
    prefixIcon: <User />,
  },
};
