/**
 * JSON-LD 구조화 데이터를 <script> 로 렌더한다.
 *
 * 서버 컴포넌트에서만 쓴다. data 는 우리가 만든 객체이고 사용자 입력이
 * 섞이지 않으므로 dangerouslySetInnerHTML 이 안전하다. 다만 문자열 안의
 * "</script>" 시퀀스는 태그를 조기 종료시키므로 이스케이프한다.
 */
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
