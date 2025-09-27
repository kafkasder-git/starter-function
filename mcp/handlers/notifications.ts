import type { MCPRequest, MCPResponse, NotificationPayload } from '../types';
import { enhancedNotifications } from '../../lib/enhancedNotifications';

/**
 * Handles notification requests from the MCP server
 * Integrates with the panel's notification system
 */
export async function handleNotificationRequest(request: MCPRequest): Promise<MCPResponse> {
  try {
    const payload = request.payload as NotificationPayload;
    
    if (!payload || !payload.title || !payload.message || !payload.category) {
      return {
        success: false,
        error: {
          code: 'INVALID_NOTIFICATION_PAYLOAD',
          message: 'Missing required notification fields'
        }
      };
    }

    // Map to the correct notification type based on priority
    switch (payload.priority) {
      case 'dusuk':
      case 'orta':
        enhancedNotifications.bilgi({
          title: payload.title,
          message: payload.message,
          category: payload.category,
          duration: payload.duration,
          sound: payload.sound,
          action: payload.action ? {
            label: payload.action.label,
            onClick: (): void => {
              // Navigate to the specified route
              window.location.href = payload.action!.route;
            }
          } : undefined
        });
        break;

      case 'yuksek':
        enhancedNotifications.uyari({
          title: payload.title,
          message: payload.message,
          category: payload.category,
          duration: payload.duration,
          sound: payload.sound,
          action: payload.action ? {
            label: payload.action.label,
            onClick: (): void => {
              window.location.href = payload.action!.route;
            }
          } : undefined
        });
        break;

      case 'acil':
        enhancedNotifications.hata({
          title: payload.title,
          message: payload.message,
          category: payload.category,
          duration: payload.duration,
          sound: payload.sound ?? true, // Default to true for urgent notifications
          action: payload.action ? {
            label: payload.action.label,
            onClick: (): void => {
              window.location.href = payload.action!.route;
            }
          } : undefined
        });
        break;
    }

    return {
      success: true,
      data: {
        notificationSent: true,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error handling notification request:', error);
    return {
      success: false,
      error: {
        code: 'NOTIFICATION_ERROR',
        message: 'Failed to process notification request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}