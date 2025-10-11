#!/usr/bin/env node

/**
 * Appwrite Database Setup Script
 * Creates all necessary collections, attributes, indexes, and RLS policies
 */

const { Client, Databases, ID, Permission, Role } = require('appwrite');

// Configuration
const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68e99f6c000183bafb39',
  databaseId: process.env.APPWRITE_DATABASE_ID || 'kafkasder_db',
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

const databases = new Databases(client);

// Collection schemas
const collections = {
  user_profiles: {
    name: 'User Profiles',
    documentSecurity: true,
    attributes: [
      { key: 'user_id', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'role', type: 'string', size: 50, required: true },
      { key: 'permissions', type: 'string', size: 1000, required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
      { key: 'last_login', type: 'datetime', required: false },
      { key: 'profile_data', type: 'string', size: 2000, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'user_id_idx', type: 'key', attributes: ['user_id'], orders: ['ASC'] },
      { key: 'email_idx', type: 'key', attributes: ['email'], orders: ['ASC'] },
      { key: 'role_idx', type: 'key', attributes: ['role'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ]
  },

  beneficiaries: {
    name: 'Beneficiaries',
    documentSecurity: true,
    attributes: [
      { key: 'ad_soyad', type: 'string', size: 255, required: true },
      { key: 'telefon_no', type: 'string', size: 20, required: true },
      { key: 'sehri', type: 'string', size: 100, required: true },
      { key: 'yerlesimi', type: 'string', size: 100, required: true },
      { key: 'mahalle', type: 'string', size: 100, required: false },
      { key: 'adres', type: 'string', size: 500, required: false },
      { key: 'uyruk', type: 'string', size: 50, required: true },
      { key: 'ulkesi', type: 'string', size: 100, required: true },
      { key: 'iban', type: 'string', size: 34, required: false },
      { key: 'ailedeki_kisi_sayisi', type: 'integer', required: true },
      { key: 'toplam_tutar', type: 'double', required: true },
      { key: 'kategori', type: 'string', size: 200, required: false },
      { key: 'tur', type: 'string', size: 200, required: false },
      { key: 'kayit_tarihi', type: 'datetime', required: true },
      { key: 'kimlik_no', type: 'string', size: 20, required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'ad_soyad_idx', type: 'key', attributes: ['ad_soyad'], orders: ['ASC'] },
      { key: 'telefon_idx', type: 'key', attributes: ['telefon_no'], orders: ['ASC'] },
      { key: 'sehri_idx', type: 'key', attributes: ['sehri'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'kayit_tarihi_idx', type: 'key', attributes: ['kayit_tarihi'], orders: ['DESC'] },
    ]
  },

  donations: {
    name: 'Donations',
    documentSecurity: true,
    attributes: [
      { key: 'donor_name', type: 'string', size: 255, required: true },
      { key: 'donor_email', type: 'string', size: 255, required: false },
      { key: 'donor_phone', type: 'string', size: 20, required: false },
      { key: 'amount', type: 'double', required: true },
      { key: 'currency', type: 'string', size: 3, required: true, default: 'TRY' },
      { key: 'payment_method', type: 'string', size: 50, required: true },
      { key: 'donation_type', type: 'string', size: 50, required: true },
      { key: 'campaign_id', type: 'string', size: 255, required: false },
      { key: 'beneficiary_id', type: 'string', size: 255, required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'notes', type: 'string', size: 1000, required: false },
      { key: 'donation_date', type: 'datetime', required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'donor_name_idx', type: 'key', attributes: ['donor_name'], orders: ['ASC'] },
      { key: 'amount_idx', type: 'key', attributes: ['amount'], orders: ['DESC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'donation_date_idx', type: 'key', attributes: ['donation_date'], orders: ['DESC'] },
      { key: 'campaign_idx', type: 'key', attributes: ['campaign_id'], orders: ['ASC'] },
    ]
  },

  campaigns: {
    name: 'Campaigns',
    documentSecurity: true,
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'target_amount', type: 'double', required: true },
      { key: 'current_amount', type: 'double', required: true, default: 0 },
      { key: 'currency', type: 'string', size: 3, required: true, default: 'TRY' },
      { key: 'start_date', type: 'datetime', required: true },
      { key: 'end_date', type: 'datetime', required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'image_url', type: 'string', size: 500, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'title_idx', type: 'key', attributes: ['title'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'start_date_idx', type: 'key', attributes: ['start_date'], orders: ['DESC'] },
      { key: 'target_amount_idx', type: 'key', attributes: ['target_amount'], orders: ['DESC'] },
    ]
  },

  aid_applications: {
    name: 'Aid Applications',
    documentSecurity: true,
    attributes: [
      { key: 'applicant_name', type: 'string', size: 255, required: true },
      { key: 'applicant_phone', type: 'string', size: 20, required: true },
      { key: 'applicant_email', type: 'string', size: 255, required: false },
      { key: 'aid_type', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'urgency_level', type: 'string', size: 20, required: true },
      { key: 'requested_amount', type: 'double', required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'reviewer_notes', type: 'string', size: 1000, required: false },
      { key: 'application_date', type: 'datetime', required: true },
      { key: 'review_date', type: 'datetime', required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'applicant_name_idx', type: 'key', attributes: ['applicant_name'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'urgency_idx', type: 'key', attributes: ['urgency_level'], orders: ['ASC'] },
      { key: 'application_date_idx', type: 'key', attributes: ['application_date'], orders: ['DESC'] },
    ]
  },

  notifications: {
    name: 'Notifications',
    documentSecurity: true,
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'message', type: 'string', size: 1000, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'priority', type: 'string', size: 20, required: true, default: 'normal' },
      { key: 'target_user_id', type: 'string', size: 255, required: false },
      { key: 'target_role', type: 'string', size: 50, required: false },
      { key: 'is_read', type: 'boolean', required: true, default: false },
      { key: 'read_at', type: 'datetime', required: false },
      { key: 'expires_at', type: 'datetime', required: false },
      { key: 'action_url', type: 'string', size: 500, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
    ],
    indexes: [
      { key: 'target_user_idx', type: 'key', attributes: ['target_user_id'], orders: ['ASC'] },
      { key: 'type_idx', type: 'key', attributes: ['type'], orders: ['ASC'] },
      { key: 'is_read_idx', type: 'key', attributes: ['is_read'], orders: ['ASC'] },
      { key: 'created_at_idx', type: 'key', attributes: ['created_at'], orders: ['DESC'] },
    ]
  },

  tasks: {
    name: 'Tasks',
    documentSecurity: true,
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'priority', type: 'string', size: 20, required: true, default: 'medium' },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'assigned_to', type: 'string', size: 255, required: false },
      { key: 'assigned_by', type: 'string', size: 255, required: true },
      { key: 'due_date', type: 'datetime', required: false },
      { key: 'completed_at', type: 'datetime', required: false },
      { key: 'tags', type: 'string', size: 500, required: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
    ],
    indexes: [
      { key: 'assigned_to_idx', type: 'key', attributes: ['assigned_to'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'priority_idx', type: 'key', attributes: ['priority'], orders: ['ASC'] },
      { key: 'due_date_idx', type: 'key', attributes: ['due_date'], orders: ['ASC'] },
    ]
  },

  finance_transactions: {
    name: 'Finance Transactions',
    documentSecurity: true,
    attributes: [
      { key: 'transaction_type', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'currency', type: 'string', size: 3, required: true, default: 'TRY' },
      { key: 'description', type: 'string', size: 500, required: true },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'payment_method', type: 'string', size: 50, required: true },
      { key: 'reference_id', type: 'string', size: 255, required: false },
      { key: 'related_document_id', type: 'string', size: 255, required: false },
      { key: 'related_document_type', type: 'string', size: 50, required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'transaction_date', type: 'datetime', required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'transaction_type_idx', type: 'key', attributes: ['transaction_type'], orders: ['ASC'] },
      { key: 'amount_idx', type: 'key', attributes: ['amount'], orders: ['DESC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'transaction_date_idx', type: 'key', attributes: ['transaction_date'], orders: ['DESC'] },
      { key: 'category_idx', type: 'key', attributes: ['category'], orders: ['ASC'] },
    ]
  },

  legal_consultations: {
    name: 'Legal Consultations',
    documentSecurity: true,
    attributes: [
      { key: 'client_name', type: 'string', size: 255, required: true },
      { key: 'client_phone', type: 'string', size: 20, required: true },
      { key: 'client_email', type: 'string', size: 255, required: false },
      { key: 'case_type', type: 'string', size: 100, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'urgency', type: 'string', size: 20, required: true },
      { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
      { key: 'lawyer_notes', type: 'string', size: 2000, required: false },
      { key: 'appointment_date', type: 'datetime', required: false },
      { key: 'consultation_date', type: 'datetime', required: true },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'client_name_idx', type: 'key', attributes: ['client_name'], orders: ['ASC'] },
      { key: 'case_type_idx', type: 'key', attributes: ['case_type'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'consultation_date_idx', type: 'key', attributes: ['consultation_date'], orders: ['DESC'] },
    ]
  },

  events: {
    name: 'Events',
    documentSecurity: true,
    attributes: [
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'event_type', type: 'string', size: 50, required: true },
      { key: 'start_date', type: 'datetime', required: true },
      { key: 'end_date', type: 'datetime', required: true },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'max_attendees', type: 'integer', required: false },
      { key: 'current_attendees', type: 'integer', required: true, default: 0 },
      { key: 'status', type: 'string', size: 20, required: true, default: 'scheduled' },
      { key: 'registration_required', type: 'boolean', required: true, default: false },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'title_idx', type: 'key', attributes: ['title'], orders: ['ASC'] },
      { key: 'event_type_idx', type: 'key', attributes: ['event_type'], orders: ['ASC'] },
      { key: 'start_date_idx', type: 'key', attributes: ['start_date'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
    ]
  },

  inventory_items: {
    name: 'Inventory Items',
    documentSecurity: true,
    attributes: [
      { key: 'item_name', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'category', type: 'string', size: 100, required: true },
      { key: 'quantity', type: 'integer', required: true },
      { key: 'unit', type: 'string', size: 20, required: true },
      { key: 'unit_price', type: 'double', required: false },
      { key: 'total_value', type: 'double', required: false },
      { key: 'supplier', type: 'string', size: 255, required: false },
      { key: 'purchase_date', type: 'datetime', required: false },
      { key: 'expiry_date', type: 'datetime', required: false },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'status', type: 'string', size: 20, required: true, default: 'available' },
      { key: 'created_at', type: 'datetime', required: true },
      { key: 'updated_at', type: 'datetime', required: true },
      { key: 'created_by', type: 'string', size: 255, required: true },
      { key: 'updated_by', type: 'string', size: 255, required: false },
    ],
    indexes: [
      { key: 'item_name_idx', type: 'key', attributes: ['item_name'], orders: ['ASC'] },
      { key: 'category_idx', type: 'key', attributes: ['category'], orders: ['ASC'] },
      { key: 'status_idx', type: 'key', attributes: ['status'], orders: ['ASC'] },
      { key: 'quantity_idx', type: 'key', attributes: ['quantity'], orders: ['DESC'] },
    ]
  }
};

// RLS Policies
const rlsPolicies = {
  user_profiles: [
    {
      label: 'Users can read their own profile',
      expression: 'user.$id == $userId',
      permissions: ['read']
    },
    {
      label: 'Admins can read all profiles',
      expression: 'user.role == "admin"',
      permissions: ['read']
    },
    {
      label: 'Managers can read user profiles',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['read']
    }
  ],
  beneficiaries: [
    {
      label: 'All authenticated users can read beneficiaries',
      expression: 'user.status == "active"',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can create beneficiaries',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['create']
    },
    {
      label: 'Managers and admins can update beneficiaries',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['update']
    },
    {
      label: 'Only admins can delete beneficiaries',
      expression: 'user.role == "admin"',
      permissions: ['delete']
    }
  ],
  donations: [
    {
      label: 'All authenticated users can read donations',
      expression: 'user.status == "active"',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can create donations',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['create']
    },
    {
      label: 'Managers and admins can update donations',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['update']
    },
    {
      label: 'Only admins can delete donations',
      expression: 'user.role == "admin"',
      permissions: ['delete']
    }
  ],
  campaigns: [
    {
      label: 'All authenticated users can read campaigns',
      expression: 'user.status == "active"',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can create campaigns',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['create']
    },
    {
      label: 'Managers and admins can update campaigns',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['update']
    },
    {
      label: 'Only admins can delete campaigns',
      expression: 'user.role == "admin"',
      permissions: ['delete']
    }
  ],
  aid_applications: [
    {
      label: 'All authenticated users can read aid applications',
      expression: 'user.status == "active"',
      permissions: ['read']
    },
    {
      label: 'All authenticated users can create aid applications',
      expression: 'user.status == "active"',
      permissions: ['create']
    },
    {
      label: 'Managers and admins can update aid applications',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['update']
    },
    {
      label: 'Only admins can delete aid applications',
      expression: 'user.role == "admin"',
      permissions: ['delete']
    }
  ],
  notifications: [
    {
      label: 'Users can read their own notifications',
      expression: 'user.$id == $userId',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can read all notifications',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can create notifications',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['create']
    },
    {
      label: 'Users can update their own notifications',
      expression: 'user.$id == $userId',
      permissions: ['update']
    }
  ],
  tasks: [
    {
      label: 'Users can read tasks assigned to them',
      expression: 'user.$id == $assignedTo',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can read all tasks',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can create tasks',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['create']
    },
    {
      label: 'Users can update tasks assigned to them',
      expression: 'user.$id == $assignedTo',
      permissions: ['update']
    }
  ],
  finance_transactions: [
    {
      label: 'Managers and admins can read finance transactions',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can create finance transactions',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['create']
    },
    {
      label: 'Managers and admins can update finance transactions',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['update']
    },
    {
      label: 'Only admins can delete finance transactions',
      expression: 'user.role == "admin"',
      permissions: ['delete']
    }
  ],
  legal_consultations: [
    {
      label: 'All authenticated users can read legal consultations',
      expression: 'user.status == "active"',
      permissions: ['read']
    },
    {
      label: 'All authenticated users can create legal consultations',
      expression: 'user.status == "active"',
      permissions: ['create']
    },
    {
      label: 'Managers and admins can update legal consultations',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['update']
    },
    {
      label: 'Only admins can delete legal consultations',
      expression: 'user.role == "admin"',
      permissions: ['delete']
    }
  ],
  events: [
    {
      label: 'All authenticated users can read events',
      expression: 'user.status == "active"',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can create events',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['create']
    },
    {
      label: 'Managers and admins can update events',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['update']
    },
    {
      label: 'Only admins can delete events',
      expression: 'user.role == "admin"',
      permissions: ['delete']
    }
  ],
  inventory_items: [
    {
      label: 'All authenticated users can read inventory items',
      expression: 'user.status == "active"',
      permissions: ['read']
    },
    {
      label: 'Managers and admins can create inventory items',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['create']
    },
    {
      label: 'Managers and admins can update inventory items',
      expression: 'user.role in ["admin", "manager"]',
      permissions: ['update']
    },
    {
      label: 'Only admins can delete inventory items',
      expression: 'user.role == "admin"',
      permissions: ['delete']
    }
  ]
};

// Helper functions
async function createDatabase() {
  try {
    console.log('Creating database...');
    const database = await databases.create(
      ID.unique(),
      'Kafkasder Database',
      'Main database for Kafkasder Management System'
    );
    console.log(`Database created: ${database.$id}`);
    return database.$id;
  } catch (error) {
    if (error.code === 409) {
      console.log('Database already exists, using existing database...');
      return config.databaseId;
    }
    throw error;
  }
}

async function createCollection(collectionId, schema) {
  try {
    console.log(`Creating collection: ${collectionId}`);
    const collection = await databases.createCollection(
      config.databaseId,
      ID.unique(),
      schema.name,
      schema.documentSecurity
    );
    console.log(`Collection created: ${collection.$id}`);

    // Create attributes
    for (const attr of schema.attributes) {
      try {
        await databases.createStringAttribute(
          config.databaseId,
          collection.$id,
          attr.key,
          attr.size,
          attr.required,
          attr.default
        );
        console.log(`  Attribute created: ${attr.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  Attribute already exists: ${attr.key}`);
        } else {
          console.error(`  Error creating attribute ${attr.key}:`, error.message);
        }
      }
    }

    // Create indexes
    for (const index of schema.indexes) {
      try {
        await databases.createIndex(
          config.databaseId,
          collection.$id,
          index.key,
          index.type,
          index.attributes,
          index.orders
        );
        console.log(`  Index created: ${index.key}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`  Index already exists: ${index.key}`);
        } else {
          console.error(`  Error creating index ${index.key}:`, error.message);
        }
      }
    }

    return collection.$id;
  } catch (error) {
    if (error.code === 409) {
      console.log(`Collection already exists: ${collectionId}`);
      return collectionId;
    }
    throw error;
  }
}

async function createRLSPolicy(collectionId, policies) {
  try {
    console.log(`Creating RLS policies for: ${collectionId}`);
    for (const policy of policies) {
      try {
        await databases.createDocument(
          config.databaseId,
          collectionId,
          ID.unique(),
          {
            label: policy.label,
            expression: policy.expression,
            permissions: policy.permissions
          }
        );
        console.log(`  RLS Policy created: ${policy.label}`);
      } catch (error) {
        console.error(`  Error creating RLS policy:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error creating RLS policies for ${collectionId}:`, error.message);
  }
}

// Main setup function
async function setupDatabase() {
  try {
    console.log('Starting Appwrite database setup...');
    console.log(`Endpoint: ${config.endpoint}`);
    console.log(`Project ID: ${config.projectId}`);

    // Create database
    const databaseId = await createDatabase();
    config.databaseId = databaseId;

    // Create collections
    for (const [collectionId, schema] of Object.entries(collections)) {
      await createCollection(collectionId, schema);
    }

    // Create RLS policies
    for (const [collectionId, policies] of Object.entries(rlsPolicies)) {
      await createRLSPolicy(collectionId, policies);
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log(`Database ID: ${config.databaseId}`);
    console.log('\nNext steps:');
    console.log('1. Update your .env file with the database ID');
    console.log('2. Create initial admin user');
    console.log('3. Test the application');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, config, collections, rlsPolicies };
