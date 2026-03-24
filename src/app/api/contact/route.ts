import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { name, company, email, phone, type, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlBody = `
      <h2>홈페이지 문의가 접수되었습니다</h2>
      <table style="border-collapse:collapse;width:100%;max-width:600px;">
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;width:120px;">이름</td><td style="padding:8px 12px;border:1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">회사명</td><td style="padding:8px 12px;border:1px solid #ddd;">${company || "-"}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">이메일</td><td style="padding:8px 12px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">연락처</td><td style="padding:8px 12px;border:1px solid #ddd;">${phone || "-"}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">문의 유형</td><td style="padding:8px 12px;border:1px solid #ddd;">${type}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #ddd;font-weight:bold;">문의 내용</td><td style="padding:8px 12px;border:1px solid #ddd;white-space:pre-wrap;">${message}</td></tr>
      </table>
    `;

    await transporter.sendMail({
      from: `"Ninewatt 홈페이지" <${process.env.SMTP_USER}>`,
      to: "junghong@ninewatt.com",
      // cc: [
      //   "kim0rok@ninewatt.com",
      //   "sangrin@ninewatt.com",
      //   "junghong@ninewatt.com",
      //   "anambition@ninewatt.com",
      //   "lovelyrang96@ninewatt.com",
      // ],
      replyTo: email,
      subject: `[홈페이지 문의] ${type} - ${name}`,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("메일 전송 실패:", error);
    return NextResponse.json(
      { error: "메일 전송에 실패했습니다." },
      { status: 500 }
    );
  }
}
