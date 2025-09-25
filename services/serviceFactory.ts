/**
 * @fileoverview serviceFactory Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { beneficiariesService } from './beneficiariesService';
import { donationsService } from './donationsService';
import { membersService } from './membersService';
import { reportingService } from './reportingService';

export enum ServiceType {
  DONATIONS = 'donations',
  BENEFICIARIES = 'beneficiaries',
  MEMBERS = 'members',
  REPORTING = 'reporting',
}

/**
 * ServiceFactory Service
 * 
 * Service class for handling servicefactory operations
 * 
 * @class ServiceFactory
 */
export class ServiceFactory {
  private static readonly instances = new Map<ServiceType, any>();

  static getService<T>(type: ServiceType): T {
    if (!this.instances.has(type)) {
      switch (type) {
        case ServiceType.DONATIONS:
          this.instances.set(type, donationsService);
          break;
        case ServiceType.BENEFICIARIES:
          // Use beneficiaries service
          this.instances.set(type, beneficiariesService);
          break;
        case ServiceType.MEMBERS:
          this.instances.set(type, membersService);
          break;
        case ServiceType.REPORTING:
          this.instances.set(type, reportingService);
          break;
        default:
          throw new Error(`Unknown service type: ${type}`);
      }
    }

    return this.instances.get(type) as T;
  }

  static clearCache(): void {
    this.instances.clear();
  }
}

// Type-safe service getters
export const getService = {
  donations: () => ServiceFactory.getService<typeof donationsService>(ServiceType.DONATIONS),
  beneficiaries: () =>
    ServiceFactory.getService<typeof beneficiariesService>(ServiceType.BENEFICIARIES),
  members: () => ServiceFactory.getService<typeof membersService>(ServiceType.MEMBERS),
  reporting: () => ServiceFactory.getService<typeof reportingService>(ServiceType.REPORTING),
};
