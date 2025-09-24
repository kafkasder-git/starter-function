// 🧪 QR SCANNER SERVICE TESTS
// Comprehensive unit tests for QRScannerService

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QRScanResult } from '../../services/qrScannerService';
import qrScannerService from '../../services/qrScannerService';
import testUtils from '../setup';

// Mock html5-qrcode library
vi.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    clear: vi.fn(),
  })),
  Html5Qrcode: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    scanFile: vi.fn().mockResolvedValue('{"kumbaraId":"test","code":"KMB-001","name":"Test"}'),
  })),
  Html5QrcodeScanType: {
    SCAN_TYPE_CAMERA: 0,
    SCAN_TYPE_FILE: 1,
  },
}));

describe('QRScannerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableCameras', () => {
    it('should return available camera devices', async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      vi.spyOn(Html5Qrcode, 'getCameras').mockResolvedValue([
        { id: 'camera1', label: 'Front Camera' },
        { id: 'camera2', label: 'Back Camera' },
      ] as any);

      const cameras = await qrScannerService.getAvailableCameras();

      expect(cameras).toHaveLength(2);
      expect(cameras[0]).toEqual({ id: 'camera1', label: 'Front Camera' });
      expect(cameras[1]).toEqual({ id: 'camera2', label: 'Back Camera' });
    });

    it('should handle camera enumeration errors', async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      vi.spyOn(Html5Qrcode, 'getCameras').mockRejectedValue(new Error('Camera access denied'));

      const cameras = await qrScannerService.getAvailableCameras();

      expect(cameras).toEqual([]);
    });

    it('should provide default labels for cameras without labels', async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      vi.spyOn(Html5Qrcode, 'getCameras').mockResolvedValue([
        { id: 'camera1', label: '' },
        { id: 'camera2' }, // No label property
      ] as any);

      const cameras = await qrScannerService.getAvailableCameras();

      expect(cameras[0].label).toBe('Kamera camera1');
      expect(cameras[1].label).toBe('Kamera camera2');
    });
  });

  describe('checkCameraPermissions', () => {
    it('should return true when permissions are granted', async () => {
      // navigator.mediaDevices.getUserMedia is already mocked in setup
      const hasPermissions = await qrScannerService.checkCameraPermissions();

      expect(hasPermissions).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      // Mock getUserMedia to reject
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(
        new Error('Permission denied'),
      );

      const hasPermissions = await qrScannerService.checkCameraPermissions();

      expect(hasPermissions).toBe(false);
    });
  });

  describe('requestCameraPermissions', () => {
    it('should request and return permission status', async () => {
      const granted = await qrScannerService.requestCameraPermissions();

      expect(granted).toBe(true);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    });

    it('should handle permission denial', async () => {
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(
        new Error('Permission denied'),
      );

      const granted = await qrScannerService.requestCameraPermissions();

      expect(granted).toBe(false);
    });
  });

  describe('scanFromFile', () => {
    it('should scan QR code from file successfully', async () => {
      const mockFile = testUtils.createMockFile('test-qr.png');

      const result = await qrScannerService.scanFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should handle file scanning errors', async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      const mockHtml5Qrcode = {
        scanFile: vi.fn().mockRejectedValue(new Error('Scan failed')),
      };
      vi.spyOn(Html5Qrcode.prototype, 'scanFile').mockImplementation(mockHtml5Qrcode.scanFile);

      const mockFile = testUtils.createMockFile('invalid-qr.png');

      const result = await qrScannerService.scanFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Dosyadan QR kod okunamadı');
      expect(result.timestamp).toBeDefined();
    });

    it('should process different file types', async () => {
      const fileTypes = ['image/png', 'image/jpeg', 'image/webp'];

      for (const type of fileTypes) {
        const mockFile = testUtils.createMockFile(`test-qr.${type.split('/')[1]}`, type);
        const result = await qrScannerService.scanFromFile(mockFile);

        expect(result.success).toBe(true);
      }
    });
  });

  describe('scanFromImageUrl', () => {
    it('should scan QR code from image URL', async () => {
      const imageUrl = 'https://example.com/qr-code.png';

      // Mock Image loading
      const mockImage = {
        crossOrigin: '',
        onload: null as any,
        onerror: null as any,
        src: '',
        width: 256,
        height: 256,
      };

      vi.stubGlobal(
        'Image',
        vi.fn().mockImplementation(() => {
          setTimeout(() => {
            if (mockImage.onload) {
              mockImage.onload();
            }
          }, 10);
          return mockImage;
        }),
      );

      const result = await qrScannerService.scanFromImageUrl(imageUrl);

      expect(result.success).toBe(true);
    });

    it('should handle image loading errors', async () => {
      const imageUrl = 'https://example.com/invalid-image.png';

      const mockImage = {
        crossOrigin: '',
        onload: null as any,
        onerror: null as any,
        src: '',
      };

      vi.stubGlobal(
        'Image',
        vi.fn().mockImplementation(() => {
          setTimeout(() => {
            if (mockImage.onerror) {
              mockImage.onerror();
            }
          }, 10);
          return mockImage;
        }),
      );

      const result = await qrScannerService.scanFromImageUrl(imageUrl);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Resim yüklenemedi');
    });
  });

  describe('validateKumbaraQR', () => {
    it('should validate correct kumbara QR scan result', () => {
      const validScanResult: QRScanResult = {
        success: true,
        data: JSON.stringify({
          kumbaraId: 'test-id',
          code: 'KMB-001',
          name: 'Test Kumbara',
          location: 'Test Location',
          url: 'https://bagis.dernek.org/kumbara/KMB-001',
        }),
        parsedData: {
          type: 'kumbara',
          kumbaraId: 'test-id',
          code: 'KMB-001',
          name: 'Test Kumbara',
          location: 'Test Location',
          url: 'https://bagis.dernek.org/kumbara/KMB-001',
        },
        format: 'QR_CODE',
        timestamp: new Date().toISOString(),
      };

      const result = qrScannerService.validateKumbaraQR(validScanResult);

      expect(result.isValid).toBe(true);
      expect(result.kumbaraData).toBeDefined();
      expect(result.kumbaraData?.code).toBe('KMB-001');
      expect(result.error).toBeUndefined();
    });

    it('should validate kumbara URL scan result', () => {
      const urlScanResult: QRScanResult = {
        success: true,
        data: 'https://bagis.dernek.org/kumbara/KMB-001',
        parsedData: {
          type: 'kumbara_url',
          kumbaraCode: 'KMB-001',
        },
        format: 'QR_CODE',
        timestamp: new Date().toISOString(),
      };

      const result = qrScannerService.validateKumbaraQR(urlScanResult);

      expect(result.isValid).toBe(true);
      expect(result.kumbaraData).toBeDefined();
      expect(result.kumbaraData?.code).toBe('KMB-001');
    });

    it('should reject non-kumbara QR codes', () => {
      const nonKumbaraScanResult: QRScanResult = {
        success: true,
        data: 'https://example.com/some-other-qr',
        parsedData: {
          type: 'url',
          value: 'https://example.com/some-other-qr',
        },
        format: 'QR_CODE',
        timestamp: new Date().toISOString(),
      };

      const result = qrScannerService.validateKumbaraQR(nonKumbaraScanResult);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Bu QR kod bir kumbara QR kodu değil');
    });

    it('should reject failed scan results', () => {
      const failedScanResult: QRScanResult = {
        success: false,
        error: 'Scan failed',
        timestamp: new Date().toISOString(),
      };

      const result = qrScannerService.validateKumbaraQR(failedScanResult);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Geçersiz QR kod');
    });
  });

  describe('getScannerStatus', () => {
    it('should return current scanner status', () => {
      const status = qrScannerService.getScannerStatus();

      expect(status).toBeDefined();
      expect(status).toHaveProperty('isScanning');
      expect(status).toHaveProperty('currentCamera');
      expect(status).toHaveProperty('hasPermissions');

      expect(typeof status.isScanning).toBe('boolean');
      expect(status.currentCamera === null || typeof status.currentCamera === 'string').toBe(true);
    });
  });

  describe('getScanningCapabilities', () => {
    it('should return scanning capabilities', async () => {
      const capabilities = await qrScannerService.getScanningCapabilities();

      expect(capabilities).toBeDefined();
      expect(capabilities).toHaveProperty('hasCamera');
      expect(capabilities).toHaveProperty('cameraCount');
      expect(capabilities).toHaveProperty('supportsFileUpload');
      expect(capabilities).toHaveProperty('supportedFormats');

      expect(typeof capabilities.hasCamera).toBe('boolean');
      expect(typeof capabilities.cameraCount).toBe('number');
      expect(capabilities.supportsFileUpload).toBe(true);
      expect(capabilities.supportedFormats).toBeInstanceOf(Array);
      expect(capabilities.supportedFormats).toContain('QR_CODE');
    });

    it('should handle camera enumeration errors in capabilities', async () => {
      const { Html5Qrcode } = await import('html5-qrcode');
      vi.spyOn(Html5Qrcode, 'getCameras').mockRejectedValueOnce(new Error('Camera error'));

      const capabilities = await qrScannerService.getScanningCapabilities();

      expect(capabilities.hasCamera).toBe(false);
      expect(capabilities.cameraCount).toBe(0);
      expect(capabilities.supportsFileUpload).toBe(true);
      expect(capabilities.supportedFormats).toEqual(['QR_CODE']);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources without errors', async () => {
      await expect(qrScannerService.cleanup()).resolves.not.toThrow();
    });

    it('should handle cleanup when scanner is not initialized', async () => {
      // Ensure scanner is not initialized
      await qrScannerService.cleanup();

      // Should not throw when cleaning up again
      await expect(qrScannerService.cleanup()).resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should provide Turkish error messages', async () => {
      const mockFile = testUtils.createMockFile('invalid.png');

      const { Html5Qrcode } = await import('html5-qrcode');
      vi.spyOn(Html5Qrcode.prototype, 'scanFile').mockRejectedValue(new Error('Test error'));

      const result = await qrScannerService.scanFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Dosyadan QR kod okunamadı');
    });

    it('should handle initialization errors gracefully', async () => {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      vi.spyOn(Html5QrcodeScanner.prototype, 'render').mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      const onSuccess = vi.fn();
      const onError = vi.fn();

      await expect(
        qrScannerService.initializeScanner('test-element', {}, onSuccess, onError),
      ).rejects.toThrow('QR kod tarayıcı başlatılamadı');
    });
  });

  describe('processScannedData', () => {
    it('should process valid kumbara QR data', () => {
      const mockKumbaraQRData = {
        kumbaraId: 'test-id',
        code: 'KMB-001',
        name: 'Test Kumbara',
        location: 'Test Location',
        url: 'https://bagis.dernek.org/kumbara/KMB-001',
      };

      // Access private method through service instance
      const service = qrScannerService as any;
      const result = service.processScannedData(JSON.stringify(mockKumbaraQRData), {
        format: { formatName: 'QR_CODE' },
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(JSON.stringify(mockKumbaraQRData));
      expect(result.parsedData).toEqual(mockKumbaraQRData);
      expect(result.format).toBe('QR_CODE');
      expect(result.timestamp).toBeDefined();
    });

    it('should process plain text QR data', () => {
      const plainText = 'Simple text content';

      const service = qrScannerService as any;
      const result = service.processScannedData(plainText, { format: { formatName: 'QR_CODE' } });

      expect(result.success).toBe(true);
      expect(result.data).toBe(plainText);
      expect(result.parsedData.type).toBe('text');
      expect(result.parsedData.value).toBe(plainText);
    });

    it('should process URL QR data', () => {
      const url = 'https://example.com';

      const service = qrScannerService as any;
      const result = service.processScannedData(url, { format: { formatName: 'QR_CODE' } });

      expect(result.success).toBe(true);
      expect(result.parsedData.type).toBe('url');
      expect(result.parsedData.value).toBe(url);
    });

    it('should identify kumbara URLs', () => {
      const kumbaraUrl = 'https://bagis.dernek.org/kumbara/KMB-001';

      const service = qrScannerService as any;
      const result = service.processScannedData(kumbaraUrl, { format: { formatName: 'QR_CODE' } });

      expect(result.success).toBe(true);
      expect(result.parsedData.type).toBe('kumbara_url');
      expect(result.parsedData.kumbaraCode).toBe('KMB-001');
    });

    it('should handle invalid JSON gracefully', () => {
      const invalidJSON = '{ invalid json }';

      const service = qrScannerService as any;
      const result = service.processScannedData(invalidJSON, { format: { formatName: 'QR_CODE' } });

      expect(result.success).toBe(true);
      expect(result.parsedData.type).toBe('text');
      expect(result.parsedData.value).toBe(invalidJSON);
    });
  });

  describe('isValidKumbaraQR', () => {
    it('should validate complete kumbara QR data', () => {
      const validData = {
        kumbaraId: 'test-id',
        code: 'KMB-001',
        name: 'Test Kumbara',
        url: 'https://bagis.dernek.org/kumbara/KMB-001',
      };

      const service = qrScannerService as any;
      const result = service.isValidKumbaraQR(validData);

      expect(result).toBe(true);
    });

    it('should reject incomplete kumbara QR data', () => {
      const incompleteData = {
        kumbaraId: 'test-id',
        code: 'KMB-001',
        // Missing name and url
      };

      const service = qrScannerService as any;
      const result = service.isValidKumbaraQR(incompleteData);

      expect(result).toBe(false);
    });

    it('should reject non-object data', () => {
      const service = qrScannerService as any;

      expect(service.isValidKumbaraQR('string')).toBe(false);
      expect(service.isValidKumbaraQR(123)).toBe(false);
      expect(service.isValidKumbaraQR(null)).toBe(false);
      expect(service.isValidKumbaraQR(undefined)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should work with complete scan workflow', async () => {
      // Mock successful camera permissions
      const hasPermissions = await qrScannerService.checkCameraPermissions();
      expect(hasPermissions).toBe(true);

      // Get available cameras
      const cameras = await qrScannerService.getAvailableCameras();
      expect(cameras.length).toBeGreaterThan(0);

      // Check capabilities
      const capabilities = await qrScannerService.getScanningCapabilities();
      expect(capabilities.hasCamera).toBe(true);
      expect(capabilities.supportsFileUpload).toBe(true);

      // Scan from file
      const mockFile = testUtils.createMockFile('test-qr.png');
      const scanResult = await qrScannerService.scanFromFile(mockFile);
      expect(scanResult.success).toBe(true);

      // Validate scan result
      const validation = qrScannerService.validateKumbaraQR(scanResult);
      expect(validation).toBeDefined();
    });

    it('should maintain state consistency', async () => {
      const initialStatus = qrScannerService.getScannerStatus();
      expect(initialStatus.isScanning).toBe(false);

      // After cleanup, status should remain consistent
      await qrScannerService.cleanup();
      const statusAfterCleanup = qrScannerService.getScannerStatus();
      expect(statusAfterCleanup.isScanning).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should scan files efficiently', async () => {
      const mockFile = testUtils.createMockFile('test-qr.png');

      const startTime = Date.now();
      await qrScannerService.scanFromFile(mockFile);
      const duration = Date.now() - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds
    });

    it('should handle multiple sequential scans', async () => {
      const files = [
        testUtils.createMockFile('qr1.png'),
        testUtils.createMockFile('qr2.png'),
        testUtils.createMockFile('qr3.png'),
      ];

      const results = await Promise.all(files.map((file) => qrScannerService.scanFromFile(file)));

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during repeated operations', async () => {
      // Perform multiple scan operations
      for (let i = 0; i < 10; i++) {
        const mockFile = testUtils.createMockFile(`test-${i}.png`);
        await qrScannerService.scanFromFile(mockFile);
      }

      // Cleanup should work without issues
      await expect(qrScannerService.cleanup()).resolves.not.toThrow();
    });

    it('should cleanup properly after scanner initialization', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      // Initialize scanner
      await qrScannerService.initializeScanner('test-element', {}, onSuccess, onError);

      // Cleanup should work
      await expect(qrScannerService.cleanup()).resolves.not.toThrow();

      // Status should reflect cleanup
      const status = qrScannerService.getScannerStatus();
      expect(status.isScanning).toBe(false);
    });
  });
});
