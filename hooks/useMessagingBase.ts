import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { logger } from '@/lib/logging/logger';
import { useAuthStore } from '@/stores/authStore';
import type { Conversation, Message } from '@/types/messaging';

export interface MessagingHookOptions {
  autoLoadConversations?: boolean;
  autoLoadMessages?: boolean;
  messageLimit?: number;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

interface NormalizedOptions {
  autoLoadConversations: boolean;
  autoLoadMessages: boolean;
  messageLimit: number;
}

export interface MessagingBaseReturn {
  user: ReturnType<typeof useAuthStore>['user'];
  isAuthenticated: ReturnType<typeof useAuthStore>['isAuthenticated'];
  conversations: Conversation[];
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  selectedConversation: string | null;
  setSelectedConversation: Dispatch<SetStateAction<string | null>>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  clearError: () => void;
  handleError: (err: unknown, defaultMessage: string) => void;
  handleSuccess: (message: string) => void;
  options: NormalizedOptions;
}

export function useMessagingBase(options: MessagingHookOptions = {}): MessagingBaseReturn {
  const {
    autoLoadConversations = true,
    autoLoadMessages = true,
    messageLimit = 50,
    onError,
    onSuccess,
  } = options;

  const { user, isAuthenticated } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback(
    (err: unknown, defaultMessage: string) => {
      const errorMessage = (err as { message?: string })?.message || defaultMessage;
      setError(errorMessage);
      onError?.(errorMessage);
      toast.error(errorMessage);
      logger.error(defaultMessage, err);
    },
    [onError]
  );

  const handleSuccess = useCallback(
    (message: string) => {
      onSuccess?.(message);
      toast.success(message);
    },
    [onSuccess]
  );

  return {
    user,
    isAuthenticated,
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    setMessages,
    loading,
    setLoading,
    error,
    setError,
    clearError,
    handleError,
    handleSuccess,
    options: {
      autoLoadConversations,
      autoLoadMessages,
      messageLimit,
    },
  };
}
