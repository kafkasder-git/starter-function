/**
 * @fileoverview Database Policies Setup Script - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Client, Databases, ID, Permission, Role } from 'appwrite';
import { logger } from '../lib/logging/logger';
import { environment } from '../lib/environment';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(environment.appwrite.endpoint)
  .setProject(environment.appwrite.projectId);

const databases = new Databases(client);

/**
 * Family relationships collection policies
 * Bu script, family_relationships tablosu için gerekli permission'ları oluşturur
 */
async function setupFamilyRelationshipsPolicies() {
  try {
    logger.info('🔧 Setting up family relationships collection policies...');

    // Family relationships collection'ını oluştur
    await databases.createCollection(
      environment.appwrite.databaseId,
      'family_relationships',
      'Aile İlişkileri',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Attributes ekle
    await databases.createStringAttribute(
      environment.appwrite.databaseId,
      'family_relationships',
      'primary_beneficiary_id',
      255,
      true
    );

    await databases.createStringAttribute(
      environment.appwrite.databaseId,
      'family_relationships',
      'dependent_beneficiary_id',
      255,
      true
    );

    await databases.createStringAttribute(
      environment.appwrite.databaseId,
      'family_relationships',
      'relationship_type',
      50,
      true
    );

    await databases.createStringAttribute(
      environment.appwrite.databaseId,
      'family_relationships',
      'status',
      20,
      true
    );

    await databases.createStringAttribute(
      environment.appwrite.databaseId,
      'family_relationships',
      'notes',
      1000,
      false
    );

    // Indexes ekle
    await databases.createIndex(
      environment.appwrite.databaseId,
      'family_relationships',
      'idx_primary_beneficiary',
      'key',
      ['primary_beneficiary_id']
    );

    await databases.createIndex(
      environment.appwrite.databaseId,
      'family_relationships',
      'idx_dependent_beneficiary',
      'key',
      ['dependent_beneficiary_id']
    );

    await databases.createIndex(
      environment.appwrite.databaseId,
      'family_relationships',
      'idx_relationship_type',
      'key',
      ['relationship_type']
    );

    logger.info('✅ Family relationships collection policies created successfully');
  } catch (error: any) {
    if (error.code === 409) {
      logger.info('ℹ️ Family relationships collection already exists');
    } else {
      logger.error('❌ Failed to create family relationships policies:', error);
      throw error;
    }
  }
}

/**
 * Users collection policies güncellemesi
 * Daha güvenli permission yapısı için
 */
async function updateUsersCollectionPolicies() {
  try {
    logger.info('🔧 Updating users collection policies...');

    // Mevcut collection'ı güncelle (permissions)
    await databases.updateCollection(
      environment.appwrite.databaseId,
      'users',
      'Kullanıcılar',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    logger.info('✅ Users collection policies updated successfully');
  } catch (error: any) {
    logger.error('❌ Failed to update users collection policies:', error);
    throw error;
  }
}

/**
 * Beneficiaries collection policies güncellemesi
 */
async function updateBeneficiariesCollectionPolicies() {
  try {
    logger.info('🔧 Updating beneficiaries collection policies...');

    await databases.updateCollection(
      environment.appwrite.databaseId,
      'beneficiaries',
      'İhtiyaç Sahipleri',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    logger.info('✅ Beneficiaries collection policies updated successfully');
  } catch (error: any) {
    logger.error('❌ Failed to update beneficiaries collection policies:', error);
    throw error;
  }
}

/**
 * Donations collection policies güncellemesi
 */
async function updateDonationsCollectionPolicies() {
  try {
    logger.info('🔧 Updating donations collection policies...');

    await databases.updateCollection(
      environment.appwrite.databaseId,
      'donations',
      'Bağışlar',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    logger.info('✅ Donations collection policies updated successfully');
  } catch (error: any) {
    logger.error('❌ Failed to update donations collection policies:', error);
    throw error;
  }
}

/**
 * Ana setup fonksiyonu
 */
async function setupDatabasePolicies() {
  try {
    logger.info('🚀 Starting database policies setup...');

    // Collection policy'lerini sırayla oluştur/güncelle
    await setupFamilyRelationshipsPolicies();
    await updateUsersCollectionPolicies();
    await updateBeneficiariesCollectionPolicies();
    await updateDonationsCollectionPolicies();

    logger.info('🎉 Database policies setup completed successfully!');
  } catch (error) {
    logger.error('💥 Database policies setup failed:', error);
    process.exit(1);
  }
}

// Script çalıştırma
if (require.main === module) {
  setupDatabasePolicies();
}

export { setupDatabasePolicies };
