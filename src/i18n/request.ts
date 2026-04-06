import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { hasLocale } from "next-intl";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const common = (await import(`../messages/${locale}/common.json`)).default;
  const home = (await import(`../messages/${locale}/home.json`)).default;
  const product = (await import(`../messages/${locale}/product.json`)).default;
  const solutions = (
    await import(`../messages/${locale}/solutions.json`)
  ).default;
  const company = (await import(`../messages/${locale}/company.json`)).default;
  const contact = (await import(`../messages/${locale}/contact.json`)).default;

  let solar = {};
  try {
    solar = (await import(`../messages/${locale}/solar.json`)).default;
  } catch {
    solar = (await import(`../messages/ko/solar.json`)).default;
  }

  let energy = {};
  try {
    energy = (await import(`../messages/${locale}/energy.json`)).default;
  } catch {
    energy = (await import(`../messages/ko/energy.json`)).default;
  }

  let ess = {};
  try {
    ess = (await import(`../messages/${locale}/ess.json`)).default;
  } catch {
    ess = (await import(`../messages/ko/ess.json`)).default;
  }

  return {
    locale,
    messages: {
      common,
      home,
      product,
      solutions,
      company,
      contact,
      solar,
      energy,
      ess,
    },
  };
});
