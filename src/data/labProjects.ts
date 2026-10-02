/**
 * Ninewatt Lab — 사내에서 만들고 있거나 시도 중인 프로젝트.
 *
 * /solutions/rnd(공식 과제 실적)와 달리 "아직 제품이 아닌 것"을 다룬다.
 * 문안(이름·요약·도판 설명 등)은 src/messages/{locale}/lab.json 의
 * projects.<slug> 에 있고, 여기는 언어와 무관한 값만 둔다.
 *
 * 새 프로젝트를 추가하면 /lab 목록, /lab/<slug> 상세, sitemap 이 자동으로 따라온다.
 * 헤더·푸터는 Company 아래 /lab 목록으로만 연결하므로 손댈 필요 없다.
 * llms.txt 라벨(src/app/llms.txt/route.ts)만 손으로 추가한다.
 */

import takeoffData from "./lab/ai-building-workspace-takeoff.json";

export type LabStatus = "concept" | "experimenting" | "graduated" | "paused";

export interface LabImage {
  src: string;
  width: number;
  height: number;
}

export interface LabCaseStudy {
  /** 입력 도면 규모. 라벨은 messages 의 case.stats.<key> */
  stats: { key: string; value: string }[];
  /** 순서대로 보여줄 도판. 제목·설명은 messages 의 case.figures.<key> */
  figures: (LabImage & { key: string })[];
  /** 직접 돌려 보는 3D 뷰어. viewer.json 은 scripts/lab/viewer_data.py 가 만든다.
   *  poster 는 이 도판(figures 의 key)을 대신해 처음에 보여 줄 이미지 */
  viewer?: { data: string; replaces: string };
  /** 도면 주석의 마감재를 입힌 사실적 렌더링. 마감재 표의 행 키는 messages 의 case.materials.rows */
  materials?: { images: (LabImage & { key: string })[]; rows: string[] };
  /** 같은 축척·원점으로 맞춘 도면 ↔ 모델 비교 이미지 */
  comparison?: { drawing: LabImage; model: LabImage; overlay: LabImage };
  /** 도면 기반 물량 산출 (scripts/lab/quantity_takeoff.py 의 takeoff.json) */
  takeoff?: {
    data: Takeoff;
    /** 층별 물량 마킹 도면 */
    figures: (LabImage & { key: string })[];
    /** 내려받는 내역서 PDF */
    report: string;
    /** 도면 주석에 적힌 공사면적과, 같은 범위 실들의 산출 합계 비교 */
    noted: { value: number; rooms: string[] };
  };
}

/** 물량 산출 결과. 길이 m, 면적 ㎡, 금액 원. review = 칸막이 선이 없어 여러 실이 묶인 영역 */
export interface Takeoff {
  ceilingHeight: number;
  rooms: {
    key: string;
    floor: string;
    review: boolean;
    outdoor: boolean;
    L: number;
    A: number;
    WA: number | null;
    openingArea: number | null;
    openings: number;
    railing: number | null;
    finish: { floor: string | null; wall: string | null; ceiling: string | null };
  }[];
  /** 예시 단가 적용. price·amount 는 실제 견적이 아니다 */
  materials: { key: string; unit: string; qty: number; price: number; amount: number }[];
  total: number;
}

export interface LabProject {
  slug: string;
  status: LabStatus;
  cover: string;
  /** 1200×630 공유 미리보기 이미지 */
  og?: string;
  video?: {
    src: string;
    poster: string;
    /** 초 단위. JSON-LD duration 에 쓴다 */
    duration: number;
    /** YYYY-MM-DD. JSON-LD uploadDate 에 쓴다 */
    uploadDate: string;
    /** 챕터 시작 시점(초). 라벨은 messages 의 chapters[i] */
    chapters: number[];
  };
  caseStudy?: LabCaseStudy;
  /** 제품으로 졸업한 경우 해당 제품 페이지 경로 */
  graduatedTo?: string;
}

const S3 = "https://ninewatt-homepage.s3.ap-northeast-2.amazonaws.com";
const ABW = "/lab/ai-building-workspace";

export const labProjects: LabProject[] = [
  {
    slug: "ai-building-workspace",
    status: "experimenting",
    cover: `${ABW}/case-cover.webp`,
    og: `${ABW}/case-og.jpg`,
    video: {
      // 실제 도면에서 뽑은 도판 + 3D 모델 외관·층별 단면 + 마감재 적용 렌더링. 기관·설계사 정보는 들어 있지 않다.
      src: `${S3}/videos/lab/ai-building-workspace-case-v4.mp4`,
      poster: `${ABW}/case-cover.webp`,
      duration: 47,
      uploadDate: "2026-10-02",
      chapters: [0, 4, 8, 12, 16, 24, 29, 34, 38, 42],
    },
    caseStudy: {
      // 입력 DXF(그린리모델링 설계 도면 1세트)의 실제 규모
      stats: [
        { key: "lines", value: "14,682" },
        { key: "dimensions", value: "396" },
        { key: "layers", value: "38" },
        { key: "rooms", value: "12" },
      ],
      figures: [
        { key: "plan", src: `${ABW}/plan.webp`, width: 1400, height: 1619 },
        { key: "rooms", src: `${ABW}/rooms.webp`, width: 1400, height: 1619 },
        { key: "model", src: `${ABW}/model-axo.webp`, width: 1800, height: 1233 },
        { key: "interior1", src: `${ABW}/interior-1f-r2.webp`, width: 1800, height: 1125 },
        { key: "interior2", src: `${ABW}/interior-2f-r2.webp`, width: 1800, height: 1125 },
      ],
      viewer: { data: `${ABW}/viewer/viewer.json`, replaces: "model" },
      materials: {
        images: [
          { key: "exterior", src: `${ABW}/photo-exterior-r2.webp`, width: 1800, height: 1125 },
          { key: "cutaway", src: `${ABW}/photo-1f-r2.webp`, width: 1800, height: 1125 },
          { key: "interior", src: `${ABW}/photo-waiting-room-r2.webp`, width: 1800, height: 1125 },
        ],
        // 1층 평면도·정면도·단면상세도·지붕평면도 주석의 마감 표기
        rows: ["wall", "roof", "window", "floor1", "wall1", "floor2", "wall2"],
      },
      comparison: {
        drawing: { src: `${ABW}/elevation-drawing.webp`, width: 1461, height: 960 },
        model: { src: `${ABW}/elevation-model.webp`, width: 1461, height: 960 },
        overlay: { src: `${ABW}/elevation-overlay.webp`, width: 1461, height: 960 },
      },
      takeoff: {
        data: takeoffData as Takeoff,
        figures: [
          { key: "1f", src: `${ABW}/takeoff-1f.webp`, width: 1400, height: 1803 },
          { key: "2f", src: `${ABW}/takeoff-2f.webp`, width: 1400, height: 1689 },
        ],
        report: `${ABW}/takeoff-report.pdf`,
        // 1층 평면도 주석: "진료실,대기실,다목적실,현관 천정,바닥 공사 … 공사면적 60.00㎡"
        noted: { value: 60.0, rooms: ["clinic", "waiting", "multipurpose", "entrance"] },
      },
    },
  },
];

export function getLabProject(slug: string): LabProject | undefined {
  return labProjects.find((p) => p.slug === slug);
}

/** 초 → "0:06" */
export function formatClock(seconds: number): string {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
