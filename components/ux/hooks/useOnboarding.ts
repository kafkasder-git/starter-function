import { useState, useEffect, useCallback } from 'react';

interface OnboardingData {
  variant: string;
  completedAt: string;
  userRole: string;
  version: string;
  skippedSteps?: string[];
}

interface UseOnboardingOptions {
  variant?: string;
  userRole?: string;
  autoStart?: boolean;
  version?: string;
}

export function useOnboarding({
  variant = 'welcome',
  userRole = 'user',
  autoStart = true,
  version = '1.0',
}: UseOnboardingOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<OnboardingData | null>(null);

  // Load onboarding status from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('onboarding-completed');
      if (saved) {
        const data: OnboardingData = JSON.parse(saved);
        setCompletionData(data);

        // Check if this specific variant and version is completed
        const isThisVariantCompleted =
          data.variant === variant && data.version === version && data.userRole === userRole;

        setIsCompleted(isThisVariantCompleted);

        // Don't auto-start if already completed
        if (isThisVariantCompleted && autoStart) {
          return;
        }
      }

      // Auto-start onboarding if not completed
      if (autoStart && !isCompleted) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1000); // Small delay to let the app initialize

        return () => {
          clearTimeout(timer);
        };
      }
    } catch (error) {
      console.warn('Error loading onboarding status:', error);
    }
  }, [variant, userRole, version, autoStart, isCompleted]);

  const startOnboarding = useCallback(() => {
    setIsOpen(true);
  }, []);

  const completeOnboarding = useCallback(() => {
    const completionData: OnboardingData = {
      variant,
      completedAt: new Date().toISOString(),
      userRole,
      version,
    };

    try {
      localStorage.setItem('onboarding-completed', JSON.stringify(completionData));
      setCompletionData(completionData);
      setIsCompleted(true);
    } catch (error) {
      console.warn('Error saving onboarding completion:', error);
    }
  }, [variant, userRole, version]);

  const skipOnboarding = useCallback(() => {
    const skipData: OnboardingData = {
      variant,
      completedAt: new Date().toISOString(),
      userRole,
      version,
      skippedSteps: ['all'],
    };

    try {
      localStorage.setItem('onboarding-completed', JSON.stringify(skipData));
      setCompletionData(skipData);
      setIsCompleted(true);
    } catch (error) {
      console.warn('Error saving onboarding skip:', error);
    }
  }, [variant, userRole, version]);

  const resetOnboarding = useCallback(() => {
    try {
      localStorage.removeItem('onboarding-completed');
      setCompletionData(null);
      setIsCompleted(false);
    } catch (error) {
      console.warn('Error resetting onboarding:', error);
    }
  }, []);

  const closeOnboarding = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    isCompleted,
    completionData,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    closeOnboarding,
  };
}

export default useOnboarding;
