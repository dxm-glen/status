import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, navigate] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // If user is logged in, redirect to dashboard
  if (user?.user) {
    navigate("/dashboard");
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4 neon-glow uppercase animate-pulse-neon">
          WELCOME TO STATUS
        </h1>
        <p className="text-lg text-secondary mb-2">
          &gt; 당신의 성장을 RPG 캐릭터처럼 시각화하세요
        </p>
        <p className="text-accent text-sm">
          AI 분석을 통한 개인 스탯 생성 및 미션 시스템
        </p>
        
        {/* ASCII Art Character */}
        <div className="my-8 text-accent text-xs font-mono leading-tight">
          <pre className="select-none">
{`    ████████████████
    █              █
    █  ◉        ◉  █
    █              █
    █      ___     █
    █              █
    ████████████████
    █████      █████
    █████      █████
    █████      █████`}
          </pre>
          <div className="text-secondary mt-2">[YOUR CHARACTER AWAITS]</div>
        </div>
      </section>

      {/* Input Method Selection */}
      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-secondary text-center mb-8 uppercase">
          &gt; 나를 알아보는 방식 선택
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Method A: Questionnaire */}
          <Card className="cyber-card cursor-pointer group" onClick={() => navigate("/questionnaire")}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4 text-primary">
                🔹
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 uppercase">
                질문에 답해서 나를 파악하기
              </h3>
              <p className="text-sm text-accent mb-6">
                AI가 제공하는 자기 성찰 질문들에 답하여<br />
                당신의 성격과 특성을 분석합니다
              </p>
              
              {/* Preview Questions */}
              <div className="bg-background/50 p-4 text-left text-xs space-y-2 mb-6 border border-accent/30">
                <div className="text-secondary">&gt; 예시 질문:</div>
                <div className="text-accent">• 몰입할 때 나는 어떤 행동을 하나요?</div>
                <div className="text-accent">• 내가 배우고 싶은 것은?</div>
                <div className="text-accent">• 스트레스 받을 때 어떻게 대처하나요?</div>
              </div>
              
              <Button className="cyber-button w-full py-3">
                선택하기
              </Button>
            </CardContent>
          </Card>

          {/* Method B: GPT Analysis */}
          <Card className="cyber-card cursor-pointer group" onClick={() => navigate("/gpt-analysis")}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4 text-secondary">
                🔹
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 uppercase">
                GPT에 질문해서 분석 후 복붙하기
              </h3>
              <p className="text-sm text-accent mb-6">
                제공된 프롬프트를 GPT에 입력하고<br />
                받은 분석 결과를 붙여넣어 주세요
              </p>
              
              {/* GPT Prompt Preview */}
              <div className="bg-background/50 p-4 text-left text-xs mb-6 border border-accent/30">
                <div className="text-secondary mb-2">&gt; GPT 프롬프트:</div>
                <div className="text-accent leading-relaxed">
                  "다음 제목들 아래에 있는 모든 텍스트를 코드 블록 안에 원시 JSON 형식으로 한글로 적어 주세요: 어시스턴트 응답 선호 설정, 주목할 만한 과거 대화..."
                </div>
              </div>
              
              <Button className="cyber-button-cyan w-full py-3">
                선택하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* System Status */}
      <section className="max-w-2xl mx-auto text-center">
        <div className="bg-background/70 border border-accent p-4 text-xs">
          <div className="text-accent mb-2">[SYSTEM STATUS]</div>
          <div className="text-foreground">
            &gt; AI 분석 엔진: AWS BEDROCK
          </div>
          <div className="text-foreground">
            &gt; 데이터베이스: POSTGRESQL
          </div>
          <div className="text-foreground">
            &gt; 상태: ONLINE
          </div>
          <div className="text-accent animate-matrix">
            ████████████████ 100%
          </div>
        </div>
      </section>
    </main>
  );
}
