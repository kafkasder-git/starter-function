#!/bin/bash

# Update imports for reorganized components

echo "Updating import paths..."

# Update ErrorBoundary imports
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../components/ErrorBoundary'|from '../components/shared/ErrorBoundary'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from './components/ErrorBoundary'|from '../components/shared/ErrorBoundary'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../components/ErrorBoundary'|from '../shared/ErrorBoundary'|g"

# Update LoadingSpinner imports
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../components/LoadingSpinner'|from '../components/shared/LoadingSpinner'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from './components/LoadingSpinner'|from '../components/shared/LoadingSpinner'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../components/LoadingSpinner'|from '../shared/LoadingSpinner'|g"

# Update SkeletonLoader imports
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../components/SkeletonLoader'|from '../components/shared/SkeletonLoader'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from './components/SkeletonLoader'|from '../components/shared/SkeletonLoader'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../components/SkeletonLoader'|from '../shared/SkeletonLoader'|g"

# Update EmptyState imports
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../components/EmptyState'|from '../components/shared/EmptyState'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from './components/EmptyState'|from '../components/shared/EmptyState'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../components/EmptyState'|from '../shared/EmptyState'|g"

# Update AnimatedContainer imports
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../components/AnimatedContainer'|from '../components/shared/AnimatedContainer'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from './components/AnimatedContainer'|from '../components/shared/AnimatedContainer'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../components/AnimatedContainer'|from '../shared/AnimatedContainer'|g"

# Update Header imports
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../components/Header'|from '../components/layouts/Header'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from './components/Header'|from '../components/layouts/Header'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../components/Header'|from '../layouts/Header'|g"

# Update Sidebar imports
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../components/Sidebar'|from '../components/layouts/Sidebar'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from './components/Sidebar'|from '../components/layouts/Sidebar'|g"
find components src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|from '../../components/Sidebar'|from '../layouts/Sidebar'|g"

echo "Import paths updated successfully!"