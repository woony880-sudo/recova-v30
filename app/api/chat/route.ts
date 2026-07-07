import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, mood, nickname, count, hasImage } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          comment:
            "오늘의 기록을 남긴 것만으로도 충분히 잘하고 있어요. 작은 루틴이 쌓여 분명한 변화를 만들 거예요.",
        },
        { status: 200 }
      );
    }

    const prompt = `
당신은 RECOVA의 AI 회복 코멘트 작성자입니다.

RECOVA는 사용자가 사진이나 짧은 문장으로 오늘의 루틴을 인증하면,
그 기록을 보고 사용자가 어제보다 조금 더 나아졌음을 느끼게 돕는 AI Recovery Platform입니다.

규칙:
- 한국어로 작성합니다.
- 2~3문장으로 작성합니다.
- 너무 과장하지 않습니다.
- 진단, 치료, 의학 조언은 하지 않습니다.
- 사용자가 오늘 기록을 남긴 행동 자체를 긍정해 주세요.
- 말투는 따뜻하고 담백하게 합니다.
- RECOVA의 핵심은 기록이 아니라 회복과 성장입니다.

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
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 220,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          comment:
            "오늘의 기록을 남긴 것만으로도 충분히 잘하고 있어요. 작은 루틴이 쌓여 분명한 변화를 만들 거예요.",
        },
        { status: 200 }
      );
    }

    const comment =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "오늘의 기록을 남긴 것만으로도 충분히 잘하고 있어요. 작은 루틴이 쌓여 분명한 변화를 만들 거예요.";

    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json(
      {
        comment:
          "오늘의 기록을 남긴 것만으로도 충분히 잘하고 있어요. 작은 루틴이 쌓여 분명한 변화를 만들 거예요.",
      },
      { status: 200 }
    );
  }
}