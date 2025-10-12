#!/bin/bash

# Appwrite Collections Setup Script
# This script creates all required collections for the application

PROJECT_ID="68e99f6c000183bafb39"
DATABASE_ID="kafkasder_db"
ENDPOINT="https://fra.cloud.appwrite.io/v1"
API_KEY="e65cc8115519de40cfa9723474aa9e80647afc3f5d41ef2e67bf84e87290cba3ecdec9a98eacdd9632947e1c8083af7928b70e6b7e11584fc6c7fb2dc9dce1416a8c819c54e28b85a00f1315f092cd586fbadd0986192082140a0929af65050327d426bef44d0329afa57e0ab331fe18956d5919d3ba20e84f8fefdbed404ca6"

echo "🚀 Setting up Appwrite Collections..."
echo "Project: $PROJECT_ID"
echo "Database: $DATABASE_ID"
echo ""

# Function to create a collection
create_collection() {
    local COLLECTION_ID=$1
    local COLLECTION_NAME=$2

    echo "📦 Creating collection: $COLLECTION_NAME ($COLLECTION_ID)"

    RESPONSE=$(curl -s -X POST "$ENDPOINT/databases/$DATABASE_ID/collections" \
      -H "Content-Type: application/json" \
      -H "X-Appwrite-Project: $PROJECT_ID" \
      -H "X-API-Key: $API_KEY" \
      -d "{
        \"collectionId\": \"$COLLECTION_ID\",
        \"name\": \"$COLLECTION_NAME\",
        \"documentSecurity\": true,
        \"enabled\": true,
        \"permissions\": [
          \"read(\\\"any\\\")\",
          \"create(\\\"users\\\")\",
          \"update(\\\"users\\\")\",
          \"delete(\\\"users\\\")\"
        ]
      }")

    if echo "$RESPONSE" | grep -q "\"code\""; then
        echo "❌ Error: $(echo $RESPONSE | python3 -c 'import sys, json; print(json.load(sys.stdin).get("message", "Unknown error"))')"
    else
        echo "✅ Collection created successfully"
    fi
    echo ""
}

# Create all collections
create_collection "beneficiaries" "Beneficiaries"
create_collection "donations" "Donations"
create_collection "aid_applications" "Aid Applications"
create_collection "members" "Members"

echo "✅ Collection setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add attributes to each collection via Appwrite Console"
echo "2. Or use the detailed schema from appwrite.json"
echo "3. Rerun TestSprite tests"
echo ""
echo "🔗 Appwrite Console: https://cloud.appwrite.io/console/project-$PROJECT_ID/databases/database-$DATABASE_ID"

