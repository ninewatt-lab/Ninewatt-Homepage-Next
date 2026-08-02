"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { SolarPlant } from "@/data/solarPlants";

function PlantCard({ plant }: { plant: SolarPlant }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden group">
      {plant.images.length > 0 ? (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={plant.images[0]}
            alt={plant.name}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-xs font-medium text-zinc-700 dark:text-zinc-300 rounded">
              {plant.statusLabel}
            </span>
          </div>
        </div>
      ) : (
        <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <p className="text-sm text-zinc-400">{plant.statusLabel}</p>
        </div>
      )}

      <div className="p-5">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
          {plant.name}
        </h3>
        {plant.factory && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {plant.factory}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
          <span>
            {plant.capacity >= 1000 ? `${plant.capacity / 1000}MW` : `${plant.capacity}kW`}
          </span>
          <span className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
          <span>{plant.typeLabel}</span>
          <span className="w-px h-3 bg-zinc-200 dark:bg-zinc-700" />
          <span>{plant.address}</span>
        </div>
      </div>
    </div>
  );
}

/** 필터 탭만 클라이언트 상태가 필요하다. 카드 목록 자체는 서버에서 넘어온 데이터를 그린다. */
export default function PlantGrid({ plants }: { plants: SolarPlant[] }) {
  const t = useTranslations("solar.sites");
  const [filter, setFilter] = useState<"all" | "operating" | "developing">("all");

  const filtered = filter === "all" ? plants : plants.filter((p) => p.status === filter);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800">
        {(["all", "operating", "developing"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === f
                ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            {f === "all" ? t("filterAll") : f === "operating" ? t("filterOperating") : t("filterDeveloping")}
            <span className="ml-1 text-zinc-400">
              {f === "all" ? plants.length : plants.filter((p) => p.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Plant grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </>
  );
}
