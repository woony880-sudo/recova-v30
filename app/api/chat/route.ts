import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, mood, nickname, count, hasImage } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const prompt = `
당신은 RECOVA의 AI 회복 코멘트 작성자입니다.

RECOVA는 사용자가 사진이나 짧은 문장으로 오늘의 루틴을 인증하면,
그 기록을 보고 응원, 위로, 격려, 용기, 축하의 말을 건네는 서비스입니다.

규칙:
- 한국어로 작성합니다.
- 2~3문장으로 작성합니다.
- 너무 과장하지 않습니다.
- 진단, 치료, 의학 조언은 하지 않습니다.
- 사용자가 오늘 기록을 남긴 행동 자체를 긍정해 주세요.
- 말투는 따뜻하고 담백하게 합니다.

사용자 정보:
닉네임: ${nickname || "익명의 러너"}
기록 횟수: ${count || 1}
사진 여부: ${hasImage ? "있음" : "없음"}
기분: ${mood || "선택 안 함"}
사용자 기록: ${text || "사진만 인증함"}

RECOVA AI 코멘트:
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "gpt-5.5",
    input: prompt,
    max_output_tokens: 220,
  }),
});

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();

    const comment =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "오늘의 기록을 남긴 것만으로도 충분히 잘하고 있어요. 작은 루틴이 쌓여 분명한 변화를 만들 거예요.";

    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json(
      { error: "AI 코멘트 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}