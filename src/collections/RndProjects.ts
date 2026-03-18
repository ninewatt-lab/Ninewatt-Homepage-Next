import type { CollectionConfig } from "payload";

export const RndProjects: CollectionConfig = {
  slug: "rnd-projects",
  labels: {
    singular: "R&D 과제",
    plural: "R&D 과제",
  },
  admin: {
    useAsTitle: "research",
    defaultColumns: ["research", "agency", "status", "period"],
    group: "사업",
    description: "국가 R&D 과제 정보를 관리합니다.",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "기본 정보",
          description: "과제의 기본 정보를 입력하세요",
          fields: [
            {
              name: "agency",
              type: "text",
              required: true,
              label: "수행기관",
              admin: {
                description: "과제 수행 기관명",
                placeholder: "산업통상자원부",
              },
            },
            {
              name: "research",
              type: "text",
              required: true,
              localized: true,
              label: "과제명",
              admin: {
                description: "과제명을 정확히 입력하세요",
              },
            },
            {
              name: "lead",
              type: "text",
              required: true,
              label: "주관기관",
              admin: {
                description: "주관 연구 기관명",
              },
            },
            {
              name: "period",
              type: "text",
              required: true,
              label: "수행기간",
              admin: {
                description: "수행 기간을 입력하세요",
                placeholder: "2024.01 ~ 2025.12",
              },
            },
            {
              name: "status",
              type: "select",
              required: true,
              label: "상태",
              options: [
                { label: "수행중", value: "수행중" },
                { label: "완료", value: "완료" },
              ],
              admin: {
                description: "현재 과제 진행 상태",
              },
            },
          ],
        },
        {
          label: "상세 정보",
          description: "과제의 상세 내용을 입력하세요",
          fields: [
            {
              name: "detail",
              type: "group",
              label: "상세정보",
              fields: [
                {
                  name: "goal",
                  type: "textarea",
                  localized: true,
                  label: "목표",
                  admin: {
                    description: "과제의 연구 목표를 기술하세요",
                  },
                },
                {
                  name: "contents",
                  type: "array",
                  label: "연구내용",
                  admin: {
                    description: "주요 연구 내용을 항목별로 추가하세요",
                    components: {
                      RowLabel:
                        "@/components/admin/RowLabels#RndContentRowLabel",
                    },
                  },
                  fields: [
                    {
                      name: "item",
                      type: "text",
                      localized: true,
                      label: "내용",
                    },
                  ],
                },
                {
                  name: "budget",
                  type: "text",
                  label: "예산",
                  admin: {
                    description: "총 연구비",
                    placeholder: "5억원",
                  },
                },
                {
                  name: "department",
                  type: "text",
                  label: "담당부서",
                  admin: {
                    description: "담당 부서명",
                  },
                },
                {
                  name: "category",
                  type: "text",
                  label: "분류",
                  admin: {
                    description: "과제 분류",
                    placeholder: "에너지, IoT, AI",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  access: {
    read: () => true,
  },
};
