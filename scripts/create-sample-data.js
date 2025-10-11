#!/usr/bin/env node

/**
 * Create Sample Data Script
 * Creates sample data for testing the database
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

// Configuration
const config = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '68e99f6c000183bafb39',
  databaseId: 'kafkasder_db',
  apiKey: 'standard_312fec86d74bc55b3f6b026062001bfa144270f98504aa424c86054d9aa0b3a114fb5428bb24faef633a44a76ee5aff9eaa29a808bf78a1f0be63248c9582ca8ced7465a414e7572bed11156df1c859b0e57a5a30c9f74ebc73ef80bd2866c7a5fcd747477c9d08f8d4f4d975530acc666e872a9b33599b5421ae45ef9e3f67e',
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);

async function createSampleData() {
  try {
    console.log('📊 Creating sample data...');
    
    // Sample beneficiaries
    const sampleBeneficiaries = [
      {
        ad_soyad: 'Ahmet Yılmaz',
        telefon_no: '+905551234567',
        sehri: 'İstanbul',
        yerlesimi: 'Kadıköy',
        mahalle: 'Moda',
        adres: 'Moda Mahallesi, Kadıköy/İstanbul',
        uyruk: 'Türk',
        ulkesi: 'Türkiye',
        iban: 'TR1234567890123456789012345',
        ailedeki_kisi_sayisi: 4,
        toplam_tutar: 5000,
        kategori: 'Yardım',
        tur: 'Nakit',
        kayit_tarihi: new Date().toISOString(),
        kimlik_no: '12345678901',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      },
      {
        ad_soyad: 'Fatma Demir',
        telefon_no: '+905559876543',
        sehri: 'Ankara',
        yerlesimi: 'Çankaya',
        mahalle: 'Kızılay',
        adres: 'Kızılay Mahallesi, Çankaya/Ankara',
        uyruk: 'Türk',
        ulkesi: 'Türkiye',
        iban: 'TR9876543210987654321098765',
        ailedeki_kisi_sayisi: 3,
        toplam_tutar: 3000,
        kategori: 'Yardım',
        tur: 'Nakit',
        kayit_tarihi: new Date().toISOString(),
        kimlik_no: '98765432109',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      }
    ];

    for (const beneficiary of sampleBeneficiaries) {
      try {
        await databases.createDocument(
          config.databaseId,
          'beneficiaries',
          ID.unique(),
          beneficiary,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user('admin-user')),
            Permission.delete(Role.user('admin-user')),
          ]
        );
        console.log(`  ✅ Sample beneficiary created: ${beneficiary.ad_soyad}`);
      } catch (error) {
        console.error(`  ❌ Error creating sample beneficiary:`, error.message);
      }
    }

    // Sample donations
    const sampleDonations = [
      {
        donor_name: 'Mehmet Kaya',
        donor_email: 'mehmet@example.com',
        donor_phone: '+905551112233',
        amount: 1000,
        currency: 'TRY',
        payment_method: 'Bank Transfer',
        donation_type: 'Regular',
        status: 'completed',
        notes: 'Monthly donation',
        donation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      },
      {
        donor_name: 'Ayşe Özkan',
        donor_email: 'ayse@example.com',
        donor_phone: '+905554445566',
        amount: 500,
        currency: 'TRY',
        payment_method: 'Credit Card',
        donation_type: 'One-time',
        status: 'completed',
        notes: 'Emergency donation',
        donation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      }
    ];

    for (const donation of sampleDonations) {
      try {
        await databases.createDocument(
          config.databaseId,
          'donations',
          ID.unique(),
          donation,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user('admin-user')),
            Permission.delete(Role.user('admin-user')),
          ]
        );
        console.log(`  ✅ Sample donation created: ${donation.donor_name}`);
      } catch (error) {
        console.error(`  ❌ Error creating sample donation:`, error.message);
      }
    }

    // Sample campaigns
    const sampleCampaigns = [
      {
        title: 'Kış Yardım Kampanyası',
        description: 'Soğuk kış aylarında ihtiyaç sahibi ailelere yardım kampanyası',
        target_amount: 50000,
        current_amount: 15000,
        currency: 'TRY',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        status: 'active',
        category: 'Yardım',
        tags: 'kış,yardım,acil',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-user',
      }
    ];

    for (const campaign of sampleCampaigns) {
      try {
        await databases.createDocument(
          config.databaseId,
          'campaigns',
          ID.unique(),
          campaign,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user('admin-user')),
            Permission.delete(Role.user('admin-user')),
          ]
        );
        console.log(`  ✅ Sample campaign created: ${campaign.title}`);
      } catch (error) {
        console.error(`  ❌ Error creating sample campaign:`, error.message);
      }
    }

    // Sample aid applications
    const sampleAidApplications = [
      {
        applicant_name: 'Ali Veli',
        applicant_phone: '+905557778899',
        applicant_email: 'ali@example.com',
        aid_type: 'Nakit Yardım',
        description: 'Acil nakit ihtiyacı',
        urgency_level: 'high',
        requested_amount: 2000,
        status: 'pending',
        application_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'operator-user',
      }
    ];

    for (const application of sampleAidApplications) {
      try {
        await databases.createDocument(
          config.databaseId,
          'aid_applications',
          ID.unique(),
          application,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user('admin-user')),
            Permission.delete(Role.user('admin-user')),
          ]
        );
        console.log(`  ✅ Sample aid application created: ${application.applicant_name}`);
      } catch (error) {
        console.error(`  ❌ Error creating sample aid application:`, error.message);
      }
    }

    // Sample tasks
    const sampleTasks = [
      {
        title: 'Yardım paketlerini hazırla',
        description: 'Kış yardım kampanyası için paketleri hazırla',
        priority: 'high',
        status: 'pending',
        assigned_to: 'operator-user',
        assigned_by: 'admin-user',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        tags: 'yardım,kampanya',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    for (const task of sampleTasks) {
      try {
        await databases.createDocument(
          config.databaseId,
          'tasks',
          ID.unique(),
          task,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user('admin-user')),
            Permission.delete(Role.user('admin-user')),
          ]
        );
        console.log(`  ✅ Sample task created: ${task.title}`);
      } catch (error) {
        console.error(`  ❌ Error creating sample task:`, error.message);
      }
    }

    // Sample notifications
    const sampleNotifications = [
      {
        title: 'Yeni Yardım Başvurusu',
        message: 'Ali Veli adlı kişiden yeni yardım başvurusu geldi',
        type: 'aid_application',
        priority: 'normal',
        target_user_id: 'admin-user',
        target_role: 'admin',
        is_read: false,
        action_url: '/aid-applications',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'system',
      }
    ];

    for (const notification of sampleNotifications) {
      try {
        await databases.createDocument(
          config.databaseId,
          'notifications',
          ID.unique(),
          notification,
          [
            Permission.read(Role.any()),
            Permission.update(Role.user('admin-user')),
            Permission.delete(Role.user('admin-user')),
          ]
        );
        console.log(`  ✅ Sample notification created: ${notification.title}`);
      } catch (error) {
        console.error(`  ❌ Error creating sample notification:`, error.message);
      }
    }

    console.log('\n🎉 Sample data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createSampleData();
}

export { createSampleData };
