import { describe, it, expect } from 'vitest';
import { ValidationService } from '../utils/validation';

describe('ValidationService', () => {
  describe('validateTcKimlik', () => {
    it('should validate a correct TC Kimlik No', () => {
      const result = ValidationService.validateTcKimlik('19191919190');
      expect(result.success).toBe(true);
    });
  });
});