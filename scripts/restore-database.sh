#!/bin/bash

# ============================================================================
# DATABASE RESTORE SCRIPT
# ============================================================================
# Description: Restore database from backup
# Usage: ./scripts/restore-database.sh [backup_file]
# ============================================================================

set -e

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
    exit 1
fi

# Get backup file
BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh backups/*.sql.gz 2>/dev/null || echo "No backups found"
    echo ""
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Confirmation
echo -e "${RED}⚠️  WARNING: This will replace the current database!${NC}"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Create safety backup before restore
echo -e "${YELLOW}Creating safety backup...${NC}"
SAFETY_BACKUP="backups/pre_restore_$(date +%Y%m%d_%H%M%S).sql"
pg_dump "$SUPABASE_DB_URL" > "$SAFETY_BACKUP"
gzip "$SAFETY_BACKUP"
echo -e "${GREEN}Safety backup created: ${SAFETY_BACKUP}.gz${NC}"

# Decompress if needed
TEMP_FILE="$BACKUP_FILE"
if [[ $BACKUP_FILE == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
fi

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
psql "$SUPABASE_DB_URL" < "$TEMP_FILE"

# Cleanup temp file
if [[ $BACKUP_FILE == *.gz ]]; then
    rm "$TEMP_FILE"
fi

echo -e "${GREEN}✅ Database restored successfully!${NC}"

# Send notification (optional)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✅ Database restored from: $BACKUP_FILE\"}"
fi
