#!/bin/bash
# Ninewatt DB 복구 스크립트
# S3에서 백업을 다운로드하여 DB에 복원합니다.
#
# 사용법:
#   ./db-restore.sh                          # 최신 백업으로 복원
#   ./db-restore.sh ninewatt-backup-20260319-030000.sql.gz  # 특정 백업으로 복원

set -euo pipefail

# --- 설정 ---
S3_BUCKET="ninewatt-homepage"
S3_PREFIX="database_backup"
DB_CONTAINER="ninewatt-db"
DB_USER="ninewatt"
DB_NAME="ninewatt"
BACKUP_DIR="/tmp"

# --- 백업 파일 결정 ---
if [ -n "${1:-}" ]; then
  BACKUP_NAME="$1"
else
  echo "Fetching latest backup from S3..."
  BACKUP_NAME=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | sort | tail -1 | awk '{print $4}')
  if [ -z "$BACKUP_NAME" ]; then
    echo "Error: No backups found in s3://${S3_BUCKET}/${S3_PREFIX}/"
    exit 1
  fi
fi

BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}"

echo "Downloading: s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}"
aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}" "${BACKUP_FILE}"

# --- 복원 ---
echo "Restoring to ${DB_NAME}..."
echo "WARNING: This will overwrite existing data. Press Ctrl+C to cancel (5 seconds)..."
sleep 5

# DB 리셋 후 복원
gunzip -c "${BACKUP_FILE}" | docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} ${DB_NAME}

# 임시 파일 삭제
rm -f "${BACKUP_FILE}"

echo "Restore complete!"
