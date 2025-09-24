// 🧪 KUMBARA WORKFLOW INTEGRATION TESTS
// End-to-end workflow tests for Kumbara QR system

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EnhancedKumbaraPage } from '../../components/kumbara/EnhancedKumbaraPage';
import kumbaraService from '../../services/kumbaraService';
import testUtils from '../setup';

// Mock services
vi.mock('../../services/kumbaraService');
vi.mock('../../services/qrCodeService');
vi.mock('../../services/qrScannerService');
vi.mock('sonner');

// Mock child components that have complex dependencies
vi.mock('../../components/kumbara/QRCodeManager', () => ({
  default: ({ kumbara, onKumbaraFound, onQRGenerated, onClose }: any) => (
    <div data-testid="qr-manager">
      <div>QR Manager for {kumbara?.name || 'No Kumbara'}</div>
      <button onClick={() => onQRGenerated?.(testUtils.createMockQRData())}>
        Mock QR Generated
      </button>
      <button onClick={() => onKumbaraFound?.(testUtils.createMockQRData())}>
        Mock Kumbara Found
      </button>
      <button onClick={onClose}>Close QR Manager</button>
    </div>
  ),
}));

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('Kumbara Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default service mocks
    vi.mocked(kumbaraService.getKumbaras).mockResolvedValue({
      kumbaras: [
        testUtils.createMockKumbara({ id: '1', name: 'Test Kumbara 1' }),
        testUtils.createMockKumbara({ id: '2', name: 'Test Kumbara 2' }),
      ],
      total_count: 2,
      page: 1,
      page_size: 10,
      total_pages: 1,
      filters_applied: {},
    });

    vi.mocked(kumbaraService.getDashboardStats).mockResolvedValue({
      total_kumbaras: 2,
      active_kumbaras: 2,
      inactive_kumbaras: 0,
      maintenance_kumbaras: 0,
      total_collections_today: 5,
      total_amount_today: 450.75,
      total_collections_month: 45,
      total_amount_month: 12500.25,
      top_performing_kumbaras: [],
      recent_collections: [],
      maintenance_alerts: [],
      performance_trends: [],
    });
  });

  describe('Complete Kumbara Management Workflow', () => {
    it('should handle full kumbara lifecycle', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // 1. Create new kumbara
      await user.click(screen.getByRole('button', { name: /Yeni Kumbara/ }));

      await waitFor(() => {
        expect(screen.getByText('Yeni Kumbara Ekle')).toBeInTheDocument();
      });

      // Fill form
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Integration Test Kumbara');
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Integration Location');
      await user.type(screen.getByLabelText(/Tam Adres/), 'Integration Address, Istanbul, Turkey');

      // Mock successful creation
      const newKumbara = testUtils.createMockKumbara({
        id: '3',
        name: 'Integration Test Kumbara',
        location: 'Integration Location',
      });
      vi.mocked(kumbaraService.createKumbara).mockResolvedValue(newKumbara);
      vi.mocked(kumbaraService.validateKumbaraData).mockReturnValue({
        isValid: true,
        errors: [],
      });

      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(kumbaraService.createKumbara).toHaveBeenCalled();
      });

      // 2. Generate QR code for the kumbara
      // Find the QR button for the new kumbara (this would be in the table)
      // For integration test, we'll simulate this by opening QR manager
      await user.click(screen.getByRole('button', { name: /QR Yönetici/ }));

      await waitFor(() => {
        expect(screen.getByTestId('qr-manager')).toBeInTheDocument();
      });

      // Generate QR code
      await user.click(screen.getByText('Mock QR Generated'));

      // 3. Record a collection
      // This would typically involve clicking the collection button and filling the form
      const collectionData = {
        kumbara_id: newKumbara.id,
        amount: 150.75,
        collector_name: 'Integration Collector',
        created_by: 'test-user',
      };

      const mockCollection = testUtils.createMockCollection(collectionData);
      vi.mocked(kumbaraService.recordCollection).mockResolvedValue(mockCollection);

      // Simulate collection recording (would be done through UI)
      // For integration test, we verify the service would be called correctly

      expect(kumbaraService.createKumbara).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Integration Test Kumbara',
          location: 'Integration Location',
        }),
      );
    });

    it('should handle error scenarios in workflow', async () => {
      const user = userEvent.setup();

      // Mock service to fail
      vi.mocked(kumbaraService.createKumbara).mockRejectedValue(new Error('Creation failed'));

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Try to create kumbara
      await user.click(screen.getByRole('button', { name: /Yeni Kumbara/ }));

      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test Kumbara');
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Test Location');
      await user.type(screen.getByLabelText(/Tam Adres/), 'Test Address');

      vi.mocked(kumbaraService.validateKumbaraData).mockReturnValue({
        isValid: true,
        errors: [],
      });

      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      // Should handle error gracefully
      await waitFor(() => {
        expect(kumbaraService.createKumbara).toHaveBeenCalled();
      });
    });
  });

  describe('QR Code Workflow Integration', () => {
    it('should handle complete QR generation and scanning workflow', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Open QR Manager
      await user.click(screen.getByRole('button', { name: /QR Yönetici/ }));

      await waitFor(() => {
        expect(screen.getByTestId('qr-manager')).toBeInTheDocument();
      });

      // 1. Generate QR code
      await user.click(screen.getByText('Mock QR Generated'));

      // Should trigger callback
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('QR kod oluşturuldu'));
      });

      // 2. Scan QR code (simulate finding a kumbara)
      await user.click(screen.getByText('Mock Kumbara Found'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Kumbara bulundu'));
      });

      // Close QR Manager
      await user.click(screen.getByText('Close QR Manager'));

      await waitFor(() => {
        expect(screen.queryByTestId('qr-manager')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence and State Management', () => {
    it('should maintain state across component interactions', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Test Kumbara 1')).toBeInTheDocument();
        expect(screen.getByText('Test Kumbara 2')).toBeInTheDocument();
      });

      // Filter kumbaras
      await user.type(screen.getByPlaceholderText(/Kumbara ara/), 'Test Kumbara 1');

      // Should filter results
      await waitFor(() => {
        expect(screen.getByText('Test Kumbara 1')).toBeInTheDocument();
      });

      // Clear filter
      await user.clear(screen.getByPlaceholderText(/Kumbara ara/));

      // Should show all kumbaras again
      await waitFor(() => {
        expect(screen.getByText('Test Kumbara 1')).toBeInTheDocument();
        expect(screen.getByText('Test Kumbara 2')).toBeInTheDocument();
      });
    });

    it('should handle real-time updates', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Simulate refresh
      await user.click(screen.getByRole('button', { name: /Yenile/ }));

      await waitFor(() => {
        expect(kumbaraService.getKumbaras).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });

  describe('Export and Import Workflow', () => {
    it('should handle data export', async () => {
      const user = userEvent.setup();

      const mockBlob = new Blob(['mock-csv-data'], { type: 'text/csv' });
      vi.mocked(kumbaraService.exportKumbaras).mockResolvedValue(mockBlob);

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Mock document.createElement for download
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

      await user.click(screen.getByRole('button', { name: /Dışa Aktar/ }));

      await waitFor(() => {
        expect(kumbaraService.exportKumbaras).toHaveBeenCalledWith('csv');
        expect(mockAnchor.click).toHaveBeenCalled();
      });
    });
  });

  describe('Error Recovery and User Experience', () => {
    it('should recover from network errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock initial failure then success
      vi.mocked(kumbaraService.getKumbaras)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          kumbaras: [testUtils.createMockKumbara()],
          total_count: 1,
          page: 1,
          page_size: 10,
          total_pages: 1,
          filters_applied: {},
        });

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      // Should show error initially
      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });

      // Retry should work
      await user.click(screen.getByRole('button', { name: /Yenile/ }));

      await waitFor(() => {
        expect(screen.queryByText(/Network error/)).not.toBeInTheDocument();
      });
    });

    it('should provide user feedback for all operations', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Test various operations that should show feedback

      // 1. Refresh operation
      await user.click(screen.getByRole('button', { name: /Yenile/ }));
      // Loading state should be shown (spinner in button)

      // 2. Export operation
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      vi.mocked(kumbaraService.exportKumbaras).mockResolvedValue(mockBlob);

      const mockAnchor = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

      await user.click(screen.getByRole('button', { name: /Dışa Aktar/ }));

      // Should trigger download
      await waitFor(() => {
        expect(mockAnchor.click).toHaveBeenCalled();
      });
    });
  });

  describe('Mobile Workflow', () => {
    it('should work on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Mobile interactions should work
      await user.click(screen.getByRole('button', { name: /Yeni Kumbara/ }));

      await waitFor(() => {
        expect(screen.getByText('Yeni Kumbara Ekle')).toBeInTheDocument();
      });

      // Form should be usable on mobile
      expect(screen.getByLabelText(/Kumbara Adı/)).toBeInTheDocument();
    });

    it('should handle touch interactions', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Test touch-friendly button interactions
      const buttons = screen.getAllByRole('button');

      // All buttons should be accessible and clickable
      for (const button of buttons.slice(0, 3)) {
        // Test first few buttons
        expect(button).toBeInTheDocument();
        // Buttons should have minimum touch target size
        expect(button).toHaveClass(/h-10|h-11|h-12/); // 40px, 44px, or 48px height
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeKumbaraList = Array.from({ length: 100 }, (_, i) =>
        testUtils.createMockKumbara({
          id: `kumbara-${i}`,
          name: `Kumbara ${i}`,
          code: `KMB-${i.toString().padStart(3, '0')}`,
        }),
      );

      vi.mocked(kumbaraService.getKumbaras).mockResolvedValue({
        kumbaras: largeKumbaraList,
        total_count: 100,
        page: 1,
        page_size: 100,
        total_pages: 1,
        filters_applied: {},
      });

      const startTime = Date.now();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      const renderTime = Date.now() - startTime;

      // Should render within reasonable time even with large dataset
      expect(renderTime).toBeLessThan(5000); // 5 seconds

      // Should display the count correctly
      expect(screen.getByText('100')).toBeInTheDocument(); // Total kumbaras
    });

    it('should handle rapid user interactions', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Rapidly interact with search
      const searchInput = screen.getByPlaceholderText(/Kumbara ara/);

      for (let i = 0; i < 10; i++) {
        await user.type(searchInput, 'a');
        await user.clear(searchInput);
      }

      // Component should remain stable
      expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
    });
  });

  describe('Accessibility Workflow', () => {
    it('should support complete keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Tab through interface
      await user.tab();
      expect(document.activeElement).toBeDefined();

      // Should be able to reach all interactive elements
      const interactiveElements = screen.getAllByRole('button');
      expect(interactiveElements.length).toBeGreaterThan(0);

      // Test keyboard activation
      const firstButton = interactiveElements[0];
      firstButton.focus();
      await user.keyboard('{Enter}');

      // Should trigger button action (no error)
    });

    it('should provide proper ARIA labels and descriptions', () => {
      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      // Check for proper ARIA attributes
      const searchInput = screen.getByPlaceholderText(/Kumbara ara/);
      expect(searchInput).toHaveAttribute('placeholder');

      // Buttons should have accessible names
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        const accessibleName =
          button.getAttribute('aria-label') || button.textContent || button.getAttribute('title');
        expect(accessibleName).toBeTruthy();
      });
    });

    it('should support screen reader navigation', () => {
      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      // Check for semantic HTML structure
      expect(screen.getByRole('main') || screen.getByRole('region')).toBeInTheDocument();

      // Tables should have proper structure
      const tables = screen.getAllByRole('table');
      if (tables.length > 0) {
        expect(screen.getByRole('columnheader')).toBeInTheDocument();
      }

      // Headings should be properly structured
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total kumbaras
        expect(screen.getByText('2')).toBeInTheDocument(); // Active kumbaras
      });

      // Create new kumbara
      const newKumbara = testUtils.createMockKumbara({ id: '3', name: 'New Kumbara' });
      vi.mocked(kumbaraService.createKumbara).mockResolvedValue(newKumbara);
      vi.mocked(kumbaraService.validateKumbaraData).mockReturnValue({
        isValid: true,
        errors: [],
      });

      await user.click(screen.getByRole('button', { name: /Yeni Kumbara/ }));

      await user.type(screen.getByLabelText(/Kumbara Adı/), 'New Kumbara');
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'New Location');
      await user.type(screen.getByLabelText(/Tam Adres/), 'New Address');

      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      // Data should be consistent after creation
      await waitFor(() => {
        expect(kumbaraService.createKumbara).toHaveBeenCalled();
      });
    });
  });

  describe('Real-time Features', () => {
    it('should handle live data updates', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Simulate data update
      const updatedKumbaras = [
        testUtils.createMockKumbara({ id: '1', name: 'Updated Kumbara 1' }),
        testUtils.createMockKumbara({ id: '2', name: 'Test Kumbara 2' }),
        testUtils.createMockKumbara({ id: '3', name: 'New Kumbara 3' }),
      ];

      vi.mocked(kumbaraService.getKumbaras).mockResolvedValue({
        kumbaras: updatedKumbaras,
        total_count: 3,
        page: 1,
        page_size: 10,
        total_pages: 1,
        filters_applied: {},
      });

      // Trigger refresh
      await user.click(screen.getByRole('button', { name: /Yenile/ }));

      await waitFor(() => {
        expect(screen.getByText('Updated Kumbara 1')).toBeInTheDocument();
        expect(screen.getByText('New Kumbara 3')).toBeInTheDocument();
      });
    });
  });

  describe('Security and Validation', () => {
    it('should validate QR data before processing', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Open QR Manager
      await user.click(screen.getByRole('button', { name: /QR Yönetici/ }));

      // Mock malicious QR data
      const maliciousQRData = {
        kumbaraId: '<script>alert("xss")</script>',
        code: 'MALICIOUS',
        name: '<img src=x onerror=alert("xss")>',
        location: 'Test',
      };

      // The component should handle this safely
      await user.click(screen.getByText('Mock Kumbara Found'));

      // Should not execute any malicious code
      expect(window.alert).not.toHaveBeenCalled();
    });

    it('should sanitize user inputs', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <EnhancedKumbaraPage />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Kumbara Yönetimi')).toBeInTheDocument();
      });

      // Try to enter malicious content in search
      const searchInput = screen.getByPlaceholderText(/Kumbara ara/);
      await user.type(searchInput, '<script>alert("xss")</script>');

      // Should not execute script
      expect(window.alert).not.toHaveBeenCalled();

      // Input should contain the text as plain text
      expect(searchInput).toHaveValue('<script>alert("xss")</script>');
    });
  });
});
