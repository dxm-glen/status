import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface UserStats {
  intelligence: number;
  creativity: number;
  social: number;
  physical: number;
  emotional: number;
  focus: number;
  adaptability: number;
  totalPoints: number;
  level: number;
}

export async function analyzeUserInput(inputMethod: string, inputData: any): Promise<UserStats> {
  let analysisPrompt = "";
  
  if (inputMethod === "questionnaire") {
    // 질문지 답변을 기반으로 프롬프트 생성
    const answers = inputData;
    analysisPrompt = `
사용자가 다음 질문들에 답한 내용을 분석해서 RPG 캐릭터의 7가지 스탯을 생성해주세요.
각 스탯은 1-99 사이의 값으로, 총합이 200-350 사이가 되도록 해주세요.

질문 답변:
1. 몰입할 때 행동: ${answers.q1}
2. 배우고 싶은 것: ${answers.q2}  
3. 스트레스 대처: ${answers.q3}
4. 새로운 환경에서의 반응: ${answers.q4}
5. 성취감을 느끼는 순간: ${answers.q5}

다음 7가지 스탯을 JSON 형식으로 분석해주세요:
- intelligence: 지능 (논리적 사고, 문제 해결 능력)
- creativity: 창의성 (새로운 아이디어, 예술적 감각)
- social: 사회성 (소통 능력, 대인 관계)
- physical: 체력 (신체 활동, 운동 능력)
- emotional: 감성 (감정 인식, 공감 능력)
- focus: 집중력 (주의력, 지속력)
- adaptability: 적응력 (변화 수용, 유연성)

JSON만 출력하고 다른 설명은 없이 응답해주세요.
`;
  } else if (inputMethod === "gpt-paste") {
    // GPT 분석 결과를 기반으로 프롬프트 생성
    const gptResponse = inputData.gptResponse;
    analysisPrompt = `
사용자가 GPT로부터 받은 다음 자기 분석 결과를 바탕으로 RPG 캐릭터의 7가지 스탯을 생성해주세요.
각 스탯은 1-99 사이의 값으로, 총합이 200-350 사이가 되도록 해주세요.

GPT 분석 결과:
${gptResponse}

다음 7가지 스탯을 JSON 형식으로 분석해주세요:
- intelligence: 지능 (논리적 사고, 문제 해결 능력)
- creativity: 창의성 (새로운 아이디어, 예술적 감각)
- social: 사회성 (소통 능력, 대인 관계)
- physical: 체력 (신체 활동, 운동 능력)
- emotional: 감성 (감정 인식, 공감 능력)
- focus: 집중력 (주의력, 지속력)
- adaptability: 적응력 (변화 수용, 유연성)

JSON만 출력하고 다른 설명은 없이 응답해주세요.
`;
  }

  try {
    const payload = {
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: analysisPrompt
          }
        ]
      })
    };

    const command = new InvokeModelCommand(payload);
    const response = await bedrockClient.send(command);
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.content[0].text;
    
    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    
    const stats = JSON.parse(jsonMatch[0]);
    
    // 총 포인트 계산
    const totalPoints = stats.intelligence + stats.creativity + stats.social + 
                       stats.physical + stats.emotional + stats.focus + stats.adaptability;
    
    // 레벨 계산 (총 포인트 / 50으로 기본 레벨 계산)
    const level = Math.max(1, Math.floor(totalPoints / 50));
    
    return {
      intelligence: Math.min(99, Math.max(1, stats.intelligence)),
      creativity: Math.min(99, Math.max(1, stats.creativity)),
      social: Math.min(99, Math.max(1, stats.social)),
      physical: Math.min(99, Math.max(1, stats.physical)),
      emotional: Math.min(99, Math.max(1, stats.emotional)),
      focus: Math.min(99, Math.max(1, stats.focus)),
      adaptability: Math.min(99, Math.max(1, stats.adaptability)),
      totalPoints,
      level
    };
    
  } catch (error) {
    console.error("Bedrock analysis error:", error);
    throw new Error("Failed to analyze user input with Bedrock");
  }
}