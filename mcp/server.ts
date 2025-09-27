import { createServer } from '@vercel/node';
import { MCPRequest, MCPResponse } from './types';
import { handleNotificationRequest } from './handlers/notifications';
import { handleMemberRequest } from './handlers/members';
import { handleDonationRequest } from './handlers/donations';

/**
 * Model Context Protocol (MCP) server implementation for Kafkasder Panel
 * Handles enhanced AI capabilities for the panel application
 */
const handler = async (req, res) => {
  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mcpRequest = req.body as MCPRequest;
    
    // Validate the MCP request
    if (!mcpRequest || !mcpRequest.action) {
      return res.status(400).json({ error: 'Invalid MCP request' });
    }

    let response: MCPResponse;

    // Route to appropriate handler based on action
    switch (mcpRequest.action) {
      case 'notification':
        response = await handleNotificationRequest(mcpRequest);
        break;
      case 'member':
        response = await handleMemberRequest(mcpRequest);
        break;
      case 'donation':
        response = await handleDonationRequest(mcpRequest);
        break;
      default:
        return res.status(400).json({ 
          error: `Unsupported action: ${mcpRequest.action}` 
        });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('MCP server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create and export the server
export default createServer(handler);