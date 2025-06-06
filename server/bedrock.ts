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

export async function analyzeUserInput(inputMethod: string, inputData: any): Promise<UserStats & { summary?: string; statExplanations?: any }> {
  let analysisPrompt = "";
  
  if (inputMethod === "questionnaire") {
    // 질문지 답변을 기반으로 프롬프트 생성
    const answers = inputData;
    analysisPrompt = `
사용자가 다음 질문들에 답한 내용을 분석해서 RPG 캐릭터의 7가지 스탯과 성격 요약을 생성해주세요.
각 스탯은 1-99 사이의 값으로, 총합이 200-350 사이가 되도록 해주세요.

질문 답변:
1. 몰입할 때 행동: ${answers.q1}
2. 배우고 싶은 것: ${answers.q2}  
3. 스트레스 대처: ${answers.q3}
4. 새로운 환경에서의 반응: ${answers.q4}
5. 성취감을 느끼는 순간: ${answers.q5}

다음 형식으로 JSON을 생성해주세요:
{
  "intelligence": 숫자값,
  "creativity": 숫자값,
  "social": 숫자값,
  "physical": 숫자값,
  "emotional": 숫자값,
  "focus": 숫자값,
  "adaptability": 숫자값,
  "summary": "답변을 바탕으로 파악한 사용자의 성격과 특성을 2-3문장으로 요약",
  "statExplanations": {
    "intelligence": "지능 점수를 이 값으로 설정한 이유와 근거",
    "creativity": "창의성 점수를 이 값으로 설정한 이유와 근거",
    "social": "사회성 점수를 이 값으로 설정한 이유와 근거",
    "physical": "체력 점수를 이 값으로 설정한 이유와 근거",
    "emotional": "감성 점수를 이 값으로 설정한 이유와 근거",
    "focus": "집중력 점수를 이 값으로 설정한 이유와 근거",
    "adaptability": "적응력 점수를 이 값으로 설정한 이유와 근거"
  }
}

JSON만 출력하고 다른 설명은 없이 응답해주세요.
`;
  } else if (inputMethod === "gpt-paste") {
    // GPT 분석 결과를 기반으로 프롬프트 생성
    const gptResponse = inputData.gptResponse;
    analysisPrompt = `
사용자가 GPT로부터 받은 다음 자기 분석 결과를 바탕으로 RPG 캐릭터의 7가지 스탯과 성격 요약을 생성해주세요.
각 스탯은 1-99 사이의 값으로, 총합이 200-350 사이가 되도록 해주세요.

GPT 분석 결과:
${gptResponse}

다음 형식으로 JSON을 생성해주세요:
{
  "intelligence": 숫자값,
  "creativity": 숫자값,
  "social": 숫자값,
  "physical": 숫자값,
  "emotional": 숫자값,
  "focus": 숫자값,
  "adaptability": 숫자값,
  "summary": "GPT 분석을 바탕으로 파악한 사용자의 성격과 특성을 2-3문장으로 요약",
  "statExplanations": {
    "intelligence": "지능 점수를 이 값으로 설정한 이유와 근거",
    "creativity": "창의성 점수를 이 값으로 설정한 이유와 근거",
    "social": "사회성 점수를 이 값으로 설정한 이유와 근거",
    "physical": "체력 점수를 이 값으로 설정한 이유와 근거",
    "emotional": "감성 점수를 이 값으로 설정한 이유와 근거",
    "focus": "집중력 점수를 이 값으로 설정한 이유와 근거",
    "adaptability": "적응력 점수를 이 값으로 설정한 이유와 근거"
  }
}

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
      level,
      summary: stats.summary,
      statExplanations: stats.statExplanations
    };
    
  } catch (error) {
    console.error("Bedrock analysis error:", error);
    throw new Error("Failed to analyze user input with Bedrock");
  }
}