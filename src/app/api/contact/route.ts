import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, company, email, phone, type, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("TEAMS_WEBHOOK_URL 환경변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 }
      );
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        company: company || "-",
        email,
        phone: phone || "-",
        type,
        message,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Teams 웹훅 전송 실패:", res.status, text);
      return NextResponse.json(
        { error: "문의 전송에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("문의 전송 실패:", error);
    return NextResponse.json(
      { error: "문의 전송에 실패했습니다." },
      { status: 500 }
    );
  }
}
