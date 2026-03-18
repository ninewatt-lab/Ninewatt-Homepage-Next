#!/bin/bash
# Ninewatt DB 자동 백업 스크립트
# EC2에서 cron으로 실행하여 S3에 백업합니다.
#
# 설정:
#   1. S3_BUCKET 변수를 실제 버킷명으로 변경
#   2. EC2에 S3 write 권한이 있는 IAM Role 또는 AWS CLI 설정 필요
#   3. cron 등록: (crontab -l; echo "0 3 * * * /home/ec2-user/db-backup.sh >> /home/ec2-user/db-backup.log 2>&1") | crontab -

set -euo pipefail

# --- 설정 ---
S3_BUCKET="ninewatt-backups"           # S3 버킷명 (변경 필요)
S3_PREFIX="db-backups"                  # S3 내 경로
DB_CONTAINER="ninewatt-db"              # PostgreSQL Docker 컨테이너명
DB_USER="ninewatt"                      # DB 사용자
DB_NAME="ninewatt"                      # DB 이름
RETENTION_DAYS=30                       # 백업 보관 기간 (일)
BACKUP_DIR="/tmp"

# --- 백업 실행 ---
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ninewatt-backup-${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting DB backup..."

# dump & compress
docker exec ${DB_CONTAINER} pg_dump -U ${DB_USER} ${DB_NAME} | gzip > "${BACKUP_FILE}"

FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date)] Dump complete: ${BACKUP_FILE} (${FILESIZE})"

# S3 업로드
aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/${S3_PREFIX}/ninewatt-backup-${TIMESTAMP}.sql.gz"
echo "[$(date)] Uploaded to s3://${S3_BUCKET}/${S3_PREFIX}/"

# 로컬 임시 파일 삭제
rm -f "${BACKUP_FILE}"

# --- 오래된 백업 삭제 ---
echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days..."
CUTOFF_DATE=$(date -d "-${RETENTION_DAYS} days" +%Y-%m-%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y-%m-%d)

aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | while read -r line; do
  FILE_DATE=$(echo "$line" | awk '{print $1}')
  FILE_NAME=$(echo "$line" | awk '{print $4}')
  if [ -n "$FILE_NAME" ] && [[ "$FILE_DATE" < "$CUTOFF_DATE" ]]; then
    aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${FILE_NAME}"
    echo "[$(date)] Deleted old backup: ${FILE_NAME}"
  fi
done

echo "[$(date)] Backup complete!"
