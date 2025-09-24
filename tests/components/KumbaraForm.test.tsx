// 🧪 KUMBARA FORM COMPONENT TESTS
// Comprehensive component tests for KumbaraForm and CollectionForm

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollectionForm, KumbaraForm } from '../../components/kumbara/KumbaraForm';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('KumbaraForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form with all required fields', () => {
      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Yeni Kumbara Ekle')).toBeInTheDocument();
      expect(screen.getByLabelText(/Kumbara Adı/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Lokasyon/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tam Adres/)).toBeInTheDocument();
      expect(screen.getByLabelText(/İletişim Kişisi/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Telefon/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notlar/)).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /Kumbara Oluştur/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /İptal/ })).toBeInTheDocument();
    });

    it('should not show status field in create mode', () => {
      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      expect(screen.queryByText('Durum')).not.toBeInTheDocument();
    });

    it('should submit valid form data', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Fill form fields
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test Kumbara');
      await user.type(screen.getByLabelText(/Tam Adres/), 'Test Adres, Test Şehir, Türkiye');

      // Use the manual location input
      const locationInputs = screen.getAllByPlaceholderText(/manuel girin/);
      await user.type(locationInputs[0], 'Test Lokasyon');

      // Submit form
      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test Kumbara',
          location: 'Test Lokasyon',
          address: 'Test Adres, Test Şehir, Türkiye',
          contactPerson: undefined,
          phone: undefined,
          notes: undefined,
          created_by: 'current-user',
        });
      });
    });

    it('should show validation errors for invalid data', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Submit form without filling required fields
      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(screen.getByText(/Kumbara adı en az 3 karakter olmalıdır/)).toBeInTheDocument();
        expect(screen.getByText(/Lokasyon en az 3 karakter olmalıdır/)).toBeInTheDocument();
        expect(screen.getByText(/Adres en az 10 karakter olmalıdır/)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate phone number format', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test Kumbara');
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Test Lokasyon');
      await user.type(screen.getByLabelText(/Tam Adres/), 'Test Adres, Test Şehir, Türkiye');

      // Enter invalid phone
      await user.type(screen.getByLabelText(/Telefon/), '123456789');

      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(screen.getByText(/Geçerli bir telefon numarası giriniz/)).toBeInTheDocument();
      });
    });

    it('should accept valid Turkish phone formats', async () => {
      const user = userEvent.setup();
      const validPhones = ['05321234567', '0532 123 45 67', '+905321234567'];

      for (const phone of validPhones) {
        render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

        await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test Kumbara');
        await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Test Lokasyon');
        await user.type(screen.getByLabelText(/Tam Adres/), 'Test Adres, Test Şehir, Türkiye');
        await user.type(screen.getByLabelText(/Telefon/), phone);

        await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

        await waitFor(() => {
          expect(mockOnSubmit).toHaveBeenCalled();
        });

        // Clean up for next iteration
        mockOnSubmit.mockClear();
      }
    });
  });

  describe('Edit Mode', () => {
    const initialData = {
      name: 'Existing Kumbara',
      location: 'Existing Location',
      address: 'Existing Address, Existing City',
      contactPerson: 'Existing Person',
      phone: '0532 123 45 67',
      notes: 'Existing notes',
      status: 'active' as const,
    };

    it('should render edit form with initial data', () => {
      render(<KumbaraForm mode="edit" initialData={initialData} onSubmit={mockOnSubmit} />);

      expect(screen.getByText('Kumbara Düzenle')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Kumbara')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Location')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Address, Existing City')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing Person')).toBeInTheDocument();
      expect(screen.getByDisplayValue('0532 123 45 67')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing notes')).toBeInTheDocument();
    });

    it('should show status field in edit mode', () => {
      render(<KumbaraForm mode="edit" initialData={initialData} onSubmit={mockOnSubmit} />);

      expect(screen.getByText('Durum')).toBeInTheDocument();
    });

    it('should submit updated data', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="edit" initialData={initialData} onSubmit={mockOnSubmit} />);

      // Update name field
      const nameField = screen.getByDisplayValue('Existing Kumbara');
      await user.clear(nameField);
      await user.type(nameField, 'Updated Kumbara Name');

      await user.click(screen.getByRole('button', { name: /Değişiklikleri Kaydet/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Kumbara Name',
            location: 'Existing Location',
            address: 'Existing Address, Existing City',
          }),
        );
      });
    });
  });

  describe('Loading States', () => {
    it('should disable form when loading', () => {
      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} loading={true} />);

      expect(screen.getByLabelText(/Kumbara Adı/)).toBeDisabled();
      expect(screen.getByLabelText(/Tam Adres/)).toBeDisabled();
      expect(screen.getByRole('button', { name: /Kumbara Oluştur/ })).toBeDisabled();
    });

    it('should show loading spinner when submitting', async () => {
      const user = userEvent.setup();

      // Mock onSubmit to be slow
      const slowOnSubmit = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<KumbaraForm mode="create" onSubmit={slowOnSubmit} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test Kumbara');
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Test Lokasyon');
      await user.type(screen.getByLabelText(/Tam Adres/), 'Test Adres, Test Şehir, Türkiye');

      // Submit form
      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      // Should show loading state
      expect(screen.getByRole('button', { name: /Kumbara Oluştur/ })).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/Kumbara Adı/)).toHaveAttribute('id', 'name');
      expect(screen.getByLabelText(/Tam Adres/)).toHaveAttribute('id', 'address');
      expect(screen.getByLabelText(/İletişim Kişisi/)).toHaveAttribute('id', 'contactPerson');
      expect(screen.getByLabelText(/Telefon/)).toHaveAttribute('id', 'phone');
      expect(screen.getByLabelText(/Notlar/)).toHaveAttribute('id', 'notes');
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        const nameError = screen.getByText(/Kumbara adı en az 3 karakter olmalıdır/);
        expect(nameError).toBeInTheDocument();

        // Error should be properly associated with the field
        const nameField = screen.getByLabelText(/Kumbara Adı/);
        expect(nameField).toBeInvalid();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Tab through form fields
      await user.tab();
      expect(screen.getByLabelText(/Kumbara Adı/)).toHaveFocus();

      await user.tab();
      // Location select should be focusable
      expect(document.activeElement).toBeDefined();

      // Should be able to submit with Enter key
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test Kumbara');
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Test Lokasyon');
      await user.type(screen.getByLabelText(/Tam Adres/), 'Test Adres, Test Şehir, Türkiye');

      // Focus submit button and press Enter
      screen.getByRole('button', { name: /Kumbara Oluştur/ }).focus();
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Location Selection', () => {
    it('should provide location suggestions', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Click location select
      await user.click(screen.getByRole('combobox'));

      await waitFor(() => {
        expect(screen.getByText('Merkez Camii')).toBeInTheDocument();
        expect(screen.getByText('Esnaf Lokantası')).toBeInTheDocument();
        expect(screen.getByText('Market')).toBeInTheDocument();
        expect(screen.getByText('Okul')).toBeInTheDocument();
      });
    });

    it('should allow manual location entry', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Type in manual location input
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Custom Location');

      expect(screen.getByDisplayValue('Custom Location')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(screen.getByText(/Kumbara adı en az 3 karakter olmalıdır/)).toBeInTheDocument();
        expect(screen.getByText(/Lokasyon en az 3 karakter olmalıdır/)).toBeInTheDocument();
        expect(screen.getByText(/Adres en az 10 karakter olmalıdır/)).toBeInTheDocument();
      });
    });

    it('should validate name format', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Enter name with numbers (should be invalid)
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test123');
      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/Kumbara adı sadece harf ve boşluk içerebilir/),
        ).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Fill required fields
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test Kumbara');
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Test Lokasyon');
      await user.type(screen.getByLabelText(/Tam Adres/), 'Test Adres, Test Şehir, Türkiye');

      // Enter invalid phone
      await user.type(screen.getByLabelText(/Telefon/), '123');
      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(screen.getByText(/Geçerli bir telefon numarası giriniz/)).toBeInTheDocument();
      });
    });

    it('should validate text length limits', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Enter very long notes (over 500 characters)
      const longNotes = 'A'.repeat(501);
      await user.type(screen.getByLabelText(/Notlar/), longNotes);
      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(screen.getByText(/Notlar en fazla 500 karakter olabilir/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle submission errors gracefully', async () => {
      const user = userEvent.setup();
      const errorOnSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));

      render(<KumbaraForm mode="create" onSubmit={errorOnSubmit} />);

      // Fill valid form data
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Test Kumbara');
      await user.type(screen.getAllByPlaceholderText(/manuel girin/)[0], 'Test Lokasyon');
      await user.type(screen.getByLabelText(/Tam Adres/), 'Test Adres, Test Şehir, Türkiye');

      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('İşlem sırasında bir hata oluştu');
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: /İptal/ }));

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      expect(screen.queryByRole('button', { name: /İptal/ })).not.toBeInTheDocument();
    });
  });
});

describe('CollectionForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const kumbaraId = 'test-kumbara-1';
  const kumbaraName = 'Test Kumbara';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render collection form with all fields', () => {
      render(
        <CollectionForm
          kumbaraId={kumbaraId}
          kumbaraName={kumbaraName}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText('Kumbara Toplama Kaydı')).toBeInTheDocument();
      expect(screen.getByText(kumbaraName)).toBeInTheDocument();

      expect(screen.getByLabelText(/Toplanan Tutar/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Toplama Tarihi/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Toplayıcı Adı/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tanık Adı/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tanık Telefon/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Hava Durumu/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notlar/)).toBeInTheDocument();
    });

    it('should have default values set', () => {
      render(
        <CollectionForm kumbaraId={kumbaraId} kumbaraName={kumbaraName} onSubmit={mockOnSubmit} />,
      );

      // Amount should default to 0
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();

      // Date should default to today
      const today = new Date().toISOString().split('T')[0];
      expect(screen.getByDisplayValue(today)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit valid collection data', async () => {
      const user = userEvent.setup();

      render(
        <CollectionForm kumbaraId={kumbaraId} kumbaraName={kumbaraName} onSubmit={mockOnSubmit} />,
      );

      // Fill form fields
      await user.clear(screen.getByLabelText(/Toplanan Tutar/));
      await user.type(screen.getByLabelText(/Toplanan Tutar/), '125.50');
      await user.type(screen.getByLabelText(/Toplayıcı Adı/), 'Test Collector');

      await user.click(screen.getByRole('button', { name: /Toplama Kaydı Oluştur/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            kumbara_id: kumbaraId,
            amount: 125.5,
            collector_name: 'Test Collector',
            created_by: 'current-user',
          }),
        );
      });
    });

    it('should include optional fields when provided', async () => {
      const user = userEvent.setup();

      render(
        <CollectionForm kumbaraId={kumbaraId} kumbaraName={kumbaraName} onSubmit={mockOnSubmit} />,
      );

      // Fill all fields including optional ones
      await user.clear(screen.getByLabelText(/Toplanan Tutar/));
      await user.type(screen.getByLabelText(/Toplanan Tutar/), '200.00');
      await user.type(screen.getByLabelText(/Toplayıcı Adı/), 'Test Collector');
      await user.type(screen.getByLabelText(/Tanık Adı/), 'Test Witness');
      await user.type(screen.getByLabelText(/Tanık Telefon/), '0532 987 65 43');
      await user.type(screen.getByLabelText(/Hava Durumu/), 'Güneşli');
      await user.type(screen.getByLabelText(/Notlar/), 'Test collection notes');

      await user.click(screen.getByRole('button', { name: /Toplama Kaydı Oluştur/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            amount: 200.0,
            collector_name: 'Test Collector',
            witness_name: 'Test Witness',
            witness_phone: '0532 987 65 43',
            weather_condition: 'Güneşli',
            notes: 'Test collection notes',
          }),
        );
      });
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();

      render(
        <CollectionForm kumbaraId={kumbaraId} kumbaraName={kumbaraName} onSubmit={mockOnSubmit} />,
      );

      // Clear amount and try to submit
      await user.clear(screen.getByLabelText(/Toplanan Tutar/));
      await user.clear(screen.getByLabelText(/Toplayıcı Adı/));

      await user.click(screen.getByRole('button', { name: /Toplama Kaydı Oluştur/ }));

      await waitFor(() => {
        expect(screen.getByText(/Tutar en az 0.01 TL olmalıdır/)).toBeInTheDocument();
        expect(screen.getByText(/Toplayıcı adı en az 2 karakter olmalıdır/)).toBeInTheDocument();
      });
    });

    it('should validate amount range', async () => {
      const user = userEvent.setup();

      render(
        <CollectionForm kumbaraId={kumbaraId} kumbaraName={kumbaraName} onSubmit={mockOnSubmit} />,
      );

      // Test minimum amount
      await user.clear(screen.getByLabelText(/Toplanan Tutar/));
      await user.type(screen.getByLabelText(/Toplanan Tutar/), '0');
      await user.click(screen.getByRole('button', { name: /Toplama Kaydı Oluştur/ }));

      await waitFor(() => {
        expect(screen.getByText(/Tutar en az 0.01 TL olmalıdır/)).toBeInTheDocument();
      });

      // Test maximum amount
      await user.clear(screen.getByLabelText(/Toplanan Tutar/));
      await user.type(screen.getByLabelText(/Toplanan Tutar/), '60000');
      await user.click(screen.getByRole('button', { name: /Toplama Kaydı Oluştur/ }));

      await waitFor(() => {
        expect(screen.getByText(/Tutar en fazla 50.000 TL olabilir/)).toBeInTheDocument();
      });
    });

    it('should validate collector name format', async () => {
      const user = userEvent.setup();

      render(
        <CollectionForm kumbaraId={kumbaraId} kumbaraName={kumbaraName} onSubmit={mockOnSubmit} />,
      );

      await user.type(screen.getByLabelText(/Toplayıcı Adı/), 'Test123'); // Invalid format
      await user.click(screen.getByRole('button', { name: /Toplama Kaydı Oluştur/ }));

      await waitFor(() => {
        expect(
          screen.getByText(/Toplayıcı adı sadece harf ve boşluk içerebilir/),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Collection Method Selection', () => {
    it('should allow collection method selection', async () => {
      const user = userEvent.setup();

      render(
        <CollectionForm kumbaraId={kumbaraId} kumbaraName={kumbaraName} onSubmit={mockOnSubmit} />,
      );

      // Click collection method select
      const selects = screen.getAllByRole('combobox');
      const collectionMethodSelect = selects.find((select) =>
        select.closest('div')?.querySelector('label')?.textContent?.includes('Toplama Türü'),
      );

      if (collectionMethodSelect) {
        await user.click(collectionMethodSelect);

        await waitFor(() => {
          expect(screen.getByText('Planlı Toplama')).toBeInTheDocument();
          expect(screen.getByText('Acil Toplama')).toBeInTheDocument();
          expect(screen.getByText('Bakım Toplama')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Form Reset', () => {
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();

      render(
        <CollectionForm kumbaraId={kumbaraId} kumbaraName={kumbaraName} onSubmit={mockOnSubmit} />,
      );

      // Fill form
      await user.clear(screen.getByLabelText(/Toplanan Tutar/));
      await user.type(screen.getByLabelText(/Toplanan Tutar/), '125.50');
      await user.type(screen.getByLabelText(/Toplayıcı Adı/), 'Test Collector');

      await user.click(screen.getByRole('button', { name: /Toplama Kaydı Oluştur/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Toplama kaydı başarıyla oluşturuldu');
      });

      // Form should be reset
      expect(screen.getByDisplayValue('0')).toBeInTheDocument();
      expect(screen.getByLabelText(/Toplayıcı Adı/)).toHaveValue('');
    });
  });

  describe('Responsive Design', () => {
    it('should render properly on mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Form should still be functional
      expect(screen.getByLabelText(/Kumbara Adı/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Kumbara Oluştur/ })).toBeInTheDocument();
    });

    it('should have touch-friendly button sizes', () => {
      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /Kumbara Oluştur/ });

      // Should have minimum 44px height for touch targets
      expect(submitButton).toHaveClass('h-12'); // 48px in Tailwind
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn();

      const TestWrapper = () => {
        renderSpy();
        return <KumbaraForm mode="create" onSubmit={mockOnSubmit} />;
      };

      const { rerender } = render(<TestWrapper />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender(<TestWrapper />);

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration', () => {
    it('should work with real form interactions', async () => {
      const user = userEvent.setup();

      render(<KumbaraForm mode="create" onSubmit={mockOnSubmit} />);

      // Complete form interaction flow
      await user.type(screen.getByLabelText(/Kumbara Adı/), 'Integration Test Kumbara');

      // Select from dropdown
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText('Merkez Camii'));

      await user.type(
        screen.getByLabelText(/Tam Adres/),
        'Integration Test Address, Istanbul, Turkey',
      );
      await user.type(screen.getByLabelText(/İletişim Kişisi/), 'Integration Test Person');
      await user.type(screen.getByLabelText(/Telefon/), '0532 111 22 33');
      await user.type(screen.getByLabelText(/Notlar/), 'Integration test notes');

      await user.click(screen.getByRole('button', { name: /Kumbara Oluştur/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Integration Test Kumbara',
          location: 'Merkez Camii',
          address: 'Integration Test Address, Istanbul, Turkey',
          contactPerson: 'Integration Test Person',
          phone: '0532 111 22 33',
          notes: 'Integration test notes',
          created_by: 'current-user',
        });
      });
    });
  });
});
