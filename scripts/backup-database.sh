#!/bin/bash

# ============================================================================
# DATABASE BACKUP SCRIPT
# ============================================================================
# Description: Automated database backup for Supabase PostgreSQL
# Usage: ./scripts/backup-database.sh
# ============================================================================

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="kafkasder_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required variables
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL not set${NC}"
    echo "Please set SUPABASE_DB_URL in .env file"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Timestamp: $TIMESTAMP"
echo "Backup file: $BACKUP_FILE"

# Perform backup
echo -e "${YELLOW}Dumping database...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --format=plain \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    > "$BACKUP_DIR/$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip "$BACKUP_DIR/$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Calculate file size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}Backup completed: $BACKUP_SIZE${NC}"

# Upload to cloud storage (optional)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo -e "${YELLOW}Uploading to S3...${NC}"
    aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" "s3://$AWS_S3_BUCKET/backups/$BACKUP_FILE"
    echo -e "${GREEN}Uploaded to S3${NC}"
fi

# Clean old backups
echo -e "${YELLOW}Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "kafkasder_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}Cleanup completed${NC}"

# Create backup manifest
cat > "$BACKUP_DIR/latest.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "file": "$BACKUP_FILE",
  "size": "$BACKUP_SIZE",
  "retention_days": $RETENTION_DAYS
}
EOF

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo "Backup location: $BACKUP_DIR/$BACKUP_FILE"

# Send notification (optional)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✅ Database backup completed: $BACKUP_FILE ($BACKUP_SIZE)\"}"
fi
