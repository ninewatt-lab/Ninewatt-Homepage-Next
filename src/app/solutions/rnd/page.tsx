import type { Metadata } from "next";
import { RndContent } from "./RndContent";

export const metadata: Metadata = {
  title: "R&D 과제 - Ninewatt",
  description: "나인와트 R&D 수행 이력. 정부 R&D 과제 수행을 통한 기술력 확보",
};

export default function RndPage() {
  return <RndContent />;
}
