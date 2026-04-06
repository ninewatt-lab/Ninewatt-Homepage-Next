"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type InquiryType = "solar" | "ess" | "integrated" | "product" | "ppa";

export default function EnergyContactPage() {
  const t = useTranslations("energy.contact");
  const [submitted, setSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState<InquiryType>("solar");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const typeLabel = t(`inquiryTypes.${inquiryType}`);

    let details = `[${typeLabel} 문의]\n연락처: ${formData.get("phone")}\n`;

    if (inquiryType === "solar" || inquiryType === "integrated") {
      details += `발전소 용량: ${formData.get("plantCapacity") || "-"}kW\n발전소 위치: ${formData.get("plantLocation") || "-"}\n발전소 유형: ${formData.get("plantType") || "-"}\n`;
    }
    if (inquiryType === "ess" || inquiryType === "integrated") {
      details += `ESS 용량: ${formData.get("essCapacity") || "-"}kWh\n배터리 제조사: ${formData.get("essManufacturer") || "-"}\nPCS 용량: ${formData.get("pcsCapacity") || "-"}kW\n`;
    }
    details += `\n${formData.get("message") || ""}`;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email") || `${formData.get("phone")}@energy.ninewatt.com`,
          phone: formData.get("phone"),
          type: `Ninewatt Energy O&M - ${typeLabel}`,
          message: details,
        }),
      });
      if (!res.ok) throw new Error("전송 실패");
      setSubmitted(true);
    } catch {
      alert("문의 전송에 실패했습니다. 전화로 연락 부탁드립니다.");
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-20 pb-12 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="py-12 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-10 text-center">
                  <svg className="w-16 h-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">
                    문의가 접수되었습니다
                  </h3>
                  <p className="mt-2 text-zinc-500">
                    {t("form.success")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Inquiry Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      {t("inquiryType")}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {(["solar", "ess", "integrated", "product", "ppa"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInquiryType(type)}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                            inquiryType === type
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                          }`}
                        >
                          {t(`inquiryTypes.${type}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        {t("form.name")} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        {t("form.phone")} *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      {t("form.email")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                    />
                  </div>

                  {/* PV Fields */}
                  {(inquiryType === "solar" || inquiryType === "integrated") && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          {t("form.plantCapacity")}
                        </label>
                        <input
                          type="number"
                          name="plantCapacity"
                          placeholder="100"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          {t("form.plantLocation")}
                        </label>
                        <input
                          type="text"
                          name="plantLocation"
                          placeholder="예: 경기도 화성시"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          {t("form.plantType")}
                        </label>
                        <select
                          name="plantType"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                        >
                          <option value="rooftop">{t("form.plantTypeOptions.rooftop")}</option>
                          <option value="ground">{t("form.plantTypeOptions.ground")}</option>
                          <option value="other">{t("form.plantTypeOptions.other")}</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ESS Fields */}
                  {(inquiryType === "ess" || inquiryType === "integrated") && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          {t("form.essCapacity")}
                        </label>
                        <input
                          type="number"
                          name="essCapacity"
                          placeholder="500"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          {t("form.essManufacturer")}
                        </label>
                        <input
                          type="text"
                          name="essManufacturer"
                          placeholder="예: 삼성SDI"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          {t("form.pcsCapacity")}
                        </label>
                        <input
                          type="number"
                          name="pcsCapacity"
                          placeholder="250"
                          className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      {t("form.message")}
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder={t("form.messagePlaceholder")}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
                  >
                    {t("form.submit")}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800 sticky top-24">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
                  연락처
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <div>
                      <p className="text-sm text-zinc-500">전화</p>
                      <a href="tel:070-8866-7226" className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors">
                        070-8866-7226
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <div>
                      <p className="text-sm text-zinc-500">이메일</p>
                      <a href="mailto:ninewatt@ninewatt.com" className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors">
                        ninewatt@ninewatt.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-zinc-500">본사</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        인천광역시 연수구 컨벤시아대로 204, 104호 (22004)
                      </p>
                      <p className="text-sm text-zinc-500 mt-2">기업부설연구소</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        서울특별시 강남구 강남대로162길 22, 2·4F (06028)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm text-zinc-500 mb-3">상담 가능 시간</p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    평일 09:00 ~ 18:00
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    긴급 장애 신고는 24시간 접수 가능
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
