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

## 에너지 간이 시뮬레이션 · 그린리모델링 예시 견적 (/expo)

결과는 `src/data/lab/ai-building-workspace-energy.json` 하나다(외피 면적, 전후 월별 냉난방 부하, 예시 견적).
EnergyPlus 9.0(`/Applications/EnergyPlus-9-0-1`)과 기상 파일이 필요하다. 기상은 climate.onebuilding.org 의
`KOR_KW_Sokcho.470900_TMYx.2004-2018` 을 썼다(공개 문구에는 지명 대신 "국내 표준 기상 데이터"로 적는다).

```bash
"$BLENDER" -b --factory-startup --python scripts/lab/blender_envelope.py -- "$GLB" $W/env.json
for c in before after; do
  python3 scripts/lab/energy_idf.py $W/env.json $c $W/$c.idf $EPW
  /Applications/EnergyPlus-9-0-1/energyplus -x -r -w $EPW -d $W/out_$c $W/$c.idf
done
# out_*/eplusmtr.csv 의 DistrictHeating/Cooling(J) 월별 합 → kWh 로 바꿔 energy.json 의 energy.before/after 에 넣는다
```

- 리모델링 전 외벽 U 1.0 · 창 4.0 은 노후 건물 가정값, 후 외벽(PF보드 100 mm 추가) · 창 1.8 은 도면 사양 기준.
  지붕 · 바닥 · 침기 · 재실은 전후 동일(보수적). 간이 결과이며 에너지효율등급이 아님을 페이지에 밝힌다.
- 예시 견적 단가: 외단열 110,000원/㎡, 창호 450,000원/㎡ + 내부 마감은 `quantity_takeoff.py` 합계.

## 부스 상영 영상 (무음 · 자막 · 81.5초 반복)

기존 47초 영상(v4) 뒤에 그린리모델링 · 열화상 3D 장면과 월별 부하 애니메이션, 견적 · 제품 · QR 카드를 붙인다.
결과는 S3 에 올리지 않고 부스 모니터에서 파일로 튼다.

```bash
V=$W/video   # base.mp4 = S3 의 ai-building-workspace-case-v4.mp4
python3 scripts/lab/expo_cards.py $V/cards <QR.svg>                       # 카드 · 자막 · 장면 오버레이 (Chrome)
B() { "$BLENDER" -b --factory-startup --python scripts/lab/blender_energy.py -- "$GLB" "$@"; }
B $V/insulate insulate; B $V/thermal thermal                               # 각 150프레임
python3 scripts/lab/expo_chart.py $V/chart                                 # 210프레임 (프레임마다 Chrome)
python3 scripts/lab/expo_video.py $V $V/base.mp4 $V/booth.mp4
```

열화상 색은 energy_idf.py 의 열관류율(전 외벽 1.0 · 창 4.0 → 후 0.16 · 1.8)을 0–4 W/㎡K 눈금에 놓은 것이다.

## 부스 영상 v3 (고급판, 78초 반복)

어두운 무대 + 백색 클레이 모델 + 한 가지 글꼴(Pretendard)로 통일한 판. 3D 는 Blender, 글자·도면·차트는 HTML 타임라인을
프레임마다 찍어(puppeteer-core) 합친다. 열화상 장면의 밝기는 열관류율 U 에 비례한다(가짜 열화상 아님을 화면에 적는다).

```bash
F=$W/film
python3 scripts/lab/plan_vectors.py $DXF $F/plan.json                      # 1층 평면 선 (글자 제외)
for s in section rise wrap thermal glow; do                                # 약 1,200프레임, 1.5시간
  "$BLENDER" -b --factory-startup --python scripts/lab/blender_film.py -- "$GLB" $F/r/$s $s
done
python3 scripts/lab/expo_film.py $F <QR.svg> <PretendardVariable.woff2>   # film.html
NODE_PATH=<puppeteer-core node_modules> node scripts/lab/expo_capture.cjs $F/film.html $F/cap
ffmpeg -framerate 30 -i $F/cap/f_%05d.jpg -vf "noise=alls=3:allf=t" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p $F/film.mp4
```

## Lab v2 — 도면으로 지은 3D 트윈 (/lab/ai-building-workspace-v2)

v1 결과를 한 장면으로 묶었다. 새로 만드는 데이터는 평면 선 하나뿐이고, 모델 · 실 · 에너지 수치는 v1 것을 그대로 읽는다.

```bash
# 1·2층 평면의 벽 · 창호 · 치수 · 기타 선 → 모델 좌표(m) 선분 (글자 · 해치 · 바닥 줄눈 제외, gzip 약 24 KB)
$PY scripts/lab/twin_data.py $DXF public/lab/ai-building-workspace-v2/twin.json
```

| 장면에서 쓰는 것 | 어디서 |
|---|---|
| 평면 선 (도면 → 3D) | `public/lab/ai-building-workspace-v2/twin.json` (twin_data.py) |
| 3D 모델 · 실 경계 · 면적 · 물량 | v1 `public/lab/ai-building-workspace/viewer/` (viewer.json · model.glb) |
| 외피 면적 · 열관류율 · 냉난방 · 태양광 | `src/data/lab/ai-building-workspace-energy.json` |
| 외단열 판 · 새 창 · 태양광 모듈 · 열화상 막 | 브라우저에서 glb 노드 이름으로 만든다 (`src/components/lab/twin/twinBuild.ts`) |

- 외벽은 이름이 `VIS_F<층>_<방위…>` 이고 실내 벽(Internal · Stair · Toilet …)이 아닌 18면, 바깥 창은 유리가 있는 개구부 묶음 중
  실내 칸막이(LobbyInner)를 뺀 23개다. EnergyPlus 의 외벽 · 창호 범위와 같다. 모델을 다시 만들어 이름이 바뀌면 `twinModel.ts` 의 정규식을 맞춘다.
- 외단열 판은 외벽 형상(창 구멍 포함)을 바깥면에서 0.11 m(PF보드 100 mm + 스타코 10 mm) 두께로 눌러 만든다. 바깥 방향은 벽 이름의 방위로 정한다.
- 열화상 색은 열관류율 / 4 W/㎡K 에 비례하는 ironbow 색이다(홈 히어로 그린리모델링과 같은 색). 실측이 아님을 페이지에 밝힌다.
- 해 방향은 위도 37.5°(중부 지방)와 오늘 날짜로 계산한다. 실제 위치는 쓰지 않는다.
- 목록 표지(cover.webp 1600×1000) · 공유 이미지(og.jpg 1200×630)는 이 장면을 브라우저로 캡처해 만들었다(UI 를 숨기고 `[data-twin-stage]` 요소만).

### 리모델링 조합 비교 (v2 그린리모델링 탭의 "조합 바꿔 보기")

외단열 0 · 50 · 100 · 150 mm × 창호 기존 · 로이 복층 · 삼중 로이 12가지와 태양광 2 · 4장을 EnergyPlus 로 미리 계산해
`src/data/lab/ai-building-workspace-scenarios.json` 하나로 둔다. 브라우저는 이 표에서 꺼내 쓰기만 한다(약 11초, 4개 동시 실행).

```bash
"$BLENDER" -b --factory-startup --python scripts/lab/blender_envelope.py -- "$GLB" $W/env.json
python3 scripts/lab/energy_scenarios.py $W/env.json $EPW $W/sc src/data/lab/ai-building-workspace-scenarios.json \
    public/lab/ai-building-workspace-v2/hourly.json
```

- `energy_idf.py` 는 `before` · `after` 말고도 `wall=<mm>,win=<old|lowe|triple>` 를 받는다. `w0-old` = before, `w100-lowe` = after 와 같은 값이 나와야 한다(확인함: 16,110 → 9,671 kWh).
- 기상 파일은 climate.onebuilding.org 의 `WMO_Region_2_Asia/KOR_South_Korea/KW_Gangwon-do/KOR_KW_Sokcho.470900_TMYx.2004-2018.zip` (경로가 예전과 바뀌었다).
- EnergyPlus 의 ExpandObjects 가 실행 폴더에 임시 파일을 써서, 동시 실행은 실행마다 자기 출력 폴더에서 돌린다.
- 삼중 로이 창(U 1.0, SHGC 0.40)과 50 · 150 mm 두께는 도면 사양이 아니라 비교용 가정이다. 페이지 문구에도 밝힌다.
- 외단열만 하고 기존 창을 두면 냉방이 늘어난다(일사 열이 덜 빠짐). 계산 결과 그대로이며 페이지에서 안내한다.
- `hourly.json`: 같은 실행에서 겨울 · 여름 대표일의 시간별 값(벽 · 지붕 Surface Inside Face Conduction per Area, 창 Surface Window
  Net Heat Transfer Rate ÷ 창 면적, 부호를 뒤집어 + = 실내에서 나가는 열)을 뽑는다. 창 값에는 투과 일사가, 벽 · 지붕 값에는
  구조체에 쌓이는 열이 들어 있다. 페이지 문구에도 밝힌다.

### 도면만 넣으면 — 다른 건물 자동 생성 (건물 B · C)

설정 파일 하나(층 범위 · 레이어 · 높이)와 DXF 로 3D 모델 · 실 · 평면 선 · 에너지 입력을 한 번에 만든다. 사람이 고치는 단계가 없다.

```bash
PY=/tmp/lab-venv/bin/python   # ezdxf · shapely · trimesh · mapbox-earcut (+ QA 그림은 matplotlib)
W=/tmp/lab-work/b2
QA_PNG=$W/qa.png $PY scripts/lab/auto_twin.py scripts/lab/buildings/building-b.json "$DXF_B" $W/out
NO_PV=1 python3 scripts/lab/energy_scenarios.py $W/out/env.json $EPW $W/sc $W/out/scenarios.json $W/out/hourly.json
# 사이트로 복사
cp $W/out/{model.glb,viewer.json,twin.json,hourly.json} public/lab/ai-building-workspace-v2/b/
cp $W/out/scenarios.json src/data/lab/ai-building-workspace-b-scenarios.json
cp $W/out/meta.json src/data/lab/ai-building-workspace-b-meta.json
```

- 설정(`scripts/lab/buildings/*.json`): `unit`(DXF 단위 → m), `floors[]`(층 키 · 존 이름 · 도면 범위 box · 바닥 높이 · 용도),
  `layers`(벽 · 개구부 · 치수 · 그릴 선), `heights`(천장 · 층고 · 파라펫 · 창 밑 · 창 위 · 문, 단면도 치수에서 읽는다).
- 외곽: 호(문 열림)를 뺀 벽 · 개구부 선을 굵게 합쳐 바깥 테두리를 얻고, 열림 호의 중심 → 양 끝 선으로 문 틈을 막는다.
  실: 테두리 안의 구멍(1.5 ㎡ 이상) = 실, 외곽 − 실 = 벽. 개구부 선 묶음 중 호가 있으면 문, 없으면 창.
- 외벽은 같은 직선 위 모서리를 합쳐 방위 + 글자(SouthA …)로 이름 짓는다. 이름 규칙이 v1 모델과 같아(`VIS_F1_<방위…>`)
  `twinBuild.ts` 가 그대로 외단열 판 · 새 창 · 열화상 막을 만든다. 지붕은 평지붕 한 장(`VIS_Roof_Flat_0`).
- 실 이름은 실 안의 한글 글자(치수 · 면적 표기 제외). 글자가 없으면 페이지에서 "실 n".
- `energy_idf.py` 는 env.json 에 `zones` · `window` 가 있으면 그것을 쓴다(층마다 바닥 · 층간 · 지붕, 용도별 재실 · 조명 · 설정 온도 —
  어린이집은 평일 7–19시, 난방 20/15 ℃ · 냉방 26/30 ℃). 없으면 건물 A 의 두 층 값 그대로라 A 결과는 바이트 단위로 같다(확인함).
- 화면에 넣을 때: `src/components/lab/twin/buildings.ts` 에 건물을 추가하고(데이터 경로 · frame · stats · runs · pv · drawn · start),
  `lab.json` 의 `twin.ui.buildings` 에 이름 · 설명 · 지붕 · 자동 생성 안내를 넣는다.
- 여러 층 건물(C, 지상 3층): 층마다 `floors[]` 에 box · z 를 주고, 층마다 다른 높이는 그 층의 `heights` 로 덮어쓴다.
  - 층 맞추기: `layers.grid`(기준선 레이어)의 긴 가로 · 세로선이 1층과 가장 많이 겹치는 이동량을 찾는다. box 는 대강 잡아도 된다
    (C 는 일부러 0.2~0.3 m 어긋나게 잡았고 `register 2f: dx -0.300 m · dy -0.300 m (기준선 x 3 · y 5개 일치)` 로 바로잡힌다).
  - `closeGaps`(m): 열림 호 없이 그린 실내 문. 30 cm 미만 틈은 먼저 메우고, 같은 줄 벽 끝 사이 closeGaps 미만 틈(가로 · 세로로 따로
    넓혔다 줄여 찾는다)을 메우고 문으로 본다. C 는 1.2~1.5 m 미닫이 자리가 있어 1.6.
  - `clipToGround`: 위층 평면에 함께 그린 외부 계단을 1층 외곽(+0.3 m)으로 잘라 내고, 잘린 변에 0.2 m 외벽을 세운다.
  - 위층이 덮지 않는 아래층 부분은 그 층 지붕(`VIS_F1_RoofSlab_0`, kind slab)이 되고 EnergyPlus 에서도 그 층의 지붕으로 계산한다.
  - 도면 사양 두께가 표에 없으면 `WALLS=0,50,80,100,150` 으로 조합을 더한다(C).
  ```bash
  $PY scripts/lab/auto_twin.py scripts/lab/buildings/building-c.json "$DXF_C" /tmp/lab-work/c/out
  WALLS=0,50,80,100,150 NO_PV=1 python3 scripts/lab/energy_scenarios.py /tmp/lab-work/c/out/env.json $EPW /tmp/lab-work/c/sc \
      /tmp/lab-work/c/out/scenarios.json /tmp/lab-work/c/out/hourly.json
  # → public/lab/ai-building-workspace-v2/c/ (model.glb · viewer.json · twin.json · hourly.json), src/data/lab/ai-building-workspace-c-{scenarios,meta}.json
  ```
- 큰 도면(6만 개체)은 엔티티 범위를 한 번만 계산해 둔다. 휜 선(문 열림 호)은 작은 각도로 잇달아 꺾이는 선이고, 문 경첩은 반지름 0.4~2.2 m 인 호만 쓴다
  (위생기구 곡선을 문으로 보면 경첩이 아주 멀리 잡혀 계산이 멈춘다). 기둥(닫힌 사각형)은 벽으로 들어간다.
- 알려진 한계: 경사 지붕 · 단 차이 지붕은 평지붕으로, 옥상 계단실(탑)은 넣지 않는다. 대각선 벽 사이 틈은 문으로 찾지 못한다.
  B 의 보육실-1(72 ㎡) · C 의 강당 등은 "검토 필요"(실 안에 이름이 둘 이상)로 나온다 — 도면과 대조해 확인할 것.
