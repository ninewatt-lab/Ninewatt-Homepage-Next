import Image from "next/image";
import type { getTranslations } from "next-intl/server";
import energyData from "@/data/lab/ai-building-workspace-energy.json";
import ExpoCompare from "@/components/lab/ExpoCompare";

/**
 * 그린리모델링 · 에너지 섹션 묶음. /expo 와 Lab 상세(/lab/ai-building-workspace)가 함께 쓴다.
 * 순서: 도면에 적힌 공사(외벽 · 창호) → 열 손실 전후 · 에너지 시뮬레이션 → 태양광(추가 제안) → 견적.
 * 문구는 "expo" 네임스페이스, 숫자는 ai-building-workspace-energy.json (scripts/lab/energy_idf.py 결과).
 */

type T = Awaited<ReturnType<typeof getTranslations>>;

const EXPO = "/lab/ai-building-workspace/expo";
const num = (v: number) => v.toLocaleString("ko-KR");
const RENDER = { width: 1800, height: 1013 };

function Card({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col overflow-hidden rounded-xl border border-border bg-background">
      {/* 렌더가 어두운 무대라 틀도 어둡게 */}
      <div className="bg-[#0d0f10]">
        <Image src={src} alt={alt} {...RENDER} sizes="(min-width: 768px) 32rem, 100vw" className="h-auto w-full" />
      </div>
      <figcaption className="flex-1 p-5">{children}</figcaption>
    </figure>
  );
}

export default function Retrofit({ t }: { t: T }) {
  const env = energyData.envelope;
  const U = energyData.assumptions;
  const { before, after } = energyData.energy;
  const totalBefore = before.heat + before.cool;
  const totalAfter = after.heat + after.cool;
  const saving = Math.round((1 - totalAfter / totalBefore) * 100);
  const max = Math.max(before.heat, before.cool);
  const bars = [
    { key: "heating", before: before.heat, after: after.heat },
    { key: "cooling", before: before.cool, after: after.cool },
  ];
  const layers = t.raw("remodel.layers") as { name: string; spec: string }[];
  const assumptions = (t.raw("energy.assumptions") as string[]).map((line) =>
    line
      .replace("{wall}", env.wallArea.toFixed(1))
      .replace("{windows}", String(env.windows))
      .replace("{window}", env.windowArea.toFixed(1)),
  );
  const pv = energyData.pv;
  const pvMax = Math.max(...pv.monthlyKWh);
  const estimate = energyData.estimate;

  return (
    <>
      {/* 도면에 적힌 공사 */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold md:text-3xl">{t("remodel.title")}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{t("remodel.intro")}</p>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Card src={`${EXPO}/section.webp`} alt={t("remodel.sectionAlt")}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold">{t("remodel.wallTitle")}</h3>
                <span className="text-sm tabular-nums text-muted">{t("remodel.area", { area: env.wallArea.toFixed(1) })}</span>
              </div>
              <ol className="mt-4 space-y-2 text-sm">
                {layers.map((l, i) => (
                  <li key={l.name} className="flex items-baseline gap-3">
                    <span className="w-5 text-xs font-semibold text-primary">{i + 1}</span>
                    <span className="flex-1">{l.name}</span>
                    <span className="tabular-nums text-muted">{l.spec}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm font-semibold tabular-nums text-primary">
                {t("remodel.wallU", { before: U.before.wallU.toFixed(2), after: U.after.wallU.toFixed(2) })}
              </p>
            </Card>
            <Card src={`${EXPO}/window.webp`} alt={t("remodel.windowAlt")}>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold">{t("remodel.winTitle")}</h3>
                <span className="text-sm tabular-nums text-muted">
                  {t("remodel.windows", { count: env.windows, area: env.windowArea.toFixed(1) })}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted">{t("remodel.winSpec")}</p>
              <p className="mt-2 text-sm text-muted">{t("remodel.winBefore")}</p>
              <p className="mt-4 text-sm font-semibold tabular-nums text-primary">
                {t("remodel.winU", { before: U.before.windowU.toFixed(1), after: U.after.windowU.toFixed(1) })}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 열 손실 전후 · 에너지 시뮬레이션 */}
      <section id="energy" className="scroll-mt-20 border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold md:text-3xl">{t("energy.title")}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{t("energy.intro")}</p>

          <figure className="mt-10">
            <ExpoCompare
              before={{ src: `${EXPO}/thermal-before.webp`, ...RENDER }}
              after={{ src: `${EXPO}/thermal-after.webp`, ...RENDER }}
              labels={{ before: t("energy.compare.before"), after: t("energy.compare.after"), handle: t("energy.compare.handle") }}
            />
            <figcaption className="mt-3 text-sm leading-relaxed text-muted">
              <span className="font-semibold text-foreground">{t("energy.compare.title")}</span>
              <span className="ml-2">{t("energy.compare.caption")}</span>
            </figcaption>
          </figure>

          <div className="mt-12 grid gap-10 md:grid-cols-[16rem_1fr] md:items-center">
            <div>
              <p className="text-sm text-muted">{t("energy.saving")}</p>
              <p className="mt-1 text-6xl font-bold tabular-nums text-primary">−{saving}%</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {t("energy.perArea", {
                  area: env.floorArea.toFixed(1),
                  before: (totalBefore / env.floorArea).toFixed(1),
                  after: (totalAfter / env.floorArea).toFixed(1),
                })}
              </p>
            </div>
            <figure aria-label={t("energy.chartLabel")}>
              <div className="flex flex-wrap gap-5 text-xs text-muted">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-muted/50" aria-hidden="true" />
                  {t("energy.before")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden="true" />
                  {t("energy.after")}
                </span>
              </div>
              <div className="mt-4 space-y-6">
                {bars.map((b) => (
                  <div key={b.key}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold">{t(`energy.${b.key}`)}</span>
                      <span className="tabular-nums text-muted">−{Math.round((1 - b.after / b.before) * 100)}%</span>
                    </div>
                    {(["before", "after"] as const).map((k) => (
                      <div key={k} className="mt-2 flex items-center gap-3">
                        <div className="h-5 flex-1">
                          <div
                            className={`h-full rounded-r ${k === "before" ? "bg-muted/50" : "bg-primary"}`}
                            style={{ width: `${(b[k] / max) * 100}%` }}
                            title={`${t(`energy.${b.key}`)} · ${t(`energy.${k}`)}: ${num(b[k])} ${t("energy.unit")}`}
                          />
                        </div>
                        <span className="w-28 shrink-0 text-right text-xs tabular-nums text-muted">
                          {num(b[k])} {t("energy.unit")}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </figure>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-background p-5">
            <h3 className="text-sm font-semibold">{t("energy.assumptionsTitle")}</h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
              {assumptions.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted">{t("energy.note")}</p>
          </div>
        </div>
      </section>

      {/* 태양광 — 도면에 없는 추가 제안 */}
      <section className="border-t border-border px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <span className="inline-flex rounded-full border border-amber-500/60 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            {t("pv.tag")}
          </span>
          <h2 className="mt-4 text-2xl font-bold md:text-3xl">{t("pv.title")}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{t("pv.intro")}</p>
          <div className="mt-10 grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
            <div className="overflow-hidden rounded-xl border border-border bg-[#0d0f10]">
              <Image src={`${EXPO}/pv.webp`} alt={t("pv.imageAlt")} {...RENDER} sizes="(min-width: 768px) 36rem, 100vw" className="h-auto w-full" />
            </div>
            <div>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
                <div className="bg-background px-5 py-4">
                  <dt className="text-xs text-muted">{t("pv.capacity")}</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums">{pv.kw.toFixed(2)} kW</dd>
                  <dd className="mt-1 text-xs text-muted">{t("pv.modules", { count: pv.modules, w: pv.moduleW })}</dd>
                </div>
                <div className="bg-background px-5 py-4">
                  <dt className="text-xs text-muted">{t("pv.annual")}</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-primary">{num(pv.annualKWh)}</dd>
                  <dd className="mt-1 text-xs text-muted">kWh/{t("pv.year")}</dd>
                </div>
              </dl>
              <figure className="mt-6" aria-label={t("pv.chartLabel")}>
                <div className="flex h-24 items-end gap-1.5">
                  {pv.monthlyKWh.map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/70"
                      style={{ height: `${(v / pvMax) * 100}%` }}
                      title={`${i + 1} · ${num(v)} kWh`}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between text-[11px] text-muted">
                  <span>1</span>
                  <span>6</span>
                  <span>12</span>
                </div>
                <figcaption className="mt-1 text-xs text-muted">{t("pv.chartLabel")}</figcaption>
              </figure>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">{t("pv.note")}</p>
        </div>
      </section>

      {/* 견적 */}
      <section className="border-t border-border bg-surface px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold md:text-3xl">{t("estimate.title")}</h2>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted">{t("estimate.intro")}</p>
          <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-background">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-surface text-xs text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">{t("estimate.col.item")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">{t("estimate.col.qty")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">{t("estimate.col.price")}</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">{t("estimate.col.amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {estimate.items.map((it) => (
                  <tr key={it.key}>
                    <td className="px-4 py-3">{t(`estimate.items.${it.key}`)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">
                      {it.unit === "식" ? `1 ${t("estimate.set")}` : `${it.qty.toFixed(1)} ${it.unit}`}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{it.unit === "식" ? "–" : num(it.price)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{num(it.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-surface font-semibold">
                  <td className="px-4 py-3" colSpan={3}>
                    {t("estimate.total")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{num(estimate.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("estimate.note")}</p>
        </div>
      </section>
    </>
  );
}
