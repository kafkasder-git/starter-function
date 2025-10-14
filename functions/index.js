/**
 * @fileoverview Appwrite Function - Dernek Yönetim Sistemi API
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

const { Client, Databases, Storage, Functions, Users } = require('node-appwrite');

// Initialize Appwrite client
const client = new Client();
client
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '68e99f6c000183bafb39')
    .setKey(process.env.APPWRITE_API_KEY);

// Initialize services
const databases = new Databases(client);
// const storage = new Storage(client); // TODO: Implement storage operations
// const functions = new Functions(client); // TODO: Implement function operations
// const users = new Users(client); // TODO: Implement user operations

/**
 * Main function handler
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
module.exports = async (req, res) => {
    try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            return res.json({});
        }

        const { method, path } = req;
        const environment = process.env.ENVIRONMENT || 'development';

        console.log(`[${environment}] ${method} ${path}`);

        // Route handling
        const route = getRoute(path, method);
        
        switch (route) {
            case 'GET /health':
                return handleHealthCheck(req, res);
                
            case 'GET /api/beneficiaries':
                return handleGetBeneficiaries(req, res);
                
            case 'POST /api/beneficiaries':
                return handleCreateBeneficiary(req, res);
                
            case 'GET /api/donations':
                return handleGetDonations(req, res);
                
            case 'POST /api/donations':
                return handleCreateDonation(req, res);
                
            case 'GET /api/messages':
                return handleGetMessages(req, res);
                
            case 'POST /api/messages':
                return handleCreateMessage(req, res);
                
            case 'GET /api/stats':
                return handleGetStats(req, res);
                
            default:
                return res.status(404).json({
                    error: 'Endpoint not found',
                    method,
                    path,
                    availableRoutes: [
                        'GET /health',
                        'GET /api/beneficiaries',
                        'POST /api/beneficiaries',
                        'GET /api/donations',
                        'POST /api/donations',
                        'GET /api/messages',
                        'POST /api/messages',
                        'GET /api/stats'
                    ]
                });
        }

    } catch (error) {
        console.error('Function error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            environment: process.env.ENVIRONMENT
        });
    }
};

/**
 * Get route from path and method
 */
function getRoute(path, method) {
    const cleanPath = path.replace(/\/$/, '') || '/';
    return `${method} ${cleanPath}`;
}

/**
 * Health check endpoint
 */
async function handleHealthCheck(req, res) {
    try {
        // Test database connection
        await databases.list(process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db', []);
        
        return res.json({
            status: 'healthy',
            environment: process.env.ENVIRONMENT,
            timestamp: new Date().toISOString(),
            version: process.env.VERSION || '1.0.0',
            services: {
                database: 'connected',
                storage: 'connected',
                functions: 'running'
            }
        });
    } catch (error) {
        return res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
}

/**
 * Get beneficiaries
 */
async function handleGetBeneficiaries(req, res) {
    try {
        const { limit = 25, offset = 0, search = '' } = req.query;
        
        const queries = [
            `limit(${limit})`,
            `offset(${offset})`
        ];
        
        if (search) {
            queries.push(`search("name", "${search}")`);
        }
        
        const result = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'beneficiaries',
            queries
        );
        
        return res.json({
            beneficiaries: result.documents,
            total: result.total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch beneficiaries',
            message: error.message
        });
    }
}

/**
 * Create beneficiary
 */
async function handleCreateBeneficiary(req, res) {
    try {
        const { name, email, phone, address, needs, priority = 'medium' } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({
                error: 'Name and email are required'
            });
        }
        
        const result = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'beneficiaries',
            'unique()',
            {
                name,
                email,
                phone: phone || '',
                address: address || '',
                needs: needs || '',
                priority,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );
        
        return res.status(201).json({
            beneficiary: result,
            message: 'Beneficiary created successfully'
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to create beneficiary',
            message: error.message
        });
    }
}

/**
 * Get donations
 */
async function handleGetDonations(req, res) {
    try {
        const { limit = 25, offset = 0, type = '' } = req.query;
        
        const queries = [
            `limit(${  limit}`,
            `offset(${  offset}`
        ];
        
        if (type) {
            queries.push(`equal("type", "${  type  }")`);
        }
        
        const result = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'donations',
            queries
        );
        
        return res.json({
            donations: result.documents,
            total: result.total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch donations',
            message: error.message
        });
    }
}

/**
 * Create donation
 */
async function handleCreateDonation(req, res) {
    try {
        const { amount, type, donorName, donorEmail, description, beneficiaryId } = req.body;
        
        if (!amount || !type || !donorName) {
            return res.status(400).json({
                error: 'Amount, type, and donor name are required'
            });
        }
        
        const result = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'donations',
            'unique()',
            {
                amount: parseFloat(amount),
                type,
                donorName,
                donorEmail: donorEmail || '',
                description: description || '',
                beneficiaryId: beneficiaryId || '',
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );
        
        return res.status(201).json({
            donation: result,
            message: 'Donation created successfully'
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to create donation',
            message: error.message
        });
    }
}

/**
 * Get messages
 */
async function handleGetMessages(req, res) {
    try {
        const { limit = 25, offset = 0, conversationId = '' } = req.query;
        
        const queries = [
            `limit(${  limit}`,
            `offset(${  offset}`
        ];
        
        if (conversationId) {
            queries.push(`equal("conversationId", "${  conversationId  }")`);
        }
        
        const result = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'messages',
            queries
        );
        
        return res.json({
            messages: result.documents,
            total: result.total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch messages',
            message: error.message
        });
    }
}

/**
 * Create message
 */
async function handleCreateMessage(req, res) {
    try {
        const { content, type = 'text', conversationId, senderId, recipientId } = req.body;
        
        if (!content || !conversationId || !senderId) {
            return res.status(400).json({
                error: 'Content, conversation ID, and sender ID are required'
            });
        }
        
        const result = await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'messages',
            'unique()',
            {
                content,
                type,
                conversationId,
                senderId,
                recipientId: recipientId || '',
                status: 'sent',
                readAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );
        
        return res.status(201).json({
            message: result,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to create message',
            message: error.message
        });
    }
}

/**
 * Get statistics
 */
async function handleGetStats(req, res) {
    try {
        // Get beneficiaries count
        const beneficiariesResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'beneficiaries',
            ['limit(1)']
        );
        
        // Get donations count and total amount
        const donationsResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'donations',
            ['limit(1000)'] // Get all donations for calculation
        );
        
        const totalDonations = donationsResult.documents.reduce((sum, donation) => {
            return sum + (donation.amount || 0);
        }, 0);
        
        // Get messages count
        const messagesResult = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID || 'dernek_yonetim_db',
            'messages',
            ['limit(1)']
        );
        
        return res.json({
            stats: {
                beneficiaries: {
                    total: beneficiariesResult.total
                },
                donations: {
                    total: donationsResult.total,
                    totalAmount: totalDonations,
                    averageAmount: donationsResult.total > 0 ? totalDonations / donationsResult.total : 0
                },
                messages: {
                    total: messagesResult.total
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
}
