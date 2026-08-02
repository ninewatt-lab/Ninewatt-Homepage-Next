export interface SolarPlant {
  id: string;
  name: string;
  /** 수용가(공장) 이름. 노지형은 빈 문자열 */
  factory: string;
  /** 시·군 단위 축약 주소 (카드에 노출) */
  address: string;
  fullAddress: string;
  /** kW */
  capacity: number;
  status: "operating" | "developing";
  type: "rooftop" | "ground";
  typeLabel: string;
  statusLabel: string;
  images: string[];
}

export const solarPlants: SolarPlant[] = [
  {
    id: "plant-16", name: "나인와트발전소 16호", factory: "건우금속",
    address: "경상북도 영천시", fullAddress: "경상북도 영천시 영천산단로 385",
    capacity: 1000, status: "operating", type: "rooftop",
    typeLabel: "옥상임대형", statusLabel: "운전중",
    images: ["/images/solar/sites/site-drone-01.jpg", "/images/solar/sites/site-drone-02.jpg"],
  },
  {
    id: "plant-15", name: "나인와트발전소 15호", factory: "예천군",
    address: "경상북도 예천군", fullAddress: "경상북도 예천군 지보면 도화리 503",
    capacity: 300, status: "operating", type: "ground",
    typeLabel: "노지형", statusLabel: "운전중",
    images: ["/images/solar/sites/site-ground-01.jpg", "/images/solar/sites/site-ground-02.jpg"],
  },
  {
    id: "plant-13", name: "나인와트태양광발전소 13호", factory: "대승",
    address: "경상북도 경주시", fullAddress: "경상북도 경주시 강동면 왕신리 765-1",
    capacity: 100, status: "operating", type: "rooftop",
    typeLabel: "옥상임대형", statusLabel: "운전중",
    images: ["/images/solar/sites/site-drone-04.jpg", "/images/solar/sites/site-drone-05.jpg"],
  },
  {
    id: "plant-14", name: "나인와트태양광발전소 14호", factory: "대승",
    address: "경상북도 경주시", fullAddress: "경상북도 경주시 강동면 왕신리 765-1",
    capacity: 100, status: "operating", type: "rooftop",
    typeLabel: "옥상임대형", statusLabel: "운전중",
    images: ["/images/solar/sites/site-drone-06.jpg"],
  },
  {
    id: "plant-11", name: "나인와트태양광발전소 11호", factory: "디에스글로벌",
    address: "경상북도 경주시", fullAddress: "경상북도 경주시 천북면 오야리 1382-3",
    capacity: 100, status: "operating", type: "rooftop",
    typeLabel: "옥상임대형", statusLabel: "운전중",
    images: ["/images/solar/sites/site-drone-07.jpg", "/images/solar/sites/site-drone-08.jpg"],
  },
  {
    id: "plant-12", name: "나인와트태양광발전소 12호", factory: "디에스글로벌",
    address: "경상북도 경주시", fullAddress: "경상북도 경주시 천북면 오야리 1382-3",
    capacity: 100, status: "operating", type: "rooftop",
    typeLabel: "옥상임대형", statusLabel: "운전중",
    images: ["/images/solar/sites/site-drone-09.jpg"],
  },
  {
    id: "plant-17-18", name: "나인와트발전소 17·18호", factory: "디에스글로벌",
    address: "경상북도 경주시", fullAddress: "경상북도 경주시 천북면 오야리 1381-4",
    capacity: 640, status: "developing", type: "rooftop",
    typeLabel: "옥상임대형", statusLabel: "공사 착공",
    images: ["/images/solar/sites/site-drone-10.jpg"],
  },
  {
    id: "plant-naju", name: "나주 1MW 발전소", factory: "",
    address: "전라남도 나주시", fullAddress: "전라남도 나주시 왕곡면 행전리 116-19",
    capacity: 1000, status: "developing", type: "ground",
    typeLabel: "노지형", statusLabel: "선로대기",
    images: ["/images/solar/sites/site-ground-03.jpg"],
  },
  {
    id: "plant-taean", name: "태안 500kW 발전소", factory: "",
    address: "충청남도 태안군", fullAddress: "충청남도 태안군 남면 신온리 652-361",
    capacity: 500, status: "developing", type: "ground",
    typeLabel: "노지형", statusLabel: "개발 진행중",
    images: [],
  },
];

/** kW 합계 */
export function totalCapacity(plants: SolarPlant[] = solarPlants): number {
  return plants.reduce((sum, p) => sum + p.capacity, 0);
}

/** 운전중 설비의 kW 합계 */
export function operatingCapacity(plants: SolarPlant[] = solarPlants): number {
  return plants
    .filter((p) => p.status === "operating")
    .reduce((sum, p) => sum + p.capacity, 0);
}
