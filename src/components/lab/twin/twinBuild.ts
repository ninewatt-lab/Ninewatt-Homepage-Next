/**
 * Lab v2 — glb 를 받아 트윈 장면용으로 꾸린다 (React 없음).
 *
 * - 모든 재질에 구축용 자르는 면(clipping plane)을 건다: 면이 올라가는 만큼 벽이 아래부터 솟는다.
 * - 외벽 18면마다 외단열 판(shellGeometry), 바깥 창 23개마다 새 창(같은 형상 · 새 재질)을 만든다.
 * - 남쪽 지붕면에 태양광 모듈 4장 (EnergyPlus PVWatts 계산과 같은 수 · 크기).
 * - 열화상: 겉면마다 같은 형상의 막을 자식으로 붙여 열관류율 색으로 덮는다. 아래부터 훑는 선(scan) 아래만 보인다.
 * - 전후 비교: 시공 전 부품(헌 창)은 split.left, 시공 후 부품(외단열 · 새 창 · 태양광)은 split.right 쪽에서만 보인다.
 *   두 면은 카메라를 지나는 세로면이라 화면을 좌우로 나눈다(TwinScene 이 매 프레임 맞춘다). 비교를 끄면 멀리 치운다.
 */

import * as THREE from "three";
import energy from "@/data/lab/ai-building-workspace-energy.json";
import { pvTexture } from "@/components/hero/textures";
import { isExteriorWall, outward, readParts, roofPlane, shellGeometry, thermalColor, windowGroups, type Part } from "./twinModel";

/** 외단열 판 두께(m) — PF보드 두께(mm) + 스타코 10 mm. 시나리오 비교에서 고른 두께로 바꿔 끼운다 */
export const SHELL: Record<number, number> = { 50: 0.06, 100: 0.11, 150: 0.16 };
/** 430 W 모듈 (1.72 × 1.13 m), 남쪽 지붕면에 한 줄 */
const MODULE = { w: 1.13, l: 1.72, gap: 0.04 };

export type Floor = "1f" | "2f" | "roof";
type Item = { obj: THREE.Object3D; floor: Floor; ceiling?: boolean };

export type TwinModel = {
  root: THREE.Group;
  plane: THREE.Plane;
  split: { left: THREE.Plane; right: THREE.Plane };
  scan: { value: number };
  walls: { shell: THREE.Mesh; geos: Record<number, THREE.BufferGeometry>; out: THREE.Vector3; floor: Floor }[];
  windows: { old: THREE.Group; fresh: THREE.Group; at: THREE.Vector3; out: THREE.Vector3; floor: Floor }[];
  pv: { group: THREE.Group; modules: THREE.Mesh[]; base: THREE.Vector3[]; normal: THREE.Vector3 } | null;
  overlays: THREE.Mesh[];
  glass: THREE.MeshStandardMaterial[];
  lamps: THREE.MeshBasicMaterial;
  /** 시나리오에 따라 색을 바꾸는 열화상 막 (외단열 판 · 새 창) 과 새 창 유리 */
  heat: { shell: THREE.MeshBasicMaterial; fresh: THREE.MeshBasicMaterial };
  freshGlass: THREE.MeshStandardMaterial;
  items: Item[];
};

const U = energy.assumptions;

// 같은 열관류율은 막 재질 하나를 같이 쓴다 (cache 가 없으면 따로 — 색을 바꿀 막)
function thermalMaterial(cache: Map<number, THREE.MeshBasicMaterial> | null, u: number, planes: THREE.Plane[], scan: { value: number }) {
  let m = cache?.get(u);
  if (m) return m;
  m = new THREE.MeshBasicMaterial({
    color: thermalColor(u),
    toneMapped: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
    clippingPlanes: planes,
  });
  m.onBeforeCompile = (s) => {
    s.uniforms.uScan = scan;
    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vWY;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.0)).y;");
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uScan;\nvarying float vWY;")
      .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nif (vWY > uScan) discard;");
  };
  m.customProgramCacheKey = () => "twin-thermal";
  cache?.set(u, m);
  return m;
}

function addOverlay(obj: THREE.Object3D, mat: THREE.Material, list: THREE.Mesh[]) {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || mesh.userData.overlay) return;
    const overlay = new THREE.Mesh(mesh.geometry, mat);
    overlay.userData.overlay = true;
    overlay.visible = false;
    overlay.renderOrder = 2;
    mesh.add(overlay);
    list.push(overlay);
  });
}

/** 부품들을 한 묶음으로 — 묶음의 기준점은 가운데 (그 자리에서 빠지고 들어온다) */
function regroup(root: THREE.Group, parts: Part[]) {
  const box = new THREE.Box3();
  for (const p of parts) box.expandByObject(p.mesh);
  const group = new THREE.Group();
  box.getCenter(group.position);
  root.add(group);
  group.updateMatrixWorld();
  for (const p of parts) {
    // 바닥판처럼 태그가 그룹에 붙은 경우 그룹째 옮긴다
    const obj = p.mesh.userData?.kind || p.mesh.parent === root ? p.mesh : p.mesh.parent!;
    group.attach(obj);
  }
  return group;
}

export function buildTwin(scene: THREE.Group): TwinModel {
  const root = scene.clone(true);
  root.updateMatrixWorld(true);
  const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
  const split = { left: new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1e6), right: new THREE.Plane(new THREE.Vector3(1, 0, 0), 1e6) };
  const before = [plane, split.left];
  const after = [plane, split.right];
  const scan = { value: -1 };
  const cache = new Map<number, THREE.MeshBasicMaterial>();
  const overlays: THREE.Mesh[] = [];
  const items: Item[] = [];
  const parts = readParts(root);

  // 모든 원래 재질에 자르는 면 · 그림자. 재질은 useGLTF 캐시와 같이 쓰므로 이 모델용으로 복제한다
  const glass = new Set<THREE.MeshStandardMaterial>();
  const own = new Map<THREE.Material, THREE.MeshStandardMaterial>();
  for (const p of parts) {
    const src = p.mesh.material as THREE.MeshStandardMaterial;
    let mat = own.get(src);
    if (!mat) {
      mat = src.clone();
      own.set(src, mat);
    }
    p.mesh.material = mat;
    mat.clippingPlanes = [plane];
    if (p.kind === "glass") {
      mat.transparent = true;
      mat.depthWrite = false;
      glass.add(mat);
    } else {
      p.mesh.castShadow = true;
    }
    p.mesh.receiveShadow = true;
  }

  // 실내 조명: 밤에 켜진다 (지붕을 걷은 실 보기에서 보인다)
  const lamps = new THREE.MeshBasicMaterial({ color: "#ffd9a8", toneMapped: false, clippingPlanes: [plane] });
  for (const p of parts) if (/Luminaire/.test(p.name)) p.mesh.material = lamps;

  // 외벽 + 외단열 판
  const shellMat = new THREE.MeshStandardMaterial({ color: "#ddd6c9", roughness: 0.92, clippingPlanes: after });
  const wallHeat = thermalMaterial(cache, U.before.wallU, [plane], scan);
  const shellHeat = thermalMaterial(null, U.after.wallU, after, scan);
  const walls: TwinModel["walls"] = parts
    .filter(isExteriorWall)
    .sort((a, b) => (a.floor === b.floor ? orderKey(a) - orderKey(b) : a.floor < b.floor ? -1 : 1))
    .map((p) => {
      const out = outward(p.name);
      const geos = Object.fromEntries(Object.entries(SHELL).map(([mm, t]) => [mm, shellGeometry(p.mesh.geometry, out, t)]));
      const shell = new THREE.Mesh(geos[100], shellMat);
      shell.castShadow = true;
      shell.receiveShadow = true;
      shell.visible = false;
      shell.userData.special = true;
      root.add(shell);
      addOverlay(p.mesh, wallHeat, overlays);
      addOverlay(shell, shellHeat, overlays);
      items.push({ obj: shell, floor: p.floor });
      return { shell, geos, out, floor: p.floor };
    });

  // 바깥 창 → 묶음으로 옮기고, 같은 형상의 새 창을 만든다
  const frame = new THREE.MeshStandardMaterial({ color: "#f1f3f2", roughness: 0.45, metalness: 0.1, clippingPlanes: after });
  const lowE = new THREE.MeshStandardMaterial({ color: "#86c3d1", roughness: 0.06, metalness: 0.7, transparent: true, opacity: 0.4, depthWrite: false, clippingPlanes: after });
  glass.add(lowE);
  const oldHeat = thermalMaterial(null, U.before.windowU, before, scan);
  const newHeat = thermalMaterial(null, U.after.windowU, after, scan);
  // 창 부품 재질은 문 등과 같이 쓰므로, 전후 비교용으로 헌 창 · 새 창 쪽을 따로 복제한다
  const sided = (planes: THREE.Plane[]) => {
    const made = new Map<THREE.Material, THREE.Material>();
    return (src: THREE.Material) => {
      let m = made.get(src);
      if (!m) {
        m = src.clone();
        m.clippingPlanes = planes;
        if (glass.has(src as THREE.MeshStandardMaterial)) glass.add(m as THREE.MeshStandardMaterial);
        made.set(src, m);
      }
      return m;
    };
  };
  const oldSide = sided(before);
  const newSide = sided(after);
  const windows: TwinModel["windows"] = windowGroups(parts)
    .sort((a, b) => (a.parts[0].floor === b.parts[0].floor ? orderKey(a.parts[0], a.wall) - orderKey(b.parts[0], b.wall) : a.parts[0].floor < b.parts[0].floor ? -1 : 1))
    .map((w) => {
      const floor = w.parts[0].floor;
      const old = regroup(root, w.parts);
      old.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) mesh.material = oldSide(mesh.material as THREE.Material);
      });
      const fresh = old.clone(true);
      fresh.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const kind = w.parts.find((p) => p.mesh.geometry === mesh.geometry)?.kind;
        mesh.material = kind === "frame" ? frame : kind === "glass" ? lowE : newSide(mesh.material as THREE.Material);
      });
      fresh.visible = false;
      old.userData.special = true;
      fresh.userData.special = true;
      root.add(fresh);
      addOverlay(old, oldHeat, overlays);
      addOverlay(fresh, newHeat, overlays);
      items.push({ obj: old, floor }, { obj: fresh, floor });
      return { old, fresh, at: old.position.clone(), out: outward(w.wall), floor };
    });

  // 지붕 · 바닥판 · 발코니: 전후 같은 값
  for (const p of parts) {
    if (p.kind === "roof") addOverlay(p.mesh, thermalMaterial(cache, U.roofU, [plane], scan), overlays);
    else if (p.kind === "slab" || p.kind === "floor1" || p.kind === "floor2") addOverlay(p.mesh, thermalMaterial(cache, U.floorU, [plane], scan), overlays);
  }

  // 층 보기용 목록 (창 부품은 묶음째로 위에서 넣었다)
  const grouped = new Set<THREE.Object3D>(windows.flatMap((w) => [w.old, w.fresh]));
  for (const p of parts) {
    let top: THREE.Object3D = p.mesh;
    while (top.parent && top.parent !== root) top = top.parent;
    if (grouped.has(top)) continue;
    items.push({ obj: top, floor: p.floor, ceiling: /Ceiling/.test(p.name) });
  }

  return { root, plane, split, scan, walls, windows, pv: solar(root, parts, after, items), overlays, glass: [...glass], lamps, heat: { shell: shellHeat, fresh: newHeat }, freshGlass: lowE, items };
}

/** 같은 층 안 순서: 남 → 동 → 북 → 서 (카메라 쪽부터 돌아간다), 같은 면에서는 왼쪽부터 */
function orderKey(p: Part, wall = p.name) {
  const box = new THREE.Box3().setFromObject(p.mesh);
  const c = box.getCenter(new THREE.Vector3());
  const side = /South|Front/.test(wall) ? 0 : /East/.test(wall) ? 1 : /North/.test(wall) ? 2 : 3;
  const along = side === 0 ? c.x : side === 1 ? -c.z : side === 2 ? -c.x : c.z;
  return side * 100 + along;
}

function solar(root: THREE.Group, parts: Part[], planes: THREE.Plane[], items: Item[]): TwinModel["pv"] {
  const roof = parts.find((p) => /Roof_South/.test(p.name));
  if (!roof) return null;
  const at = roofPlane(roof.mesh);
  if (!at) return null;
  const { center, normal } = at;
  const x = new THREE.Vector3(1, 0, 0);
  const z = new THREE.Vector3().crossVectors(x, normal).normalize();
  const basis = new THREE.Matrix4().makeBasis(x, normal, z);
  const q = new THREE.Quaternion().setFromRotationMatrix(basis);
  const map = pvTexture();
  const material = new THREE.MeshStandardMaterial({ map, emissive: "#49B6CA", emissiveMap: map, emissiveIntensity: 0.15, metalness: 0.45, roughness: 0.3, clippingPlanes: planes });
  const geometry = new THREE.BoxGeometry(MODULE.w, 0.04, MODULE.l);
  const group = new THREE.Group();
  const count = energy.pv.modules;
  const base: THREE.Vector3[] = [];
  const modules = Array.from({ length: count }, (_, k) => {
    const m = new THREE.Mesh(geometry, material);
    m.quaternion.copy(q);
    const p = center.clone().addScaledVector(x, (k - (count - 1) / 2) * (MODULE.w + MODULE.gap)).addScaledVector(normal, 0.09);
    m.position.copy(p);
    m.castShadow = true;
    m.visible = false;
    base.push(p);
    group.add(m);
    return m;
  });
  group.userData.special = true;
  root.add(group);
  items.push({ obj: group, floor: "roof" });
  return { group, modules, base, normal };
}
