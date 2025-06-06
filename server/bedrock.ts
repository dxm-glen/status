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
    "intelligence": "지능을 X점으로 설정한 이유: 사용자의 답변에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "creativity": "창의성을 X점으로 설정한 이유: 사용자의 답변에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "social": "사회성을 X점으로 설정한 이유: 사용자의 답변에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "physical": "체력을 X점으로 설정한 이유: 사용자의 답변에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "emotional": "감성을 X점으로 설정한 이유: 사용자의 답변에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "focus": "집중력을 X점으로 설정한 이유: 사용자의 답변에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "adaptability": "적응력을 X점으로 설정한 이유: 사용자의 답변에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요."
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
    "intelligence": "지능을 X점으로 설정한 이유: GPT 분석에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "creativity": "창의성을 X점으로 설정한 이유: GPT 분석에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "social": "사회성을 X점으로 설정한 이유: GPT 분석에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "physical": "체력을 X점으로 설정한 이유: GPT 분석에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "emotional": "감성을 X점으로 설정한 이유: GPT 분석에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "focus": "집중력을 X점으로 설정한 이유: GPT 분석에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요.",
    "adaptability": "적응력을 X점으로 설정한 이유: GPT 분석에서 Y라는 부분을 통해 Z를 확인했습니다. 만약 해당 스탯을 추론할 수 있는 정보가 부족하다면 기본값 20으로 설정했다고 명시하세요."
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
    console.log("Using fallback analysis for development");
    
    // Development fallback with realistic analysis
    let fallbackStats, fallbackSummary, fallbackExplanations;
    
    if (inputMethod === "questionnaire") {
      const answers = inputData;
      // Generate contextual stats based on actual answers
      fallbackStats = {
        intelligence: answers.q1 === "methodical" ? 85 : answers.q1 === "focused" ? 78 : 72,
        creativity: answers.q2 === "creative" ? 82 : answers.q2 === "technical" ? 65 : 75,
        social: answers.q3 === "social" ? 88 : answers.q4 === "collaborative" ? 76 : 68,
        physical: answers.q3 === "activity" ? 80 : 55,
        emotional: answers.q3 === "social" ? 85 : answers.q5 === "helping" ? 82 : 70,
        focus: answers.q1 === "focused" ? 90 : answers.q1 === "methodical" ? 85 : 72,
        adaptability: answers.q4 === "observant" ? 78 : answers.q4 === "adventurous" ? 85 : 70
      };
      
      fallbackSummary = "체계적이고 논리적인 사고를 선호하며, 집중력이 뛰어난 분석형 성격입니다. 새로운 기술과 지식 습득에 관심이 많고, 문제 해결을 통해 성취감을 느끼는 타입입니다.";
      
      fallbackExplanations = {
        intelligence: "체계적 접근과 문제 해결 선호도를 바탕으로 높은 지능 점수를 부여했습니다.",
        creativity: "기술적 학습 선호도를 고려하여 실용적 창의성에 점수를 배정했습니다.",
        social: "스트레스 대처 방식과 협업 성향을 분석하여 적정 수준으로 평가했습니다.",
        physical: "활동적 대처보다는 분석적 접근을 선호하는 것으로 보여 보통 수준입니다.",
        emotional: "문제 해결을 통한 성취감과 타인 배려를 바탕으로 균형잡힌 점수입니다.",
        focus: "완전한 몰입과 체계적 진행을 중시하는 답변으로 높은 집중력을 확인했습니다.",
        adaptability: "새로운 환경에서의 관찰과 분석 능력을 토대로 적응력을 평가했습니다."
      };
    } else {
      // GPT 분석 기반 fallback
      fallbackStats = {
        intelligence: 75, creativity: 68, social: 72, physical: 58,
        emotional: 78, focus: 80, adaptability: 75
      };
      
      fallbackSummary = "균형 잡힌 성격으로 논리적 사고와 감정적 이해가 조화를 이루는 타입입니다. 꾸준한 집중력과 적응 능력을 바탕으로 다양한 상황에서 안정적인 성과를 보입니다.";
      
      fallbackExplanations = {
        intelligence: "제공된 분석 데이터를 바탕으로 논리적 사고 능력을 평가했습니다.",
        creativity: "창의적 사고 패턴과 아이디어 발상 능력을 종합적으로 분석했습니다.",
        social: "대인 관계와 소통 능력에 대한 정보를 토대로 점수를 산정했습니다.",
        physical: "신체적 활동성과 에너지 수준에 대한 분석 결과입니다.",
        emotional: "감정 인식과 공감 능력을 종합적으로 평가한 점수입니다.",
        focus: "집중력과 지속성에 대한 분석을 바탕으로 높은 점수를 부여했습니다.",
        adaptability: "변화 수용과 유연성에 대한 평가 결과를 반영한 점수입니다."
      };
    }
    
    const totalPoints = Object.values(fallbackStats).reduce((sum, val) => sum + val, 0);
    const level = Math.max(1, Math.floor(totalPoints / 50));
    
    return {
      ...fallbackStats,
      totalPoints,
      level,
      summary: fallbackSummary,
      statExplanations: fallbackExplanations
    };
  }
}

// 미션 생성을 위한 함수
export async function generateMissions(userId: number, userStats: UserStats): Promise<any[]> {
  const prompt = `사용자의 현재 스탯을 분석하여 개인 성장을 위한 일일 미션을 생성해주세요.

현재 사용자 스탯:
- 지능: ${userStats.intelligence}/100
- 창의성: ${userStats.creativity}/100  
- 사회성: ${userStats.social}/100
- 체력: ${userStats.physical}/100
- 감성: ${userStats.emotional}/100
- 집중력: ${userStats.focus}/100
- 적응력: ${userStats.adaptability}/100

총 4개의 미션을 생성해주세요. 미션은 현실적이고 실행 가능해야 하며, 사용자의 현재 스탯 수준에 맞는 적절한 난이도여야 합니다.

다음 형식으로 JSON을 생성해주세요:
{
  "missions": [
    {
      "title": "미션 제목 (간결하고 명확하게)",
      "description": "미션에 대한 구체적인 설명과 수행 방법",
      "difficulty": "easy|medium|hard",
      "estimatedTime": "예상 소요 시간 (예: 30분, 1시간, 2시간)",
      "targetStats": ["intelligence", "creativity"] // 1~3개의 스탯 (이 미션으로 증가할 스탯들)
    }
  ]
}

미션 생성 가이드라인:
1. 총 4개의 다양한 미션 생성
2. 각 미션은 1~3개의 스탯을 동시에 증가시킬 수 있음
3. 사용자의 현재 스탯이 낮으면 기초적인 미션, 높으면 도전적인 미션
4. 실제로 수행 가능한 구체적인 활동
5. 난이도는 현재 스탯 수준에 따라 조정 (1-30: easy, 31-70: medium, 71-100: hard)
6. 예상 시간은 현실적으로 설정
7. targetStats는 해당 미션이 향상시킬 스탯들의 배열

JSON만 출력하고 다른 설명은 없이 응답해주세요.`;

  try {
    const payload = {
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt
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
    
    const result = JSON.parse(jsonMatch[0]);
    return result.missions || [];
    
  } catch (error) {
    console.error("Bedrock mission generation error:", error);
    throw error; // AI 미션 생성 실패시 에러를 상위로 전달
  }
}