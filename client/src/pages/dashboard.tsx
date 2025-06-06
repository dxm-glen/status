import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [, navigate] = useLocation();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // If not logged in, redirect to home
  if (!isLoading && !user?.user) {
    navigate("/");
    return null;
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-accent animate-matrix">
            로딩 중... ████████████████
          </div>
        </div>
      </main>
    );
  }

  // Placeholder stats for Phase 1 - will be replaced with actual stats in Phase 2
  const mockStats = {
    level: 1,
    totalPoints: 0,
    progressPercentage: 0,
    intelligence: 0,
    creativity: 0,
    social: 0,
    physical: 0,
    emotional: 0,
    focus: 0,
    adaptability: 0,
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="cyber-card">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-primary text-center mb-8 uppercase">
              &gt; {user.user.nickname}의 캐릭터 상태창
            </h2>
            
            {/* Character Level Display */}
            <div className="text-center mb-8">
              <div className="inline-block bg-background border-2 border-accent p-4">
                <div className="text-accent text-sm uppercase">현재 레벨</div>
                <div className="text-3xl font-bold text-foreground">Lv.{mockStats.level}</div>
                <div className="text-secondary text-sm">성장 준비자</div>
              </div>
            </div>

            {/* Phase 1 Notice */}
            <div className="bg-card/30 border border-primary p-6 mb-8 text-center">
              <h3 className="text-primary font-bold mb-2 uppercase">
                🚀 Phase 1 완료!
              </h3>
              <p className="text-foreground text-sm mb-4">
                계정이 생성되고 기초 데이터가 저장되었습니다.<br />
                다음 단계에서 AI 분석을 통해 당신의 스탯이 생성됩니다.
              </p>
              <div className="text-accent text-xs">
                &gt; 현재 상태: 분석 대기 중<br />
                &gt; 다음 단계: Bedrock AI 분석 및 스탯 생성
              </div>
            </div>

            {/* Placeholder Stats Display */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-secondary uppercase">총 성장 점수</span>
                <span className="text-accent">{mockStats.totalPoints} / 1000</span>
              </div>
              <div className="progress-container h-4">
                <div className="stat-bar h-full" style={{ width: `${mockStats.progressPercentage}%` }}></div>
              </div>
            </div>

            {/* 7 Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[
                { name: "🧠 지능 (INT)", value: mockStats.intelligence, color: "accent" },
                { name: "🎨 창의성 (CRT)", value: mockStats.creativity, color: "primary" },
                { name: "👥 사회성 (SOC)", value: mockStats.social, color: "secondary" },
                { name: "💪 체력 (PHY)", value: mockStats.physical, color: "accent" },
                { name: "❤️ 감성 (EMO)", value: mockStats.emotional, color: "primary" },
                { name: "🎯 집중력 (FOC)", value: mockStats.focus, color: "secondary" },
              ].map((stat, index) => (
                <div key={index} className={`bg-background/50 p-4 border border-${stat.color}`}>
                  <div className="flex justify-between mb-2">
                    <span className={`text-${stat.color} uppercase text-sm font-bold`}>
                      {stat.name}
                    </span>
                    <span className="text-foreground">{stat.value}</span>
                  </div>
                  <div className="progress-container h-2">
                    <div 
                      className={`bg-${stat.color} h-full`} 
                      style={{ width: `${stat.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {/* Adaptability - Full width */}
              <div className="bg-background/50 p-4 border border-accent col-span-1 md:col-span-2">
                <div className="flex justify-between mb-2">
                  <span className="text-accent uppercase text-sm font-bold">
                    🔄 적응력 (ADP)
                  </span>
                  <span className="text-foreground">{mockStats.adaptability}</span>
                </div>
                <div className="progress-container h-2">
                  <div 
                    className="bg-accent h-full" 
                    style={{ width: `${mockStats.adaptability}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="text-center">
              <div className="bg-background/30 border border-secondary p-4 mb-4">
                <p className="text-secondary text-sm">
                  📋 다음 단계 개발 예정:
                </p>
                <div className="text-accent text-xs mt-2 space-y-1">
                  <div>&gt; Phase 2: Bedrock AI 분석 및 스탯 생성</div>
                  <div>&gt; Phase 3: 상태창 시각화 개선</div>
                  <div>&gt; Phase 4: 일일 미션 시스템</div>
                  <div>&gt; Phase 5: 일기 작성 및 분석</div>
                </div>
              </div>
              
              <Button 
                className="cyber-button-green px-8 py-3"
                onClick={() => navigate("/")}
              >
                홈으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
