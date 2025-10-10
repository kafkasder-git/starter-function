#!/usr/bin/env node

/**
 * @fileoverview Service Testing Script
 * @description Test all Appwrite services to ensure they are properly configured
 */

import { serviceManager } from '../lib/services/serviceManager.js';
import { logger } from '../lib/logging/logger.js';

async function testServices() {
  console.log('🚀 Starting service tests...\n');

  try {
    // Initialize service manager
    console.log('📋 Initializing service manager...');
    await serviceManager.initialize();
    console.log('✅ Service manager initialized\n');

    // Test all services
    console.log('🔍 Testing all services...');
    const testResults = await serviceManager.testAllServices();
    
    console.log('\n📊 Test Results:');
    console.log('================');
    
    Object.entries(testResults.results).forEach(([serviceName, result]) => {
      const status = result.success ? '✅' : '❌';
      const message = result.success ? 'PASSED' : `FAILED: ${result.error}`;
      console.log(`${status} ${serviceName.padEnd(20)} ${message}`);
    });

    console.log(`\n🎯 Overall Result: ${testResults.success ? '✅ ALL SERVICES WORKING' : '❌ SOME SERVICES FAILED'}`);

    // Check service health
    console.log('\n🏥 Checking service health...');
    const healthStatus = await serviceManager.checkAllServicesHealth();
    
    console.log('\n📈 Health Status:');
    console.log('=================');
    console.log(`Overall: ${healthStatus.overall.toUpperCase()}`);
    console.log(`Timestamp: ${healthStatus.timestamp}`);
    
    Object.entries(healthStatus).forEach(([key, value]) => {
      if (key === 'overall' || key === 'timestamp') return;
      
      const health = value;
      const status = health.status === 'healthy' ? '✅' : 
                    health.status === 'degraded' ? '⚠️' : '❌';
      const responseTime = health.responseTime ? ` (${health.responseTime}ms)` : '';
      const error = health.error ? ` - ${health.error}` : '';
      
      console.log(`${status} ${health.name.padEnd(15)} ${health.status.toUpperCase()}${responseTime}${error}`);
    });

    // Get service statistics
    console.log('\n📊 Getting service statistics...');
    const stats = await serviceManager.getServiceStats();
    
    if (Object.keys(stats).length > 0) {
      console.log('\n📈 Service Statistics:');
      console.log('======================');
      
      Object.entries(stats).forEach(([serviceName, serviceStats]) => {
        console.log(`\n${serviceName.toUpperCase()}:`);
        if (serviceStats.totalFiles !== undefined) {
          console.log(`  Files: ${serviceStats.totalFiles}`);
          console.log(`  Buckets: ${serviceStats.bucketCount}`);
        }
        if (serviceStats.totalFunctions !== undefined) {
          console.log(`  Functions: ${serviceStats.totalFunctions}`);
          console.log(`  Enabled: ${serviceStats.enabledFunctions}`);
        }
      });
    }

    console.log('\n🎉 Service testing completed!');
    
    if (!testResults.success) {
      console.log('\n⚠️  Some services failed. Please check your Appwrite configuration.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Service testing failed:', error.message);
    console.error('\n🔧 Please check:');
    console.error('  1. Appwrite server is running');
    console.error('  2. Environment variables are set correctly');
    console.error('  3. Network connectivity to Appwrite');
    console.error('  4. Appwrite project permissions');
    
    process.exit(1);
  }
}

// Run the test
testServices().catch(console.error);
