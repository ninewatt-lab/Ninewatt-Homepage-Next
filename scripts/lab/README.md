# Lab 도판·영상 만들기 (AI Building Workspace)

`/lab/ai-building-workspace` 의 도판과 영상을 실제 DXF 도면과 glb 모델에서 다시 만드는 스크립트다.
꾸민 목업이 아니라 입력 파일에서 그대로 뽑은 결과만 쓰는 것이 원칙이다.

## 익명화 규칙

- 도면 제목, 기관명, 설계사무소, 건축사 성명, 연락처는 `TEX`·`TXT`·`2`·`0` 레이어에 있다.
  스크립트는 선 레이어만 골라 그리므로 이 레이어들은 출력에 나오지 않는다.
- 그리는 레이어를 추가할 때는 그 레이어에 글자(TEXT/MTEXT/블록 속성)가 없는지 먼저 확인한다.
- 원본 DXF·glb·blend 는 `public/temp/`(git 제외)에만 둔다. 저장소에 커밋하지 않는다.
- 결과 이미지는 게시 전에 눈으로 한 번 더 확인한다.

## 준비

```bash
python3 -m venv /tmp/lab-venv && /tmp/lab-venv/bin/pip install -r scripts/lab/requirements.txt
```

그 밖에 Blender(4.0 에서 확인), ffmpeg 가 필요하다. 한글 라벨은 macOS 의 Apple SD Gothic Neo 를 쓴다.

## 순서

```bash
PY=/tmp/lab-venv/bin/python
BLENDER=/Applications/Blender.app/Contents/MacOS/Blender
DXF=public/temp/<도면>.dxf
GLB=public/temp/<모델>.glb
W=/tmp/lab-work && mkdir -p $W/tt $W/ex $W/pext $W/pwalk

# 1. 층별 평면 선도 + 실 경계 계산 (실 면적 JSON 출력 → labProjects.ts 의 areas, rooms-<층>.json 저장)
$PY scripts/lab/dxf_plan_figures.py $DXF $W 1f
$PY scripts/lab/dxf_plan_figures.py $DXF $W 2f

# 2. 정면도 선도
$PY scripts/lab/dxf_elevation.py $DXF $W/elev-dxf.png

# 3. 모델 렌더링
# zsh 는 변수에 담은 명령을 단어로 나누지 않으므로 함수로 쓴다
R() { "$BLENDER" -b --factory-startup --python scripts/lab/blender_render.py -- "$GLB" "$@"; }
P() { "$BLENDER" -b --factory-startup --python scripts/lab/blender_photo.py -- "$GLB" "$@"; }
R $W/elev-model-line.png front
R $W/model-axo-line.png axo
R $W/tt turntable                      # 약 4분
R $W/ex explode                        # 약 3분
R $W/cut1.png cut1 $W/rooms-1f.json    # 층별 단면 + 라벨 위치
R $W/cut2.png cut2 $W/rooms-2f.json
R $W/cut1-video.png cut1 $W/rooms-1f.json video
R $W/cut2-video.png cut2 $W/rooms-2f.json video

# 3-1. 마감재 적용 사실적 렌더링 (Cycles, M2 Pro GPU 기준 약 1시간 반)
P $W/photo-ext.png ext $W/rooms-1f.json $W/rooms-2f.json
P $W/photo-cut1.png cut1 $W/rooms-1f.json $W/rooms-2f.json
P $W/photo-walk.png walk $W/rooms-1f.json $W/rooms-2f.json
P $W/vcut1-photo.png cut1 $W/rooms-1f.json $W/rooms-2f.json video
P $W/pext ext-orbit $W/rooms-1f.json $W/rooms-2f.json video     # 120프레임
P $W/pwalk walk-anim $W/rooms-1f.json $W/rooms-2f.json video    # 120프레임
# 재질·빛을 맞출 때는 끝에 draft 를 붙이면 절반 해상도·저샘플로 빨리 본다

# 4. 단면에 실 이름·면적 라벨
$PY scripts/lab/label_cutaway.py $W/cut1.png $W/fig-cut1.png
$PY scripts/lab/label_cutaway.py $W/cut2.png $W/fig-cut2.png
$PY scripts/lab/label_cutaway.py $W/cut1-video.png $W/vcut1.png
$PY scripts/lab/label_cutaway.py $W/cut2-video.png $W/vcut2.png

# 5. 도면 ↔ 모델 겹쳐 보기 (--register 로 정합 오차 확인. 0 근처가 아니면 blender_render.py front 카메라 보정)
$PY scripts/lab/elevation_overlay.py $W/elev-dxf.png $W/elev-model-line.png $W/elev-overlay.png --register

# 5-1. 영상 (47초)
$PY scripts/lab/compose_video.py $W
ffmpeg -framerate 30 -i $W/vf/%05d.jpg -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart $W/case.mp4
aws s3 cp $W/case.mp4 s3://ninewatt-homepage/videos/lab/<새 파일명>.mp4 --content-type video/mp4

# 6. 사이트용 이미지
$PY scripts/lab/export_web.py $W public/lab/ai-building-workspace

# 6-1. 물량 산출 (L·A·WA, 자재별 물량, 예시 금액) → takeoff.json, 마킹 도면, 내역서 PDF
$BLENDER -b --factory-startup --python scripts/lab/blender_openings.py -- $GLB $W/openings.json   # 창·문 크기
$PY scripts/lab/quantity_takeoff.py $DXF $W
python3 scripts/lab/takeoff_report.py $W public/lab/ai-building-workspace/takeoff-report.pdf      # Chrome 필요
cp $W/takeoff.json src/data/lab/ai-building-workspace-takeoff.json    # 페이지 표 데이터 (names 필드는 빼도 된다)
$PY scripts/lab/export_web.py $W public/lab/ai-building-workspace    # takeoff-1f/2f.webp 포함

# 7. 웹 3D 뷰어 데이터 (모델 glb + 실 경계 폴리곤 + 도면 평면). 1번 단계의 rooms-*.json, plan-overlay-* 를 쓴다
$BLENDER -b --factory-startup --python scripts/lab/blender_web_export.py -- $GLB $W/model-web.glb
$PY scripts/lab/viewer_data.py $W public/lab/ai-building-workspace/viewer
```

## 값을 바꿀 때 같이 바꿀 곳

| 바꾸는 것 | 같이 맞출 곳 |
|---|---|
| 평면 `BOX` (dxf_plan_figures.py) | 도판 크기 → `labProjects.ts` figures 의 width/height |
| 정면 `BOX` (dxf_elevation.py) | `blender_render.py` front 카메라의 중심·ortho_scale |
| 실 면적 결과 | `labProjects.ts` areas, 문구의 면적 설명 |
| 단면 카메라·라벨 (blender_render.py cut1/cut2) | 라벨 위치는 rooms-<층>.json 으로 자동 계산된다. 평면 PRESETS 의 origin 이 틀리면 라벨이 실 밖에 찍힌다 |
| 영상 타임라인 (compose_video.py) | `labProjects.ts` video.chapters / duration, 각 로케일 `lab.json` chapters |
| 웹 뷰어 재질 (blender_web_export.py SPEC) | 웹에는 반사 환경맵이 없어 금속성을 올리면 까맣게 보인다. 조명은 LabModelCanvas.tsx |
| 도면 실 이름 | plan_common.py 의 KEYS 와 각 로케일 lab.json 의 case.rooms |
| 실별 마감 · 예시 단가 | quantity_takeoff.py 의 FINISH · PRICE, 각 로케일 lab.json 의 case.takeoff.finishes · materialNames |
| 이미지 내용 | 파일 이름도 바꾼다 (같은 URL 은 이미지 캐시가 예전 것을 준다) |

## 알려진 한계

- 실 경계는 벽·창호선으로 닫힌 영역을 찾는 방식이라, 칸막이 선이 없는 공간은 한 영역으로 묶인다
  (도판에서 "경계 검토 필요"로 표시). 이것은 **제품의 AI 인식 결과가 아니라 도판용 계산**이다.
  페이지에서도 "도면 레이어로 자동 계산"으로만 표기한다.
- 좌표(`BOX`, 평면 `origin`, 카메라 위치)는 이 도면 한 세트에 맞춘 값이다. 다른 도면에는 새로 잡아야 한다.
- 단면은 Boolean(EXACT)으로 자르고, 실패한 메시(이 모델에선 동쪽 외벽)만 FAST 로 다시 자른다.
- 도면에 실 이름이 없는 공간(2층 계단실·욕실)과 바깥으로 열린 베란다는 면적 표에 나오지 않는다.
- 모델의 실별 바닥 마감 판은 `VIS_F1_<실 이름>_Floor` 처럼 이름 끝이 `_Floor` 다(`Floor_0` 은 구조 슬래브).
  재질 분류할 때 둘 다 바닥으로 잡아야 한다.
- 물량 산출의 천장고는 모델 기준 2.74 m 하나로 쓴다. 창·문은 중심이 실 경계에서 0.35 m 안이면 그 실 벽의 것으로 본다.
  베란다 난간 길이는 경계 중 실내 실에서 0.6 m 넘게 떨어진 부분으로 추정한다. 2층 계단실은 닫힌 경계가 없어 빠진다.
- 3D 뷰어 확인은 헤드리스 브라우저에서 WebGL 이 없어 안 된다. 헤드 모드 브라우저로 본다.
