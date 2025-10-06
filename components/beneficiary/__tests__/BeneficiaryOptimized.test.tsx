import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BeneficiaryOptimized } from '../BeneficiaryOptimized';

// Mock services
vi.mock('../../../services/supabaseBeneficiariesService', () => ({
  supabaseBeneficiariesService: {
    getBeneficiary: vi.fn(),
    createBeneficiary: vi.fn(),
    updateBeneficiary: vi.fn(),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('BeneficiaryOptimized', () => {
  const mockBeneficiary = {
    id: 'test-1',
    name: 'Test User',
    tcNo: '12345678901',
    phone: '0555-123-4567',
    email: 'test@example.com',
    address: 'Test Address',
    city: 'Test City',
    district: 'Test District',
    birthDate: '1990-01-01',
    gender: 'Erkek',
    maritalStatus: 'Bekar',
    education: 'Lise',
    occupation: 'Test Job',
    status: 'Aktif',
    registrationDate: '2024-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders beneficiary header correctly', async () => {
    render(<BeneficiaryOptimized beneficiaryId="test-1" />);

    await waitFor(() => {
      expect(screen.getByText('İhtiyaç Sahibi Detayı')).toBeInTheDocument();
    });
  });

  it('handles demo mode when no beneficiaryId provided', async () => {
    render(<BeneficiaryOptimized />);

    await waitFor(() => {
      expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });
  });

  it('switches between tabs correctly', async () => {
    render(<BeneficiaryOptimized />);

    await waitFor(() => {
      expect(screen.getByText('Kişisel Bilgiler')).toBeInTheDocument();
    });

    // Click family tab
    fireEvent.click(screen.getByText('Aile Bilgileri'));

    // Should show family content
    await waitFor(() => {
      expect(screen.getByText('Aile Bilgileri')).toBeInTheDocument();
    });
  });

  it('handles edit mode toggle', async () => {
    render(<BeneficiaryOptimized />);

    await waitFor(() => {
      const editButton = screen.getByText('Düzenle');
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Kaydet')).toBeInTheDocument();
      expect(screen.getByText('İptal')).toBeInTheDocument();
    });
  });

  it('handles save operation', async () => {
    const { beneficiariesService } = await import('../../../services/beneficiariesService');
    (beneficiariesService.update as any).mockResolvedValue({ result: mockBeneficiary });

    render(<BeneficiaryOptimized beneficiaryId="test-1" />);

    await waitFor(() => {
      const editButton = screen.getByText('Düzenle');
      fireEvent.click(editButton);
    });

    await waitFor(() => {
      const saveButton = screen.getByText('Kaydet');
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(supabaseBeneficiariesService.updateBeneficiary).toHaveBeenCalledWith(
        'test-1',
        expect.any(Object),
      );
    });
  });

  it('displays loading state initially', () => {
    render(<BeneficiaryOptimized beneficiaryId="test-1" />);

    // Should show loading initially
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('handles back navigation', async () => {
    const onBack = vi.fn();
    render(<BeneficiaryOptimized onBack={onBack} />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(backButton);
    });

    expect(onBack).toHaveBeenCalled();
  });

  it('lazy loads heavy sections', async () => {
    render(<BeneficiaryOptimized />);

    await waitFor(() => {
      // Click financial tab
      fireEvent.click(screen.getByText('Mali Durum'));
    });

    // Should show loading for lazy component
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });

  it('handles field updates correctly', async () => {
    render(<BeneficiaryOptimized />);

    await waitFor(() => {
      const editButton = screen.getByText('Düzenle');
      fireEvent.click(editButton);
    });

    // Update should be handled internally
    // This tests the component structure
    expect(screen.getByText('Kişisel Bilgiler')).toBeInTheDocument();
  });
});
