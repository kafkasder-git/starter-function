#!/bin/bash
API_KEY="e65cc8115519de40cfa9723474aa9e80647afc3f5d41ef2e67bf84e87290cba3ecdec9a98eacdd9632947e1c8083af7928b70e6b7e11584fc6c7fb2dc9dce1416a8c819c54e28b85a00f1315f092cd586fbadd0986192082140a0929af65050327d426bef44d0329afa57e0ab331fe18956d5919d3ba20e84f8fefdbed404ca6"
PROJECT="68e99f6c000183bafb39"
ENDPOINT="https://fra.cloud.appwrite.io/v1"
DB="kafkasder_db"

echo "🔧 Creating attributes for beneficiaries..."
curl -s -X POST "$ENDPOINT/databases/$DB/collections/beneficiaries/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"name","size":255,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ name' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/beneficiaries/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"tc_number","size":11,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ tc_number' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/beneficiaries/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"phone","size":20,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ phone' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/beneficiaries/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"address","size":1000,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ address' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/beneficiaries/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"status","size":50,"required":true,"default":"active"}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ status' if 'key' in r else '❌ '+r.get('message','error'))"

echo ""
echo "🔧 Creating attributes for donations..."
curl -s -X POST "$ENDPOINT/databases/$DB/collections/donations/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"donor_name","size":255,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ donor_name' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/donations/attributes/float" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"amount","required":true,"min":0}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ amount' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/donations/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"currency","size":10,"required":true,"default":"TRY"}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ currency' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/donations/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"donation_type","size":50,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ donation_type' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/donations/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"payment_method","size":50,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ payment_method' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/donations/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"status","size":50,"required":true,"default":"pending"}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ status' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/donations/attributes/datetime" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"donation_date","required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ donation_date' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/donations/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"notes","size":2000,"required":false}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ notes' if 'key' in r else '❌ '+r.get('message','error'))"

echo ""
echo "🔧 Creating attributes for aid_applications..."
curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"applicant_name","size":255,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ applicant_name' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"applicant_phone","size":20,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ applicant_phone' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"aid_type","size":50,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ aid_type' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/float" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"requested_amount","required":false,"min":0}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ requested_amount' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"status","size":50,"required":true,"default":"pending"}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ status' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"urgency","size":20,"required":true,"default":"medium"}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ urgency' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"description","size":2000,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ description' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/datetime" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"application_date","required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ application_date' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/aid_applications/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"assigned_to","size":255,"required":false}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ assigned_to' if 'key' in r else '❌ '+r.get('message','error'))"

echo ""
echo "🔧 Creating attributes for members..."
curl -s -X POST "$ENDPOINT/databases/$DB/collections/members/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"name","size":255,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ name' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/members/attributes/email" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"email","required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ email' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/members/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"phone","size":20,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ phone' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/members/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"membership_number","size":50,"required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ membership_number' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/members/attributes/string" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"status","size":50,"required":true,"default":"active"}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ status' if 'key' in r else '❌ '+r.get('message','error'))"

curl -s -X POST "$ENDPOINT/databases/$DB/collections/members/attributes/datetime" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Project: $PROJECT" \
  -H "X-API-Key: $API_KEY" \
  -d '{"key":"joined_date","required":true}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('✅ joined_date' if 'key' in r else '❌ '+r.get('message','error'))"

echo ""
echo "✅ Attribute creation complete!"
echo "⏳ Attributes are being processed... Wait 10-15 seconds before running tests."
