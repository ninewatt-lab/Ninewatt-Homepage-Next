// Teams 알림에 붙는 문의 번호·접수 시각. DB 가 없으므로 순번 대신 날짜 + 랜덤 4자리를 쓴다.
// 예: inquiryId "261110-K7Q2", receivedAt "2026-11-10 14:32 (KST)"

// 0/O, 1/I 처럼 채팅에서 헷갈리는 문자를 뺐다.
const ID_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function kstParts(date: Date): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((p) => [p.type, p.value]));
}

export function createInquiryMeta(now: Date = new Date()) {
  const { year, month, day, hour, minute } = kstParts(now);
  const random = crypto.getRandomValues(new Uint8Array(4));
  const suffix = Array.from(random, (b) => ID_CHARS[b % ID_CHARS.length]).join("");

  return {
    inquiryId: `${year.slice(2)}${month}${day}-${suffix}`,
    receivedAt: `${year}-${month}-${day} ${hour}:${minute} (KST)`,
  };
}

// 채널 흐름(TEAMS_WEBHOOK_URL)과 채팅방 흐름(TEAMS_CHAT_WEBHOOK_URL). 설정된 것에만 보낸다.
export function inquiryWebhooks(): { label: string; url: string }[] {
  return [
    { label: "channel", url: process.env.TEAMS_WEBHOOK_URL },
    { label: "chat", url: process.env.TEAMS_CHAT_WEBHOOK_URL },
  ].filter((w): w is { label: string; url: string } => Boolean(w.url));
}

// 모든 흐름에 같은 번호로 보낸다. 한 곳에라도 들어가면 접수된 것으로 본다 —
// 실패로 돌려주면 사용자가 다시 보내서 들어간 쪽에 중복이 생긴다.
export async function postInquiry(
  webhooks: { label: string; url: string }[],
  payload: Record<string, string>
): Promise<boolean> {
  const body = JSON.stringify({ ...createInquiryMeta(), ...payload });

  const results = await Promise.allSettled(
    webhooks.map(async ({ url }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    })
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Teams 웹훅 전송 실패 (${webhooks[i]!.label}):`, r.reason);
    }
  });
  return results.some((r) => r.status === "fulfilled");
}
