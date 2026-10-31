# Ninewatt Lab 작업 맥락 (인수인계)

`/lab`, `/lab/ai-building-workspace` 작업을 다른 PC나 새 Claude 세션에서 이어갈 때 먼저 읽는 문서.
도판·영상·물량을 다시 만드는 명령은 [scripts/lab/README.md](../scripts/lab/README.md) 에 있다.

마지막 정리: 2026-10-31 (Lab v2 추가)

## 지금 상태

- 운영 중: https://ninewatt.com/ko/lab/ai-building-workspace (ko · en · ja · fr)
- 메뉴: Header 의 Company 메가메뉴와 Footer 의 Company 열에 Lab 이 있다. 목록 페이지 제목은 "연구 중인 프로젝트".
- 프로젝트는 1개(AI Building Workspace, status `experimenting`). 프로젝트가 1개면 목록이 Spotlight, 2개 이상이면 카드 그리드로 바뀐다.
- 상세 페이지 구성: 통계 → 도판 → 3D 뷰어 → 마감재 렌더 → 도면/모델 비교 슬라이더 → 물량 산출(표 · PDF 다운로드 · 도면 기재 공사면적 비교) → 영상.
  "맞은 것과 아직 아닌 것"(findings) 섹션은 사용자 요청으로 뺐다. 다시 넣지 않는다.

### 전시 랜딩 `/expo` (2026-10-20 추가)

- 2026 대한민국 ESG 친환경 대전(10/21~23) 부스 QR용. ko · en · ja (fr 은 영어 폴백, 색인 제외).
- Lab v1 결과 + 그린리모델링 예시 견적 + EnergyPlus 간이 시뮬레이션(전후 냉난방 −40%).
  데이터 `src/data/lab/ai-building-workspace-energy.json`, 문구 `src/messages/{ko,en,ja}/expo.json`, 만드는 법은 scripts/lab/README.md 끝.
- 부스 영상 v4(89초, 창호 · 태양광 장면 포함)와 클레이 렌더(외벽 단면 · 외단열 · 열 손실 전후)는 `public/lab/ai-building-workspace/expo/` 에 있다.
  이 노트북에 aws CLI 가 없어 영상(4MB)을 S3 대신 public 에 두었다. S3 로 옮기면 page.tsx 의 FILM.src 만 바꾼다.
- 2026-10-20: Lab 상세에도 같은 섹션(`src/components/lab/Retrofit.tsx`, 문구는 expo 네임스페이스 · fr 포함)을 넣었고,
  Lab 영상은 v4 Lab 편집본 `public/lab/ai-building-workspace/lab-film-v5.mp4`(88초, 전시회 이름 · QR 없음)로 바꿨다.
  S3 의 예전 `ai-building-workspace-case-v4.mp4` 는 더 쓰지 않는다 — aws CLI 가 있는 PC 에서 지운다.
- /expo 는 전시가 끝나면 내리거나 Lab 상세로 연결(리다이렉트)할지 정한다.

### Lab v2 — 도면으로 지은 3D 트윈 (2026-10-31 추가)

- `/lab/ai-building-workspace-v2` (ko · en · ja · fr). 목록이 카드 2장 그리드로 바뀌었다.
- v1 의 도면 · 3D 모델 · 실 면적 · EnergyPlus 결과를 한 장면에 겹친다. 보기 셋: 도면 → 3D(도면 선이 그려지고 벽이 바닥부터 솟는다) ·
  실 · 면적(지붕 · 위층을 걷고 실을 눌러 물량) · 그린리모델링(열화상 → 외단열 18면 → 창 23개 → 태양광 4장, 끝나면 −40% · 월별 그래프 · 전후/열화상 토글).
- 코드 `src/components/lab/twin/` (LabTwin · TwinScene · TwinPanel · twinBuild · twinModel). 하늘 · 빛 번짐은 홈 히어로 것을 같이 쓴다.
- 새 데이터는 평면 선(`public/lab/ai-building-workspace-v2/twin.json`, `scripts/lab/twin_data.py`) 하나. 나머지는 v1 파일을 읽는다 — v1 데이터를 바꾸면 v2 도 바뀐다.
- 문구 `lab.json` 의 `projects.ai-building-workspace-v2` (실 이름은 v1 의 `case.rooms` 를 그대로 쓴다). 만드는 법은 scripts/lab/README.md 끝.
- 그린리모델링 탭의 "조합 바꿔 보기": 외단열 두께 · 창호 · 태양광을 고르면 3D(외단열 두께 · 창 교체 · 모듈 수 · 열화상 색)와 수치가 바뀐다.
  수치는 `src/data/lab/ai-building-workspace-scenarios.json`(EnergyPlus 12조합, `scripts/lab/energy_scenarios.py`). 공사비 · 회수 기간은
  다른 사양의 단가를 지어내야 해서 넣지 않았다.
- 장면 오른쪽 위 도구: 단면(구축용 자르는 면을 높이 막대로) · 치수(두 점 거리, 잘린 부분 · 숨긴 부품은 건너뜀) ·
  전후 비교(카메라를 지나는 세로 자르는 면 두 장으로 화면을 나눔 — 헌 창은 왼쪽, 외단열 · 새 창 · 태양광은 오른쪽 재질에만 걸림) · 링크 복사.
  보기 · 층 · 조합은 주소(`?view=remodel&wall=150&win=old&pv=2`)에 담겨 공유하면 그 상태(다 고친 모습)로 열린다.

## 파일 지도

| 무엇 | 어디 |
|---|---|
| 목록 / 상세 페이지 | `src/app/[locale]/(main)/lab/page.tsx`, `lab/[slug]/page.tsx` |
| 컴포넌트 | `src/components/lab/` (LabFilm, LabCompare, LabStatusBadge, LabCta, LabModelViewer, LabModelCanvas) |
| 언어와 무관한 값 (영상 · 챕터 · 면적 · 도판 크기) | `src/data/labProjects.ts` |
| 물량 표 데이터 | `src/data/lab/ai-building-workspace-takeoff.json` (`quantity_takeoff.py` 결과) |
| 문구 | `src/messages/{ko,en,ja,fr}/lab.json` (+ `common.json` 의 companyMenu.lab, labDesc) |
| 도판 · 뷰어 데이터 · 내역서 PDF | `public/lab/ai-building-workspace/` |
| 영상 | `public/lab/ai-building-workspace/lab-film-v5.mp4` (88초). S3 의 case-v4 는 지울 대상 |
| 생성 스크립트 | `scripts/lab/` |
| 그 밖에 Lab 을 등록한 곳 | `seo.ts` ROUTES, `llms.txt/route.ts`, `i18n/request.ts` 의 lab 네임스페이스 |

## git 에 없는 것 (따로 옮긴다)

- `public/temp/` 의 원본 DXF · `.blend` · `.glb` 세 파일 (약 15MB). **커밋 금지** — 파일 이름과 도면 안에 실제 기관·설계사 정보가 있다.
- `.env.local`
- 중간 결과물 폴더(`/tmp/lab-work`)는 남아 있지 않다. 원본만 있으면 README 순서대로 다시 만든다.
- 렌더링을 하려면 Blender 4.0, ffmpeg, Python venv(`scripts/lab/requirements.txt`), Chrome, S3 에 쓸 수 있는 aws CLI 자격 증명이 필요하다. 페이지 코드만 고친다면 필요 없다.

## 지켜 온 결정

- **익명화**: 실제 기관명은 페이지 · 문서 · 커밋 어디에도 쓰지 않는다. 꼭 필요하면 "○○보건진료소", 문서에는 "소규모 공공 보건시설". 설계사무소 · 건축사 성명 · 연락처는 어떤 출력에도 나오면 안 된다. 새 도판은 게시 전에 눈으로 확인한다.
- **실제 결과만**: 꾸민 목업을 쓰지 않는다. 실 경계 · 면적은 "도면 레이어로 자동 계산"으로만 표기하고, 제품의 AI 인식 결과처럼 쓰지 않는다.
- **외부 공개용**: 렌더링 품질은 바깥에 보여 줄 수준으로 맞춘다(마감재 렌더는 "방법 A": 도면 마감 표기대로 재질, 가구 없음).
- **물량 산출**: 단가는 예시(자재+시공 일반 시세 가정)이고 견적이 아님을 표와 PDF에 밝힌다. 베란다 · 발코니 포함, 창 · 문 개구부는 벽 면적에서 차감. 바닥 면적 A 는 rooms json 의 `area_m2`(단순화 전 경계)를 써서 도판 · 뷰어 · 표가 같은 숫자를 쓴다. 현재 합계 18,762,200원(예시).
- **3D 뷰어**: three / @react-three/fiber / drei 는 "3D로 직접 보기"를 눌러야 불러온다(초기 번들에 넣지 않음). WebGL 이 없으면 CanvasBoundary 가 안내 문구로 대신한다.
- **캐시**: 이미지 내용을 바꾸면 파일 이름도 바꾼다(지금 `-r2`). 영상도 새 버전은 새 이름(`-v5` …)으로 올리고, 배포 확인 뒤 예전 영상은 S3 에서 지운다.
- **스타일**: Lab 페이지에 font-mono 를 쓰지 않는다.

## 배포 흐름

1. `dev` 에 커밋 · 푸시 (dev 푸시는 배포를 실행하지 않는다)
2. `git checkout main && git merge --no-ff dev -m "Merge dev: <요약>" && git push origin main` → GitHub Actions "Deploy to AWS EC2"
3. `dev` 를 main 에 fast-forward 해서 맞춘다
4. `gh run watch` 로 끝까지 보고, 4개 언어 페이지가 200 인지 확인한다

### 주의: EC2 디스크

배포 스크립트가 예전 이미지를 지우지 않아 2026-10-02 배포 때 디스크(20GB)가 가득 차서 약 5분간 502 가 났다.
서버에서 오래된 `ninewatt-homepage` 이미지를 지워 복구했다(ECR 에는 모두 남아 있다).
`deploy.yml` 의 `docker run` 뒤에 `docker image prune -af --filter "until=72h" || true` 정리 단계를 넣었다2026-10-20 배포에서 실제로 예전 이미지가 지워지는 것을 확인했다.
서버 접속은 EC2 Instance Connect(인스턴스 `i-00b6f8f4edafdb3b3`, AL2023, `ec2-user`)로 된다.

## 남은 일 / 아이디어

- 프로젝트가 늘면 `labProjects.ts` 에 추가하고 `lab.json` 의 `projects.<slug>` 에 문구를 넣는다. 목록 · 상세 · sitemap 은 자동으로 따라온다.
