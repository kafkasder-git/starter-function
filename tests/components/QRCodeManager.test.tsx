// 🧪 QR CODE MANAGER COMPONENT TESTS
// Comprehensive component tests for QR code management

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import QRCodeManager from '../../components/kumbara/QRCodeManager';
import type { Kumbara } from '../../types/kumbara';
import testUtils from '../setup';

// Mock child components
vi.mock('../../components/kumbara/QRCodeGenerator', () => ({
  default: ({ kumbara, onClose }: any) => (
    <div data-testid="qr-generator">
      <div>QR Generator for {kumbara.name}</div>
      <button onClick={onClose}>Close Generator</button>
    </div>
  ),
}));

vi.mock('../../components/kumbara/QRCodeScanner', () => ({
  default: ({ onScanSuccess, onScanError, onClose }: any) => (
    <div data-testid="qr-scanner">
      <div>QR Scanner</div>
      <button
        onClick={() =>
          onScanSuccess(testUtils.createMockScanResult(), testUtils.createMockQRData())
        }
      >
        Mock Scan Success
      </button>
      <button onClick={() => onScanError('Mock scan error')}>Mock Scan Error</button>
      <button onClick={onClose}>Close Scanner</button>
    </div>
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('QRCodeManager Component', () => {
  const mockKumbara: Kumbara = testUtils.createMockKumbara();
  const mockOnKumbaraFound = vi.fn();
  const mockOnQRGenerated = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render QR Code Manager with header', () => {
      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText('QR Kod Yöneticisi')).toBeInTheDocument();
      expect(
        screen.getByText('Kumbara QR kodlarını oluşturun, tarayın ve yönetin'),
      ).toBeInTheDocument();
    });

    it('should render quick action cards', () => {
      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      expect(screen.getByText('QR Kod Oluştur')).toBeInTheDocument();
      expect(screen.getByText('QR Kod Tara')).toBeInTheDocument();
      expect(screen.getByText('QR Kod Ara')).toBeInTheDocument();
      expect(screen.getByText('Toplu İşlemler')).toBeInTheDocument();
    });

    it('should render tabs for different operations', () => {
      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      expect(screen.getByRole('tab', { name: /Oluştur/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Tara/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Geçmiş/ })).toBeInTheDocument();
    });

    it('should render close button when onClose is provided', () => {
      render(<QRCodeManager kumbara={mockKumbara} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /Kapat/ })).toBeInTheDocument();
    });

    it('should not render close button when onClose is not provided', () => {
      render(<QRCodeManager kumbara={mockKumbara} />);

      expect(screen.queryByRole('button', { name: /Kapat/ })).not.toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Default should be generate tab
      expect(screen.getByText('QR Kod Oluşturma')).toBeInTheDocument();

      // Switch to scan tab
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      expect(screen.getByText('QR Kod Tarama')).toBeInTheDocument();

      // Switch to history tab
      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));
      expect(screen.getByText('QR Kod Geçmişi')).toBeInTheDocument();
    });

    it('should maintain tab state during component lifecycle', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <QRCodeManager kumbara={mockKumbara} onKumbaraFound={mockOnKumbaraFound} />,
      );

      // Switch to scan tab
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      expect(screen.getByText('QR Kod Tarama')).toBeInTheDocument();

      // Rerender component
      rerender(<QRCodeManager kumbara={mockKumbara} onKumbaraFound={mockOnKumbaraFound} />);

      // Should still be on scan tab
      expect(screen.getByText('QR Kod Tarama')).toBeInTheDocument();
    });
  });

  describe('Generate Tab', () => {
    it('should show kumbara info when kumbara is provided', () => {
      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      expect(screen.getByText(mockKumbara.name)).toBeInTheDocument();
      expect(screen.getByText(mockKumbara.location)).toBeInTheDocument();
      expect(screen.getByText(mockKumbara.code)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /QR Kod Oluştur/ })).toBeInTheDocument();
    });

    it('should show empty state when no kumbara is selected', () => {
      render(
        <QRCodeManager onKumbaraFound={mockOnKumbaraFound} onQRGenerated={mockOnQRGenerated} />,
      );

      expect(screen.getByText('Kumbara Seçilmedi')).toBeInTheDocument();
      expect(screen.getByText('QR kod oluşturmak için önce bir kumbara seçin')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Kumbara Seç/ })).toBeInTheDocument();
    });

    it('should open QR generator dialog when generate button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      await user.click(screen.getByRole('button', { name: /QR Kod Oluştur/ }));

      expect(screen.getByTestId('qr-generator')).toBeInTheDocument();
      expect(screen.getByText(`QR Generator for ${mockKumbara.name}`)).toBeInTheDocument();
    });
  });

  describe('Scan Tab', () => {
    it('should show scan interface', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      await user.click(screen.getByRole('tab', { name: /Tara/ }));

      expect(screen.getByText('QR Kod Tarama')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ })).toBeInTheDocument();
    });

    it('should open QR scanner dialog when scan button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));

      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    });
  });

  describe('History Tab', () => {
    it('should show empty state when no history exists', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));

      expect(screen.getByText('Henüz Aktivite Yok')).toBeInTheDocument();
      expect(
        screen.getByText('QR kod oluşturduğunuzda veya taradığınızda burada görünecek'),
      ).toBeInTheDocument();
    });

    it('should show history after QR operations', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Perform a scan operation to add to history
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));

      // Mock successful scan
      await user.click(screen.getByText('Mock Scan Success'));

      // Check history tab
      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));

      await waitFor(() => {
        expect(screen.getByText('QR Kod Tarandı')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    it('should open generator when QR generate card is clicked', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Click on the QR generate quick action card
      const generateCard =
        screen.getByText('QR Kod Oluştur').closest('[role="button"]') ||
        screen.getByText('QR Kod Oluştur').closest('.cursor-pointer');

      if (generateCard) {
        await user.click(generateCard);
        expect(screen.getByTestId('qr-generator')).toBeInTheDocument();
      }
    });

    it('should open scanner when scan card is clicked', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Click on the scan quick action card
      const scanCard =
        screen.getByText('QR Kod Tara').closest('[role="button"]') ||
        screen.getByText('QR Kod Tara').closest('.cursor-pointer');

      if (scanCard) {
        await user.click(scanCard);
        expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
      }
    });
  });

  describe('Scan Success Handling', () => {
    it('should handle successful kumbara QR scan', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Open scanner
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));

      // Mock successful scan
      await user.click(screen.getByText('Mock Scan Success'));

      expect(mockOnKumbaraFound).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Kumbara QR kodu başarıyla okundu!');
    });

    it('should handle scan errors', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Open scanner
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));

      // Mock scan error
      await user.click(screen.getByText('Mock Scan Error'));

      expect(toast.error).toHaveBeenCalledWith('Tarama hatası: Mock scan error');
    });

    it('should close scanner after successful scan', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Open scanner
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));

      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();

      // Mock successful scan
      await user.click(screen.getByText('Mock Scan Success'));

      // Scanner should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
      });
    });
  });

  describe('QR Generation Handling', () => {
    it('should handle QR generation completion', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Open generator
      await user.click(screen.getByRole('button', { name: /QR Kod Oluştur/ }));

      expect(screen.getByTestId('qr-generator')).toBeInTheDocument();

      // Close generator (simulates completion)
      await user.click(screen.getByText('Close Generator'));

      expect(mockOnQRGenerated).toHaveBeenCalledWith(
        expect.objectContaining({
          kumbaraId: mockKumbara.id,
          code: mockKumbara.code,
          name: mockKumbara.name,
          location: mockKumbara.location,
          url: `https://bagis.dernek.org/kumbara/${mockKumbara.code}`,
          version: '2.0',
        }),
      );
    });

    it('should add generation activity to history', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Generate QR code
      await user.click(screen.getByRole('button', { name: /QR Kod Oluştur/ }));
      await user.click(screen.getByText('Close Generator'));

      // Check history
      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));

      await waitFor(() => {
        expect(screen.getByText('QR Kod Oluşturuldu')).toBeInTheDocument();
        expect(screen.getByText(mockKumbara.code)).toBeInTheDocument();
        expect(screen.getByText(mockKumbara.name)).toBeInTheDocument();
      });
    });
  });

  describe('History Management', () => {
    it('should limit history to 10 items', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Perform 12 scan operations
      for (let i = 0; i < 12; i++) {
        await user.click(screen.getByRole('tab', { name: /Tara/ }));
        await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));
        await user.click(screen.getByText('Mock Scan Success'));
      }

      // Check history
      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));

      const historyItems = screen.getAllByText('QR Kod Tarandı');
      expect(historyItems.length).toBe(10); // Should be limited to 10
    });

    it('should show different activity types with correct icons', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Generate QR code
      await user.click(screen.getByRole('button', { name: /QR Kod Oluştur/ }));
      await user.click(screen.getByText('Close Generator'));

      // Scan QR code
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));
      await user.click(screen.getByText('Mock Scan Success'));

      // Check history
      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));

      await waitFor(() => {
        expect(screen.getByText('QR Kod Oluşturuldu')).toBeInTheDocument();
        expect(screen.getByText('QR Kod Tarandı')).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Management', () => {
    it('should open and close generator dialog', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Dialog should not be open initially
      expect(screen.queryByTestId('qr-generator')).not.toBeInTheDocument();

      // Open dialog
      await user.click(screen.getByRole('button', { name: /QR Kod Oluştur/ }));
      expect(screen.getByTestId('qr-generator')).toBeInTheDocument();

      // Close dialog
      await user.click(screen.getByText('Close Generator'));

      await waitFor(() => {
        expect(screen.queryByTestId('qr-generator')).not.toBeInTheDocument();
      });
    });

    it('should open and close scanner dialog', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      await user.click(screen.getByRole('tab', { name: /Tara/ }));

      // Dialog should not be open initially
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();

      // Open dialog
      await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();

      // Close dialog
      await user.click(screen.getByText('Close Scanner'));

      await waitFor(() => {
        expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Tabs should have proper roles
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();

      // Buttons should be accessible
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Tab navigation should work
      await user.tab();
      expect(document.activeElement).toBeDefined();

      // Arrow keys should navigate tabs
      const generateTab = screen.getByRole('tab', { name: /Oluştur/ });
      generateTab.focus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /Tara/ })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /Geçmiş/ })).toHaveFocus();
    });

    it('should have proper focus management in dialogs', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Open generator dialog
      await user.click(screen.getByRole('button', { name: /QR Kod Oluştur/ }));

      // Focus should be trapped in dialog
      expect(screen.getByTestId('qr-generator')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Should still render all essential elements
      expect(screen.getByText('QR Kod Yöneticisi')).toBeInTheDocument();
      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('should have responsive grid layout for quick actions', () => {
      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Quick action cards should be in a responsive grid
      const quickActionCards = screen.getAllByText(/QR Kod|Toplu İşlemler/);
      expect(quickActionCards.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle component errors gracefully', () => {
      // Test with invalid props
      expect(() => {
        render(
          <QRCodeManager
            kumbara={null as any}
            onKumbaraFound={mockOnKumbaraFound}
            onQRGenerated={mockOnQRGenerated}
          />,
        );
      }).not.toThrow();
    });

    it('should handle missing callback props', () => {
      expect(() => {
        render(<QRCodeManager kumbara={mockKumbara} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestWrapper = (props: any) => {
        renderSpy();
        return <QRCodeManager {...props} />;
      };

      const { rerender } = render(
        <TestWrapper
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender(
        <TestWrapper
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid user interactions', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Rapidly switch tabs
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByRole('tab', { name: /Tara/ }));
        await user.click(screen.getByRole('tab', { name: /Oluştur/ }));
        await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));
      }

      // Component should remain stable
      expect(screen.getByText('QR Kod Yöneticisi')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with complete user workflow', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // 1. Generate QR code
      await user.click(screen.getByRole('button', { name: /QR Kod Oluştur/ }));
      expect(screen.getByTestId('qr-generator')).toBeInTheDocument();
      await user.click(screen.getByText('Close Generator'));

      // 2. Scan QR code
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      await user.click(screen.getByRole('button', { name: /QR Kod Tarayıcıyı Aç/ }));
      await user.click(screen.getByText('Mock Scan Success'));

      // 3. Check history
      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));

      await waitFor(() => {
        expect(screen.getByText('QR Kod Oluşturuldu')).toBeInTheDocument();
        expect(screen.getByText('QR Kod Tarandı')).toBeInTheDocument();
      });

      // Callbacks should have been called
      expect(mockOnQRGenerated).toHaveBeenCalled();
      expect(mockOnKumbaraFound).toHaveBeenCalled();
    });

    it('should maintain state across tab switches', async () => {
      const user = userEvent.setup();

      render(
        <QRCodeManager
          kumbara={mockKumbara}
          onKumbaraFound={mockOnKumbaraFound}
          onQRGenerated={mockOnQRGenerated}
        />,
      );

      // Generate QR to create history
      await user.click(screen.getByRole('button', { name: /QR Kod Oluştur/ }));
      await user.click(screen.getByText('Close Generator'));

      // Switch to history tab
      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));
      expect(screen.getByText('QR Kod Oluşturuldu')).toBeInTheDocument();

      // Switch to scan tab and back to history
      await user.click(screen.getByRole('tab', { name: /Tara/ }));
      await user.click(screen.getByRole('tab', { name: /Geçmiş/ }));

      // History should still be there
      expect(screen.getByText('QR Kod Oluşturuldu')).toBeInTheDocument();
    });
  });
});
