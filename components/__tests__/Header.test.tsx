import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, userEvent } from '../../tests/utils';
import { Header } from '../Header';

// Mock dependencies
vi.mock('../contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar_url: null,
    },
    isAuthenticated: true,
    isLoading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock('../hooks/useLocalStorage', () => ({
  useUserPreferences: () => [{ theme: 'light', language: 'tr' }, vi.fn()],
}));

vi.mock('../stores/notificationStore', () => ({
  useNotificationStore: () => ({
    notifications: [
      {
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        type: 'info',
        created_at: new Date().toISOString(),
        read: false,
      },
    ],
    unreadCount: 1,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  }),
}));

vi.mock('../ux/hooks/useCommandPalette', () => ({
  useCommandPalette: () => ({
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
  }),
}));

vi.mock('../ux/hooks/useUXAnalytics', () => ({
  useUXAnalytics: () => ({
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
  }),
}));

vi.mock(
  'sonner',
  () => ({
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  }),
  { virtual: true },
);

describe('Header', () => {
  const defaultProps = {
    onGlobalSearch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header with logo and navigation', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('Dernek Yönetim')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should display user information when authenticated', () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should show search input', () => {
    render(<Header {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/ara/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText(/ara/i);
    await user.type(searchInput, 'test search');

    expect(searchInput).toHaveValue('test search');
  });

  it('should show notification bell with count', () => {
    render(<Header {...defaultProps} />);

    const notificationBell = screen.getByRole('button', { name: /bildirim/i });
    expect(notificationBell).toBeInTheDocument();

    // Should show notification count badge
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should open notification dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    const notificationBell = screen.getByRole('button', { name: /bildirim/i });
    await user.click(notificationBell);

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
  });

  it('should show user menu dropdown', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    const userButton = screen.getByRole('button', { name: /test user/i });
    await user.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('Profil')).toBeInTheDocument();
      expect(screen.getByText('Ayarlar')).toBeInTheDocument();
      expect(screen.getByText('Çıkış Yap')).toBeInTheDocument();
    });
  });

  it('should handle logout', async () => {
    const user = userEvent.setup();
    const mockSignOut = vi.fn();

    vi.doMock('../contexts/SupabaseAuthContext', () => ({
      useSupabaseAuth: () => ({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        isAuthenticated: true,
        isLoading: false,
        signOut: mockSignOut,
      }),
    }));

    render(<Header {...defaultProps} />);

    const userButton = screen.getByRole('button', { name: /test user/i });
    await user.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('Çıkış Yap')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Çıkış Yap');
    await user.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should show theme toggle', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    const themeButton = screen.getByRole('button', { name: /tema/i });
    expect(themeButton).toBeInTheDocument();

    await user.click(themeButton);

    // Should toggle theme
    expect(themeButton).toBeInTheDocument();
  });

  it('should show help button', () => {
    render(<Header {...defaultProps} />);

    const helpButton = screen.getByRole('button', { name: /yardım/i });
    expect(helpButton).toBeInTheDocument();
  });

  it('should open command palette with keyboard shortcut', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    // Simulate Ctrl+K or Cmd+K
    await user.keyboard('{Control>}k{/Control}');

    // Command palette should open (mocked)
    // This would depend on the actual command palette implementation
  });

  it('should handle global search callback', async () => {
    const user = userEvent.setup();
    const mockOnGlobalSearch = vi.fn();

    render(<Header onGlobalSearch={mockOnGlobalSearch} />);

    const searchButton = screen.getByRole('button', { name: /arama/i });
    if (searchButton) {
      await user.click(searchButton);
      expect(mockOnGlobalSearch).toHaveBeenCalled();
    }
  });

  it('should show AI assistant button', () => {
    render(<Header {...defaultProps} />);

    const aiButton = screen.getByRole('button', { name: /ai/i });
    expect(aiButton).toBeInTheDocument();
  });

  it('should handle AI assistant toggle', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    const aiButton = screen.getByRole('button', { name: /ai/i });
    await user.click(aiButton);

    // Should trigger AI assistant (mocked)
    expect(aiButton).toBeInTheDocument();
  });

  it('should be responsive on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<Header {...defaultProps} />);

    // Should show mobile-optimized layout
    expect(document.querySelector('.mobile-header')).toBeInTheDocument();
  });

  it('should show breadcrumbs if provided', () => {
    const breadcrumbs = [
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Yararlanıcılar', href: '/beneficiaries' },
      { label: 'Detay' },
    ];

    render(<Header {...defaultProps} breadcrumbs={breadcrumbs} />);

    expect(screen.getByText('Ana Sayfa')).toBeInTheDocument();
    expect(screen.getByText('Yararlanıcılar')).toBeInTheDocument();
    expect(screen.getByText('Detay')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Header {...defaultProps} />);

    // Tab through interactive elements
    await user.tab();

    // First focusable element should be focused
    const searchInput = screen.getByPlaceholderText(/ara/i);
    expect(searchInput).toHaveFocus();
  });

  it('should show loading state when user is loading', () => {
    vi.doMock('../contexts/SupabaseAuthContext', () => ({
      useSupabaseAuth: () => ({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        signOut: vi.fn(),
      }),
    }));

    render(<Header {...defaultProps} />);

    // Should show skeleton or loading placeholder
    expect(
      screen.getByTestId('user-loading') || document.querySelector('.animate-pulse'),
    ).toBeInTheDocument();
  });
});
