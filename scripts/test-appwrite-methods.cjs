const { Client, Databases } = require('appwrite');

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68e99f6c000183bafb39');

const databases = new Databases(client);

console.log('Available methods on databases:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(databases)));

// Test database list
async function testMethods() {
  try {
    console.log('\n🔍 Testing database methods...');
    const result = await databases.list();
    console.log('✅ databases.list() works:', result);
  } catch (error) {
    console.log('❌ databases.list() failed:', error.message);
  }
}

testMethods();
