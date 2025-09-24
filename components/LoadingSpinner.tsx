import { Heart, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size], className)} />;
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-slate-50/50 to-blue-50/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="absolute -bottom-2 -right-2 w-6 h-6 animate-spin text-blue-600 bg-white rounded-full p-1 shadow-md" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-slate-700 font-medium">Yükleniyor...</p>
          <p className="text-slate-500 text-sm">Lütfen bekleyiniz</p>
        </div>
      </motion.div>
    </div>
  );
}

// Export SkeletonLoader from this file to consolidate loading components
export { SkeletonLoader } from './SkeletonLoader';
