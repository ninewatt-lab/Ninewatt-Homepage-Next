"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type Plant = {
  id: string;
  name: string;
  factory: string;
  address: string;
  fullAddress: string;
  capacity: number;
  status: string;
  type: string;
  typeLabel: string;
  statusLabel: string;
  images: string[];
};

function PlantCard({ plant }: { plant: Plant }) {
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

export default function SitesPage() {
  const t = useTranslations("solar.sites");
  const [filter, setFilter] = useState<"all" | "operating" | "developing">("all");

  const plantData: Plant[] = [
    {
      id: "plant-16", name: "나인와트발전소 16호", factory: "건우금속",
      address: "경상북도 영천시", fullAddress: "경상북도 영천시 영천산단로 385",
      capacity: 1000, status: "operating", type: "rooftop",
      typeLabel: "옥상임대형", statusLabel: "운전중",
      images: ["/images/solar/sites/site-drone-01.jpg", "/images/solar/sites/site-drone-02.jpg"]
    },
    {
      id: "plant-15", name: "나인와트발전소 15호", factory: "예천군",
      address: "경상북도 예천군", fullAddress: "경상북도 예천군 지보면 도화리 503",
      capacity: 300, status: "operating", type: "ground",
      typeLabel: "노지형", statusLabel: "운전중",
      images: ["/images/solar/sites/site-ground-01.jpg", "/images/solar/sites/site-ground-02.jpg"]
    },
    {
      id: "plant-13", name: "나인와트태양광발전소 13호", factory: "대승",
      address: "경상북도 경주시", fullAddress: "경상북도 경주시 강동면 왕신리 765-1",
      capacity: 100, status: "operating", type: "rooftop",
      typeLabel: "옥상임대형", statusLabel: "운전중",
      images: ["/images/solar/sites/site-drone-04.jpg", "/images/solar/sites/site-drone-05.jpg"]
    },
    {
      id: "plant-14", name: "나인와트태양광발전소 14호", factory: "대승",
      address: "경상북도 경주시", fullAddress: "경상북도 경주시 강동면 왕신리 765-1",
      capacity: 100, status: "operating", type: "rooftop",
      typeLabel: "옥상임대형", statusLabel: "운전중",
      images: ["/images/solar/sites/site-drone-06.jpg"]
    },
    {
      id: "plant-11", name: "나인와트태양광발전소 11호", factory: "디에스글로벌",
      address: "경상북도 경주시", fullAddress: "경상북도 경주시 천북면 오야리 1382-3",
      capacity: 100, status: "operating", type: "rooftop",
      typeLabel: "옥상임대형", statusLabel: "운전중",
      images: ["/images/solar/sites/site-drone-07.jpg", "/images/solar/sites/site-drone-08.jpg"]
    },
    {
      id: "plant-12", name: "나인와트태양광발전소 12호", factory: "디에스글로벌",
      address: "경상북도 경주시", fullAddress: "경상북도 경주시 천북면 오야리 1382-3",
      capacity: 100, status: "operating", type: "rooftop",
      typeLabel: "옥상임대형", statusLabel: "운전중",
      images: ["/images/solar/sites/site-drone-09.jpg"]
    },
    {
      id: "plant-17-18", name: "나인와트발전소 17·18호", factory: "디에스글로벌",
      address: "경상북도 경주시", fullAddress: "경상북도 경주시 천북면 오야리 1381-4",
      capacity: 640, status: "developing", type: "rooftop",
      typeLabel: "옥상임대형", statusLabel: "공사 착공",
      images: ["/images/solar/sites/site-drone-10.jpg"]
    },
    {
      id: "plant-naju", name: "나주 1MW 발전소", factory: "",
      address: "전라남도 나주시", fullAddress: "전라남도 나주시 왕곡면 행전리 116-19",
      capacity: 1000, status: "developing", type: "ground",
      typeLabel: "노지형", statusLabel: "선로대기",
      images: ["/images/solar/sites/site-ground-03.jpg"]
    },
    {
      id: "plant-taean", name: "태안 500kW 발전소", factory: "",
      address: "충청남도 태안군", fullAddress: "충청남도 태안군 남면 신온리 652-361",
      capacity: 500, status: "developing", type: "ground",
      typeLabel: "노지형", statusLabel: "개발 진행중",
      images: []
    },
  ];

  const filtered = filter === "all" ? plantData : plantData.filter((p) => p.status === filter);

  const totalCapacity = plantData.reduce((sum, p) => sum + p.capacity, 0);
  const operatingCapacity = plantData
    .filter((p) => p.status === "operating")
    .reduce((sum, p) => sum + p.capacity, 0);

  return (
    <>
      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-primary font-medium tracking-[0.2em] uppercase">Portfolio</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400 max-w-lg">
            {t("subtitle")}
          </p>

          {/* Summary stats */}
          <div className="mt-10 flex items-center gap-10">
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {(totalCapacity / 1000).toFixed(2)}
                <span className="text-sm font-medium text-zinc-400 ml-1">MW</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">{t("totalCapacity")}</p>
            </div>
            <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {(operatingCapacity / 1000).toFixed(1)}
                <span className="text-sm font-medium text-zinc-400 ml-1">MW</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">{t("operatingLabel")}</p>
            </div>
            <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-700" />
            <div>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {plantData.length}
                <span className="text-sm font-medium text-zinc-400 ml-1">개소</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">총 발전소</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  {f === "all" ? plantData.length : plantData.filter((p) => p.status === f).length}
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
        </div>
      </section>
    </>
  );
}
