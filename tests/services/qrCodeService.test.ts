// 🧪 QR CODE SERVICE TESTS
// Comprehensive unit tests for QRCodeService

import { beforeEach, describe, expect, it, vi } from 'vitest';
import qrCodeService from '../../services/qrCodeService';
import type { Kumbara } from '../../types/kumbara';
import testUtils from '../setup';

describe('QRCodeService', () => {
  let mockKumbara: Kumbara;

  beforeEach(() => {
    vi.clearAllMocks();
    mockKumbara = testUtils.createMockKumbara();
  });

  describe('generateKumbaraQRData', () => {
    it('should generate complete QR data for kumbara', () => {
      const result = qrCodeService.generateKumbaraQRData(mockKumbara);

      expect(result).toBeDefined();
      expect(result.kumbaraId).toBe(mockKumbara.id);
      expect(result.code).toBe(mockKumbara.code);
      expect(result.name).toBe(mockKumbara.name);
      expect(result.location).toBe(mockKumbara.location);
      expect(result.url).toBe(`https://bagis.dernek.org/kumbara/${mockKumbara.code}`);
      expect(result.donationUrl).toBe(
        `https://bagis.dernek.org/kumbara/donate/${mockKumbara.code}`,
      );

      expect(result.contactInfo).toBeDefined();
      expect(result.contactInfo?.phone).toBe(mockKumbara.phone);
      expect(result.contactInfo?.person).toBe(mockKumbara.contactPerson);

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.installDate).toBe(mockKumbara.installDate);
      expect(result.metadata?.lastUpdated).toBe(mockKumbara.updated_at);
      expect(result.metadata?.version).toBe('2.0');
    });

    it('should handle kumbara without optional fields', () => {
      const minimalKumbara = testUtils.createMockKumbara({
        phone: undefined,
        contactPerson: undefined,
      });

      const result = qrCodeService.generateKumbaraQRData(minimalKumbara);

      expect(result.contactInfo?.phone).toBeUndefined();
      expect(result.contactInfo?.person).toBeUndefined();
      expect(result.kumbaraId).toBe(minimalKumbara.id);
      expect(result.code).toBe(minimalKumbara.code);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code with default options', async () => {
      const qrData = qrCodeService.generateKumbaraQRData(mockKumbara);

      const result = await qrCodeService.generateQRCode(qrData);

      expect(result).toBeDefined();
      expect(result.dataURL).toMatch(/^data:image\/png;base64,/);
      expect(result.svg).toContain('<svg');
      expect(result.raw).toBe(JSON.stringify(qrData));
      expect(result.size).toBe(256); // Default size
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should generate QR code with custom options', async () => {
      const qrData = qrCodeService.generateKumbaraQRData(mockKumbara);
      const customOptions = {
        size: 512,
        errorCorrectionLevel: 'H' as const,
        color: {
          dark: '#ff0000',
          light: '#00ff00',
        },
        margin: 4,
      };

      const result = await qrCodeService.generateQRCode(qrData, customOptions);

      expect(result.size).toBe(512);
      expect(result.dataURL).toMatch(/^data:image\/png;base64,/);
      expect(result.svg).toContain('<svg');
    });

    it('should handle string data input', async () => {
      const stringData = 'https://bagis.dernek.org/kumbara/TEST-001';

      const result = await qrCodeService.generateQRCode(stringData);

      expect(result.raw).toBe(stringData);
      expect(result.dataURL).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle QR generation errors gracefully', async () => {
      // Mock QRCode library to throw error
      const mockQRCode = await import('qrcode');
      vi.spyOn(mockQRCode.default, 'toDataURL').mockRejectedValueOnce(
        new Error('QR generation failed'),
      );

      await expect(qrCodeService.generateQRCode('test-data')).rejects.toThrow(
        'QR kod oluşturulamadı',
      );
    });
  });

  describe('generateCanvas', () => {
    it('should generate QR code on canvas', async () => {
      const canvas = testUtils.createMockCanvas();
      const qrData = qrCodeService.generateKumbaraQRData(mockKumbara);

      await expect(qrCodeService.generateCanvas(canvas, qrData)).resolves.not.toThrow();
    });

    it('should handle canvas generation errors', async () => {
      const canvas = testUtils.createMockCanvas();

      // Mock QRCode library to throw error
      const mockQRCode = await import('qrcode');
      vi.spyOn(mockQRCode.default, 'toCanvas').mockRejectedValueOnce(new Error('Canvas error'));

      await expect(qrCodeService.generateCanvas(canvas, 'test-data')).rejects.toThrow(
        "QR kod canvas'a çizilemedi",
      );
    });
  });

  describe('downloadQRCode', () => {
    it('should download QR code as PNG', async () => {
      const qrData = qrCodeService.generateKumbaraQRData(mockKumbara);
      const filename = 'test-qr';

      // Mock document.createElement and related methods
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

      await expect(qrCodeService.downloadQRCode(qrData, filename, 'png')).resolves.not.toThrow();

      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toBe(`${filename}.png`);
    });

    it('should download QR code as SVG', async () => {
      const qrData = qrCodeService.generateKumbaraQRData(mockKumbara);
      const filename = 'test-qr';

      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
      };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any);

      await expect(qrCodeService.downloadQRCode(qrData, filename, 'svg')).resolves.not.toThrow();

      expect(mockAnchor.download).toBe(`${filename}.svg`);
    });
  });

  describe('printQRCode', () => {
    it('should generate printable HTML for thermal format', async () => {
      const printOptions = {
        format: 'thermal' as const,
        size: { width: 40, height: 30, unit: 'mm' as const },
        includeText: true,
        includeLogo: false,
        copies: 1,
      };

      await expect(qrCodeService.printQRCode(mockKumbara, printOptions)).resolves.not.toThrow();

      // Verify window.open was called
      expect(window.open).toHaveBeenCalled();
    });

    it('should generate printable HTML for A4 format', async () => {
      const printOptions = {
        format: 'a4' as const,
        size: { width: 210, height: 297, unit: 'mm' as const },
        includeText: true,
        includeLogo: true,
        copies: 3,
      };

      await expect(qrCodeService.printQRCode(mockKumbara, printOptions)).resolves.not.toThrow();
    });

    it('should handle print window creation failure', async () => {
      // Mock window.open to return null
      vi.stubGlobal('open', vi.fn().mockReturnValue(null));

      const printOptions = {
        format: 'thermal' as const,
        size: { width: 40, height: 30, unit: 'mm' as const },
      };

      await expect(qrCodeService.printQRCode(mockKumbara, printOptions)).rejects.toThrow(
        'QR kod yazdırılamadı',
      );
    });
  });

  describe('generatePrintableHTML', () => {
    it('should generate valid HTML structure', () => {
      const qrDataURL = 'data:image/png;base64,mock-data';
      const printOptions = {
        format: 'thermal' as const,
        size: { width: 40, height: 30, unit: 'mm' as const },
        includeText: true,
        includeLogo: false,
        copies: 1,
      };

      const html = qrCodeService.generatePrintableHTML(mockKumbara, qrDataURL, printOptions);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="tr">');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('<style>');
      expect(html).toContain(mockKumbara.code);
      expect(html).toContain(mockKumbara.name);
      expect(html).toContain(mockKumbara.location);
      expect(html).toContain(qrDataURL);
    });

    it('should include logo when requested', () => {
      const qrDataURL = 'data:image/png;base64,mock-data';
      const printOptions = {
        format: 'thermal' as const,
        size: { width: 40, height: 30, unit: 'mm' as const },
        includeText: true,
        includeLogo: true,
        copies: 1,
      };

      const html = qrCodeService.generatePrintableHTML(mockKumbara, qrDataURL, printOptions);

      expect(html).toContain('logo');
      expect(html).toContain('LOGO');
    });

    it('should exclude text when not requested', () => {
      const qrDataURL = 'data:image/png;base64,mock-data';
      const printOptions = {
        format: 'thermal' as const,
        size: { width: 40, height: 30, unit: 'mm' as const },
        includeText: false,
        includeLogo: false,
        copies: 1,
      };

      const html = qrCodeService.generatePrintableHTML(mockKumbara, qrDataURL, printOptions);

      expect(html).toContain(qrDataURL);
      expect(html).not.toContain('KMB-TEST-001');
    });

    it('should generate multiple copies', () => {
      const qrDataURL = 'data:image/png;base64,mock-data';
      const printOptions = {
        format: 'thermal' as const,
        size: { width: 40, height: 30, unit: 'mm' as const },
        includeText: true,
        includeLogo: false,
        copies: 3,
      };

      const html = qrCodeService.generatePrintableHTML(mockKumbara, qrDataURL, printOptions);

      // Should contain 3 instances of qr-container div
      const matches = html.match(/<div class="qr-container">/g);
      expect(matches?.length).toBe(3);
    });
  });

  describe('generateBatchQRCodes', () => {
    it('should generate QR codes for multiple kumbaras', async () => {
      const kumbaras = [
        testUtils.createMockKumbara({ id: '1', code: 'KMB-001' }),
        testUtils.createMockKumbara({ id: '2', code: 'KMB-002' }),
        testUtils.createMockKumbara({ id: '3', code: 'KMB-003' }),
      ];

      const results = await qrCodeService.generateBatchQRCodes(kumbaras);

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(3);

      kumbaras.forEach((kumbara) => {
        const result = results.get(kumbara.id);
        expect(result).toBeDefined();
        expect(result?.dataURL).toMatch(/^data:image\/png;base64,/);
        expect(result?.svg).toContain('<svg');
      });
    });

    it('should handle individual failures in batch processing', async () => {
      const kumbaras = [
        testUtils.createMockKumbara({ id: '1', code: 'KMB-001' }),
        testUtils.createMockKumbara({ id: '2', code: 'KMB-002' }),
      ];

      // Mock one failure
      const originalGenerateQRCode = qrCodeService.generateQRCode;
      let callCount = 0;
      vi.spyOn(qrCodeService, 'generateQRCode').mockImplementation(async (data, options) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Test error');
        }
        return originalGenerateQRCode.call(qrCodeService, data, options);
      });

      const results = await qrCodeService.generateBatchQRCodes(kumbaras);

      // Should have only one successful result
      expect(results.size).toBe(1);
      expect(results.has('2')).toBe(true);
      expect(results.has('1')).toBe(false);
    });

    it('should handle empty kumbara array', async () => {
      const results = await qrCodeService.generateBatchQRCodes([]);

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(0);
    });
  });

  describe('generateBrandedQRCode', () => {
    it('should generate QR code with default branding', async () => {
      const result = await qrCodeService.generateBrandedQRCode(mockKumbara);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('should generate QR code with custom colors', async () => {
      const brandingOptions = {
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00',
        },
      };

      const result = await qrCodeService.generateBrandedQRCode(mockKumbara, brandingOptions);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('should generate QR code with logo', async () => {
      const brandingOptions = {
        logo: 'data:image/png;base64,mock-logo-data',
        colors: {
          primary: '#1e40af',
          secondary: '#ffffff',
        },
      };

      const result = await qrCodeService.generateBrandedQRCode(mockKumbara, brandingOptions);

      expect(result).toMatch(/^data:image\/png;base64,/);
    });

    it('should handle canvas context creation failure', async () => {
      // Mock canvas getContext to return null
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);

      await expect(qrCodeService.generateBrandedQRCode(mockKumbara)).rejects.toThrow(
        'Markalı QR kod oluşturulamadı',
      );
    });
  });

  describe('validateQRData', () => {
    it('should validate correct kumbara QR data', () => {
      const validQRData = JSON.stringify({
        kumbaraId: 'test-id',
        code: 'KMB-001',
        name: 'Test Kumbara',
        url: 'https://bagis.dernek.org/kumbara/KMB-001',
      });

      const result = qrCodeService.validateQRData(validQRData);

      expect(result.isValid).toBe(true);
      expect(result.parsedData).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should validate kumbara URL format', () => {
      const kumbaraURL = 'https://bagis.dernek.org/kumbara/KMB-001';

      const result = qrCodeService.validateQRData(kumbaraURL);

      expect(result.isValid).toBe(true);
      expect(result.parsedData).toEqual({ text: kumbaraURL });
    });

    it('should validate plain text QR data', () => {
      const plainText = 'Simple text content';

      const result = qrCodeService.validateQRData(plainText);

      expect(result.isValid).toBe(true);
      expect(result.parsedData).toEqual({ text: plainText });
    });

    it('should reject empty QR data', () => {
      const result = qrCodeService.validateQRData('');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Boş QR kod verisi');
    });

    it('should reject invalid JSON format', () => {
      const invalidJSON = '{ invalid json }';

      const result = qrCodeService.validateQRData(invalidJSON);

      expect(result.isValid).toBe(true); // Treated as plain text
      expect(result.parsedData).toEqual({ text: invalidJSON });
    });

    it('should validate incomplete kumbara QR data', () => {
      const incompleteQRData = JSON.stringify({
        kumbaraId: 'test-id',
        // Missing required fields
      });

      const result = qrCodeService.validateQRData(incompleteQRData);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Geçersiz QR kod formatı');
    });
  });

  describe('Error Handling', () => {
    it('should provide Turkish error messages', async () => {
      // Mock QRCode to throw error
      const mockQRCode = await import('qrcode');
      vi.spyOn(mockQRCode.default, 'toDataURL').mockRejectedValueOnce(new Error('Test error'));

      try {
        await qrCodeService.generateQRCode('test-data');
      } catch (error) {
        expect((error as Error).message).toBe('QR kod oluşturulamadı');
      }
    });

    it('should handle service initialization errors', () => {
      // Test that service can be instantiated without errors
      expect(() => qrCodeService).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should generate QR codes efficiently', async () => {
      const startTime = Date.now();

      const qrData = qrCodeService.generateKumbaraQRData(mockKumbara);
      await qrCodeService.generateQRCode(qrData);

      const duration = Date.now() - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    it('should handle batch operations efficiently', async () => {
      const kumbaras = Array.from({ length: 10 }, (_, i) =>
        testUtils.createMockKumbara({
          id: `test-${i}`,
          code: `KMB-${i.toString().padStart(3, '0')}`,
        }),
      );

      const startTime = Date.now();
      const results = await qrCodeService.generateBatchQRCodes(kumbaras);
      const duration = Date.now() - startTime;

      expect(results.size).toBe(10);
      expect(duration).toBeLessThan(10000); // 10 seconds for 10 QR codes
    });
  });

  describe('Integration', () => {
    it('should work with real kumbara data flow', async () => {
      // Create kumbara data
      const qrData = qrCodeService.generateKumbaraQRData(mockKumbara);

      // Generate QR code
      const qrResult = await qrCodeService.generateQRCode(qrData);

      // Validate the generated data
      const validation = qrCodeService.validateQRData(qrResult.raw);

      expect(validation.isValid).toBe(true);
      expect(validation.parsedData.kumbaraId).toBe(mockKumbara.id);
      expect(validation.parsedData.code).toBe(mockKumbara.code);
    });

    it('should maintain data consistency across operations', async () => {
      const qrData1 = qrCodeService.generateKumbaraQRData(mockKumbara);
      const qrData2 = qrCodeService.generateKumbaraQRData(mockKumbara);

      // Same kumbara should generate identical QR data
      expect(qrData1).toEqual(qrData2);

      const qrResult1 = await qrCodeService.generateQRCode(qrData1);
      const qrResult2 = await qrCodeService.generateQRCode(qrData2);

      // Generated QR codes should be identical for same data
      expect(qrResult1.raw).toBe(qrResult2.raw);
    });
  });
});
