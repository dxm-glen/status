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
      <section className="text-center mb-16">
        <div className="mb-8 flex justify-center">
          <img 
            src="/attached_assets/Status.png" 
            alt="Status 로고" 
            className="h-32 w-auto"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Status
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          당신의 성장을 RPG 캐릭터처럼 시각화하세요
        </p>
        <p className="text-secondary text-sm">AI 분석을 통한 개인 스탯 생성 및 퀘스트 시스템</p>
      </section>
      {/* Input Method Selection */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-semibold text-foreground text-center mb-12">캐릭터 생성 방식을 선택하세요</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Method A: Questionnaire */}
          <Card className="clean-card cursor-pointer group" onClick={() => navigate("/questionnaire")}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <div className="text-2xl text-primary">📝</div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                질문지 작성하기
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                AI가 제공하는 자기 성찰 질문들에 답하여<br />
                당신의 성격과 특성을 분석합니다
              </p>
              
              {/* Preview Questions */}
              <div className="bg-muted/30 p-4 text-left text-sm space-y-2 mb-6 rounded-lg">
                <div className="text-secondary font-medium">예시 질문:</div>
                <div className="text-muted-foreground">• 몰입할 때 나는 어떤 행동을 하나요?</div>
                <div className="text-muted-foreground">• 내가 배우고 싶은 것은?</div>
                <div className="text-muted-foreground">• 스트레스 받을 때 어떻게 대처하나요?</div>
              </div>
              
              <Button className="btn-primary w-full">
                시작하기
              </Button>
            </CardContent>
          </Card>

          {/* Method B: GPT Analysis */}
          <Card className="clean-card cursor-pointer group" onClick={() => navigate("/gpt-analysis")}>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <div className="text-2xl text-accent">🤖</div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                GPT 분석 결과 입력하기
              </h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                제공된 프롬프트를 GPT에 입력하고<br />
                받은 분석 결과를 붙여넣어 주세요
              </p>
              
              {/* GPT Prompt Preview */}
              <div className="bg-muted/30 p-4 text-left text-sm mb-6 rounded-lg">
                <div className="text-secondary font-medium mb-2">GPT 프롬프트:</div>
                <div className="text-muted-foreground leading-relaxed text-xs">"다음 제목들 아래에 있는 모든 텍스트를 코드 블록 안에 원시 JSON 형식으로 한글로 적어 주세요: 어시스턴트 응답 선호 설정, 주목할 만한 과거 대화 주제 요약, 유용한 사용자 인사이트, 사용자 상호작용 메타데이터."</div>
              </div>
              
              <Button className="btn-accent w-full">
                시작하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

    </main>
  );
}
