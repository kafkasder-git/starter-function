/**
 * @fileoverview Events Service
 * @description Service for managing events and calendar functionality
 */

import { db, collections, queryHelpers } from '@/lib/database';
import { ID } from '@/lib/appwrite';
import { logger } from '@/lib/logging/logger';
import type { Models } from 'appwrite';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: 'meeting' | 'workshop' | 'seminar' | 'other';
  status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventDocument extends Omit<Event, 'id'>, Models.Document {}

export interface EventFilters {
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: 'meeting' | 'workshop' | 'seminar' | 'other';
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

class EventsService {
  private static instance: EventsService;

  public static getInstance(): EventsService {
    if (!EventsService.instance) {
      EventsService.instance = new EventsService();
    }
    return EventsService.instance;
  }

  private constructor() {
    logger.info('EventsService initialized');
  }

  /**
   * Get all events with optional filters
   */
  async getEvents(filters: EventFilters = {}): Promise<ApiResponse<Event[]>> {
    try {
      const queries = [
        queryHelpers.orderDesc('created_at'),
        queryHelpers.limit(filters.limit || 50)
      ];

      if (filters.type) {
        queries.push(queryHelpers.equal('type', filters.type));
      }

      if (filters.status) {
        queries.push(queryHelpers.equal('status', filters.status));
      }

      if (filters.startDate) {
        queries.push(queryHelpers.greaterThanEqualDate('start_date', filters.startDate));
      }

      if (filters.endDate) {
        queries.push(queryHelpers.lessThanEqualDate('end_date', filters.endDate));
      }

      if (filters.offset) {
        queries.push(queryHelpers.offset(filters.offset));
      }

      const { data, error } = await db.list(collections.EVENTS, queries);

      if (error) {
        return { data: null, error: 'Failed to fetch events', success: false };
      }

      const events = data?.documents?.map(doc => this.mapDocumentToEvent(doc)) || [];

      return { data: events, error: null, success: true };

    } catch (error) {
      logger.error('Failed to get events', error);
      return { data: null, error: 'Failed to fetch events', success: false };
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<ApiResponse<Event>> {
    try {
      const { data, error } = await db.get<EventDocument>(collections.EVENTS, eventId);

      if (error || !data) {
        return { data: null, error: 'Event not found', success: false };
      }

      const event = this.mapDocumentToEvent(data);
      return { data: event, error: null, success: true };

    } catch (error) {
      logger.error('Failed to get event by ID', error);
      return { data: null, error: 'Failed to fetch event', success: false };
    }
  }

  /**
   * Create new event
   */
  async createEvent(eventData: CreateEventData): Promise<ApiResponse<Event>> {
    try {
      const eventDoc: Omit<EventDocument, keyof Models.Document> = {
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        location: eventData.location,
        type: eventData.type,
        status: 'draft',
        created_by: 'current-user', // TODO: Get from auth
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await db.create(collections.EVENTS, eventDoc, ID.unique());

      if (error || !data) {
        return { data: null, error: 'Failed to create event', success: false };
      }

      const event = this.mapDocumentToEvent(data);
      return { data: event, error: null, success: true };

    } catch (error) {
      logger.error('Failed to create event', error);
      return { data: null, error: 'Failed to create event', success: false };
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string, updates: Partial<CreateEventData>): Promise<ApiResponse<Event>> {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await db.update(collections.EVENTS, eventId, updateData);

      if (error || !data) {
        return { data: null, error: 'Failed to update event', success: false };
      }

      const event = this.mapDocumentToEvent(data);
      return { data: event, error: null, success: true };

    } catch (error) {
      logger.error('Failed to update event', error);
      return { data: null, error: 'Failed to update event', success: false };
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await db.delete(collections.EVENTS, eventId);

      if (error) {
        return { data: null, error: 'Failed to delete event', success: false };
      }

      return { data: true, error: null, success: true };

    } catch (error) {
      logger.error('Failed to delete event', error);
      return { data: null, error: 'Failed to delete event', success: false };
    }
  }

  /**
   * Map document to event object
   */
  private mapDocumentToEvent(doc: EventDocument): Event {
    return {
      id: doc.$id,
      title: doc.title,
      description: doc.description,
      startDate: doc.start_date,
      endDate: doc.end_date,
      location: doc.location,
      type: doc.type,
      status: doc.status,
      createdBy: doc.created_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    };
  }
}

// Export singleton instance
export const eventsService = EventsService.getInstance();
export default eventsService;
