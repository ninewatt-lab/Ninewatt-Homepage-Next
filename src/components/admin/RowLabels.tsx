"use client";
import { useRowLabel } from "@payloadcms/ui";

export const SocialLinkRowLabel = () => {
  const { data } = useRowLabel<{ platform?: string; url?: string }>();
  return <span>{data?.platform || "새 소셜 링크"}</span>;
};

export const StatsRowLabel = () => {
  const { data } = useRowLabel<{ label?: string; value?: string }>();
  return (
    <span>
      {data?.label ? `${data.label}: ${data.value}` : "새 통계 항목"}
    </span>
  );
};

export const ExecutiveMemberRowLabel = () => {
  const { data } = useRowLabel<{ name?: string; role?: string }>();
  return (
    <span>
      {data?.name ? `${data.name} (${data.role || ""})` : "새 경영진"}
    </span>
  );
};

export const ExecutiveDetailRowLabel = () => {
  const { data } = useRowLabel<{ item?: string }>();
  return <span>{data?.item || "새 경력사항"}</span>;
};

export const DepartmentRowLabel = () => {
  const { data } = useRowLabel<{ name?: string }>();
  return <span>{data?.name || "새 부서"}</span>;
};

export const ValueRowLabel = () => {
  const { data } = useRowLabel<{ title?: string }>();
  return <span>{data?.title || "새 가치"}</span>;
};

export const BenefitCategoryRowLabel = () => {
  const { data } = useRowLabel<{ category?: string }>();
  return <span>{data?.category || "새 카테고리"}</span>;
};

export const BenefitItemRowLabel = () => {
  const { data } = useRowLabel<{ title?: string }>();
  return <span>{data?.title || "새 항목"}</span>;
};

export const StepRowLabel = () => {
  const { data } = useRowLabel<{ step?: string; title?: string }>();
  return (
    <span>
      {data?.step ? `${data.step}. ${data.title || ""}` : "새 단계"}
    </span>
  );
};

export const CountryRowLabel = () => {
  const { data } = useRowLabel<{ country?: string }>();
  return <span>{data?.country || "새 국가"}</span>;
};

export const BusinessItemRowLabel = () => {
  const { data } = useRowLabel<{ text?: string }>();
  return <span>{data?.text || "새 사업 항목"}</span>;
};

export const RndContentRowLabel = () => {
  const { data } = useRowLabel<{ item?: string }>();
  return <span>{data?.item || "새 연구내용"}</span>;
};
