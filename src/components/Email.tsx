/**
 * 이메일 주소를 Cloudflare 이메일 난독화(Scrape Shield → Email Address Obfuscation)가 건드리지 않게 렌더한다.
 *
 * Cloudflare 는 응답 HTML 의 이메일을 `<a class="__cf_email__">[email protected]</a>` 로 바꾸고
 * 디코딩 스크립트를 끼워 넣는다. React 가 그 스크립트보다 먼저 하이드레이션하면 서버가 그린 글자 자리에
 * 엘리먼트가 있어 #418(서버 · 클라이언트 HTML 불일치)이 난다 — 타이밍에 따라 가끔만 난다.
 *
 * - `<!--email_off-->` 주석 안은 Cloudflare 가 바꾸지 않는다.
 * - dangerouslySetInnerHTML 안쪽은 React 가 하이드레이션 때 비교하지 않는다.
 * 그래서 Cloudflare 설정과 상관없이 불일치가 생기지 않는다. 이메일을 화면에 쓸 때는 이 컴포넌트를 쓴다.
 */

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default function Email({ address, link = false, className }: { address: string; link?: boolean; className?: string }) {
  const safe = escapeHtml(address);
  const inner = link ? `<a href="mailto:${safe}"${className ? ` class="${escapeHtml(className)}"` : ""}>${safe}</a>` : safe;
  return <span dangerouslySetInnerHTML={{ __html: `<!--email_off-->${inner}<!--/email_off-->` }} />;
}
