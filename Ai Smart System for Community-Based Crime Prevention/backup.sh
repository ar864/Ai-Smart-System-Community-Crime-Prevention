#!/bin/bash

# MongoDB Backup Script
# Run this daily to backup your MongoDB database

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting MongoDB backup..."

# Backup MongoDB from Docker container
docker exec crime-prevention-mongo mongodump \
    --username admin \
    --password $(grep MONGO_PASSWORD .env.production | cut -d '=' -f2) \
    --authSource admin \
    --out "$BACKUP_DIR/backup_$TIMESTAMP"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$BACKUP_DIR" "backup_$TIMESTAMP"
rm -rf "$BACKUP_DIR/backup_$TIMESTAMP"

echo "✓ Backup completed: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

# Archive old backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -exec rm {} \;
echo "✓ Cleaned up backups older than $RETENTION_DAYS days"

# Optional: Upload to cloud storage
# aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" s3://your-bucket/backups/
# gsutil cp "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" gs://your-bucket/backups/
