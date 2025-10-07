# Contributing to Kafkasder Management System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Git
- Supabase account (for database access)

### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/panel.git
cd panel

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development server
npm run dev
```

---

## Development Workflow

### Branch Strategy

We use Git Flow:

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/your-feature-name
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` type
- Use interfaces for object shapes
- Document complex types

```typescript
// Good
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // implementation
}

// Bad
function getUser(id: any): any {
  // implementation
}
```

### React Components

- Use functional components with hooks
- Use TypeScript for props
- Keep components small and focused
- Use meaningful component names

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {label}
    </button>
  );
}
```

### File Organization

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── pages/       # Page components
│   └── forms/       # Form components
├── services/        # Business logic
├── hooks/           # Custom React hooks
├── stores/          # State management
├── types/           # TypeScript types
├── lib/             # Utilities
└── styles/          # Global styles
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useAuth.ts`)
- **Services**: camelCase with 'Service' suffix (`userService.ts`)
- **Types**: PascalCase (`UserType.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)

---

## Testing Guidelines

### Unit Tests

Write unit tests for:
- Utility functions
- Custom hooks
- Service functions

```typescript
// Example: services/__tests__/userService.test.ts
import { describe, it, expect } from 'vitest';
import { userService } from '../userService';

describe('userService', () => {
  it('should fetch user by id', async () => {
    const user = await userService.getUser('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });
});
```

### Component Tests

```typescript
// Example: components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click me" onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### E2E Tests

```typescript
// Example: tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/dashboard/);
});
```

### Running Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Watch mode
npm test -- --watch
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(members): resolve duplicate member creation"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api): change authentication endpoint

BREAKING CHANGE: /auth/login endpoint now requires email instead of username"
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run tests**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

3. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### Review Process

1. Submit PR to `develop` branch
2. Wait for CI checks to pass
3. Request review from maintainers
4. Address review comments
5. Maintainer will merge when approved

---

## Issue Guidelines

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g. macOS]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

### Feature Requests

```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution**
How should it work?

**Alternatives considered**
Other solutions you've considered

**Additional context**
Any other information
```

---

## Development Tips

### Hot Reload

Development server supports hot reload:
```bash
npm run dev
```

### Debugging

Use browser DevTools and React DevTools:
```typescript
// Add debug logs
console.log('Debug:', data);

// Use debugger
debugger;
```

### Performance

Check bundle size:
```bash
npm run analyze
```

### Accessibility

Test with screen readers and keyboard navigation.

---

## Getting Help

- **Documentation**: Check README and docs/
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Email**: dev@kafkasder.com

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing! 🎉**
