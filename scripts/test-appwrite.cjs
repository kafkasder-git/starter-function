const { Client, Databases } = require('appwrite');

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('68e99f6c000183bafb39');

const databases = new Databases(client);

console.log('Available methods on databases:');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(databases)));

// Test simple method
async function testAppwrite() {
  try {
    const result = await databases.list('kafkasder_db');
    console.log('Database list result:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testAppwrite();
