export interface TrackRecordItem {
  year: number;
  type: "R&D" | "사업화" | "용역" | "PoC" | "지원사업";
  name: string;
  period?: string;
  department?: string;
  org?: string;
}

export function ProductTrackRecord({
  items,
}: {
  items: TrackRecordItem[];
}) {
  const sorted = [...items].sort((a, b) => b.year - a.year);
  const grouped = sorted.reduce<Record<number, TrackRecordItem[]>>(
    (acc, item) => {
      (acc[item.year] ??= []).push(item);
      return acc;
    },
    {},
  );
  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <section className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold">관련 사업 실적</h2>
        <p className="mt-3 text-muted">
          정부 R&D·사업화·실증 과제 수행 이력 ({items.length}건)
        </p>
        <div className="mt-10 space-y-8">
          {years.map((year) => (
            <div key={year} className="md:flex md:gap-8">
              <div className="mb-3 md:mb-0 md:w-20 shrink-0">
                <span className="text-lg font-bold">{year}</span>
              </div>
              <ul className="flex-1 space-y-4">
                {grouped[year].map((item, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex flex-wrap items-start gap-2">
                      <span className="inline-block shrink-0 rounded border border-border px-1.5 py-0.5 text-xs text-muted">
                        {item.type}
                      </span>
                      <span className="leading-relaxed">{item.name}</span>
                    </div>
                    {(item.period || item.department || item.org) && (
                      <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted">
                        {item.period && (
                          <span>사업기간: {item.period}</span>
                        )}
                        {item.department && (
                          <span>주관부처: {item.department}</span>
                        )}
                        {item.org && (
                          <span>운영기관: {item.org}</span>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
