#!/bin/bash
# PDF → 페이지별 JPG 변환 스크립트
# 사용법: ./scripts/generate-patent-pages.sh
# 의존성: pdftoppm (poppler)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PDF_DIR="$PROJECT_DIR/assets/documents/files"
OUT_DIR="$PROJECT_DIR/assets/documents/pages/patents"
S3_BASE="https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com/documents/patents/pages"

DPI=150
QUALITY=85

# patents.ts 에서 사용하는 특허 PDF 목록 (파일명 기준)
PATENT_PDFS=(
  "복지관 실내 환경 관리 서버"
  "전기 자동차 충전 시스템_1"
  "전기 자동차 충전 시스템_2"
  "복지관 실내 환경 관리 시스템"
  "음용량 표시 시스템, 방법 및 이를 위한 장치"
  "주소지의 에너지 사용량에 대한 평가 정보를 결정하는 방법 및 서버"
  "건물 에너지 분석 플랫폼의 정보검색증강 기반 자연어 질의응답 서비스를 제공하는 방법 및 시스템"
  "발전 설비의 발전량을 예측하는 방법"
  "고령자에게 복지관의 환기 상태 알림을 제공하고 복지관의 환경을 관리하기 위한 플랫폼"
  "전기 자동차 충전 시스템_3"
  "인공지능 모델 기반 건물의 에너지 사용량 및 절약 방법 추론 솔루션 제공 방법 장치 및 시스템"
  "건물 에너지 모델링 자동화 시스템 및 이를 이용한 방법"
  "에너지 효율화 대상 건물을 선정하는 서버 및 이를 이용한 에너지 효율화 대상 건물 선정 방법"
  "빌딩 에너지 데이터 기반 충전기 설치 장소 결정 방법 및 그 장치"
  "스마트 미터를 이용한 블루투스 기반의 무선 원격 검침 시스템, 방법 및 이를 위한 장치"
  "감응형 냉난방 제어 시스템의 구동 방법"
  "건물 쉐이프 모델링 생성 시스템 및 방법"
  "RAG LLM 기반의 리트로핏 대상물의 에너지 운영 시뮬레이션 장치"
  "공유형 에너지 저장 시스템의 용량 배분 방법 및 시스템"
  "공유형 에너지 저장 시스템의 운영 방법 및 시스템"
  "모빌리티 허브 에너지 운영 장치 및 방법"
  "전력 시계열 데이터 적응형 청킹 방법 및 장치"
  "전력 시스템 상황 기반 계층적 LLM 에이전트 라우팅 방법 및 장치"
)

mkdir -p "$OUT_DIR"

echo "=== Patent PDF → JPG Conversion ==="
echo ""

for name in "${PATENT_PDFS[@]}"; do
  pdf="$PDF_DIR/${name}.pdf"
  out_subdir="$OUT_DIR/${name}"

  if [ ! -f "$pdf" ]; then
    echo "⚠ SKIP (PDF not found): $name"
    continue
  fi

  # Skip if already converted
  if [ -d "$out_subdir" ] && [ "$(ls "$out_subdir"/*.jpg 2>/dev/null | wc -l)" -gt 0 ]; then
    count=$(ls "$out_subdir"/*.jpg | wc -l)
    echo "✓ SKIP (already done, ${count} pages): $name"
    continue
  fi

  mkdir -p "$out_subdir"
  echo -n "⏳ Converting: $name ... "

  pdftoppm -jpeg -r "$DPI" -jpegopt "quality=$QUALITY" "$pdf" "$out_subdir/page"

  count=$(ls "$out_subdir"/*.jpg | wc -l)
  echo "done (${count} pages)"
done

echo ""
echo "=== Generating imageUrls JSON ==="

# Generate JSON mapping for use in patents.ts
echo "{" > "$OUT_DIR/mapping.json"
first=true
for name in "${PATENT_PDFS[@]}"; do
  encoded_name="$(echo "$name" | sed 's/ /+/g')"
  out_subdir="$OUT_DIR/$encoded_name"

  if [ ! -d "$out_subdir" ]; then
    continue
  fi

  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> "$OUT_DIR/mapping.json"
  fi

  s3_encoded="$(python3 -c "import urllib.parse; print(urllib.parse.quote('$name', safe=''))")"

  echo -n "  \"$name\": [" >> "$OUT_DIR/mapping.json"
  page_first=true
  for jpg in $(ls "$out_subdir"/*.jpg | sort); do
    page_file=$(basename "$jpg")
    if [ "$page_first" = true ]; then
      page_first=false
    else
      echo -n ", " >> "$OUT_DIR/mapping.json"
    fi
    echo -n "\"$S3_BASE/$s3_encoded/$page_file\"" >> "$OUT_DIR/mapping.json"
  done
  echo -n "]" >> "$OUT_DIR/mapping.json"
done
echo "" >> "$OUT_DIR/mapping.json"
echo "}" >> "$OUT_DIR/mapping.json"

echo "✓ mapping.json written to $OUT_DIR/mapping.json"
echo ""
echo "=== Done ==="
echo "Next steps:"
echo "  1. Upload $OUT_DIR/ to S3: documents/patents/pages/"
echo "  2. Update src/data/patents.ts with imageUrls from mapping.json"
