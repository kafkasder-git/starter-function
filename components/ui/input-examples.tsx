/**
 * @fileoverview Input Examples - Showcase of enhanced input components
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import * as React from 'react';
import { Mail, Lock, Search, DollarSign, User, Phone } from 'lucide-react';
import { Input, FloatingLabelInput, InputGroup, InputAddon } from './input';
import { Heading } from './heading';
import { Text } from './text';

export function InputExamples() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [amount, setAmount] = React.useState('');

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <Heading level={1} size="3xl" weight="bold" className="mb-2">Enhanced Input Components</Heading>
        <Text color="muted">
          Comprehensive examples of the enhanced input system with new features
        </Text>
      </div>

      {/* Size Variants */}
      <section className="space-y-4">
        <Heading level={2} size="2xl" weight="semibold">Size Variants</Heading>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Small Input</label>
            <Input
              inputSize="sm"
              placeholder="Small size input"
              prefixIcon={<Search className="h-3.5 w-3.5" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Medium Input (Default)</label>
            <Input
              inputSize="md"
              placeholder="Medium size input"
              prefixIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Large Input</label>
            <Input
              inputSize="lg"
              placeholder="Large size input"
              prefixIcon={<Search className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      {/* Validation States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Validation States</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Error State</label>
            <Input
              placeholder="Enter your email"
              error
              errorText="This email is already taken"
              prefixIcon={<Mail />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Warning State (New)</label>
            <Input
              placeholder="Enter your password"
              warning
              warningText="Password strength is weak"
              prefixIcon={<Lock />}
              type="password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Success State</label>
            <Input
              placeholder="Enter your username"
              success
              successText="Username is available"
              prefixIcon={<User />}
            />
          </div>
        </div>
      </section>

      {/* Floating Label Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Floating Label Inputs</h2>
        <div className="space-y-4">
          <div>
            <FloatingLabelInput
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <FloatingLabelInput
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <FloatingLabelInput
              label="Phone Number"
              type="tel"
              inputSize="lg"
            />
          </div>
          <div>
            <FloatingLabelInput
              label="Search"
              inputSize="sm"
            />
          </div>
        </div>
      </section>

      {/* Floating Label with States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Floating Label with Validation</h2>
        <div className="space-y-4">
          <div>
            <FloatingLabelInput
              label="Email"
              type="email"
              error
              errorText="Invalid email format"
            />
          </div>
          <div>
            <FloatingLabelInput
              label="Username"
              warning
              warningText="Username should be at least 6 characters"
            />
          </div>
          <div>
            <FloatingLabelInput
              label="Display Name"
              success
              successText="Name is available"
            />
          </div>
        </div>
      </section>

      {/* Input Groups */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Input Groups</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Website URL</label>
            <InputGroup>
              <InputAddon>https://</InputAddon>
              <Input
                placeholder="example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <InputAddon>.com</InputAddon>
            </InputGroup>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <InputGroup>
              <InputAddon>
                <DollarSign className="h-4 w-4" />
              </InputAddon>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <InputAddon>USD</InputAddon>
            </InputGroup>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Turkish Lira</label>
            <InputGroup inputSize="lg">
              <Input
                type="number"
                placeholder="0.00"
              />
              <InputAddon>₺</InputAddon>
            </InputGroup>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Small Input Group</label>
            <InputGroup inputSize="sm">
              <InputAddon>@</InputAddon>
              <Input placeholder="username" />
            </InputGroup>
          </div>
        </div>
      </section>

      {/* Combined Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Combined Features</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email with Character Count
            </label>
            <Input
              type="email"
              placeholder="Enter your email"
              prefixIcon={<Mail />}
              clearable
              maxLength={50}
              showCharacterCount
              helperText="We'll never share your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Password with Loading State
            </label>
            <Input
              type="password"
              placeholder="Enter your password"
              prefixIcon={<Lock />}
              loading
              helperText="Checking password strength..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number (Large, Clearable)
            </label>
            <Input
              type="tel"
              inputSize="lg"
              placeholder="+90 (5XX) XXX XX XX"
              prefixIcon={<Phone />}
              clearable
              helperText="Enter your Turkish mobile number"
            />
          </div>
        </div>
      </section>

      {/* Responsive Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Responsive Form Example</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingLabelInput
            label="First Name"
            required
          />
          <FloatingLabelInput
            label="Last Name"
            required
          />
          <div className="md:col-span-2">
            <FloatingLabelInput
              label="Email Address"
              type="email"
              required
            />
          </div>
          <div className="md:col-span-2">
            <InputGroup>
              <InputAddon>https://</InputAddon>
              <Input placeholder="your-website.com" />
            </InputGroup>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Accessibility Features</h2>
        <div className="space-y-4">
          <div>
            <FloatingLabelInput
              label="Accessible Input"
              required
              helperText="All inputs include proper ARIA attributes"
            />
          </div>
          <div>
            <Input
              placeholder="Search..."
              prefixIcon={<Search />}
              aria-label="Search the website"
              helperText="Screen readers will announce this properly"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default InputExamples;
