/**
 * Test script for beneficiaries collection
 * Bu script beneficiaries collection'ını test eder
 */

// Mock data for testing
const mockBeneficiaries = [
  {
    name: "Ahmet Yılmaz",
    tc_number: "12345678901",
    phone: "05321234567",
    email: "ahmet.yilmaz@example.com",
    address: "Atatürk Mahallesi, Cumhuriyet Caddesi No:15, Merkez/İstanbul",
    status: "active",
    created_at: new Date().toISOString()
  },
  {
    name: "Fatma Demir",
    tc_number: "12345678902", 
    phone: "05321234568",
    email: "fatma.demir@example.com",
    address: "Yeni Mahalle, İstiklal Sokak No:8, Kadıköy/İstanbul",
    status: "active",
    created_at: new Date().toISOString()
  },
  {
    name: "Mehmet Kaya",
    tc_number: "12345678903",
    phone: "05321234569", 
    email: "mehmet.kaya@example.com",
    address: "Çamlık Mahallesi, Gül Sokak No:22, Beşiktaş/İstanbul",
    status: "pending",
    created_at: new Date().toISOString()
  }
];

console.log("🧪 Beneficiaries Test Data:");
console.log("==========================");
mockBeneficiaries.forEach((beneficiary, index) => {
  console.log(`\n${index + 1}. ${beneficiary.name}`);
  console.log(`   TC: ${beneficiary.tc_number}`);
  console.log(`   Telefon: ${beneficiary.phone}`);
  console.log(`   Email: ${beneficiary.email}`);
  console.log(`   Adres: ${beneficiary.address}`);
  console.log(`   Durum: ${beneficiary.status}`);
});

console.log("\n✅ Test verileri hazır!");
console.log("📋 Toplam: " + mockBeneficiaries.length + " ihtiyaç sahibi");
