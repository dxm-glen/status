import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface RegistrationData {
  username: string;
  nickname: string;
  password: string;
}

export default function Registration() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<RegistrationData>({
    username: "",
    nickname: "",
    password: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get method from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const method = urlParams.get("method");

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await apiRequest("POST", "/api/register-with-analysis", data);
      return response.json();
    },
    onSuccess: async (data) => {
      // Now login with the created credentials
      try {
        const loginResponse = await apiRequest("POST", "/api/login", {
          username: formData.username,
          password: formData.password,
        });
        const loginData = await loginResponse.json();
        
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        toast({
          title: "계정 생성 완료",
          description: `환영합니다, ${loginData.user.nickname}님! 대시보드로 이동합니다.`,
        });
        
        navigate("/dashboard");
      } catch (error) {
        toast({
          title: "로그인 실패", 
          description: "계정은 생성되었지만 자동 로그인에 실패했습니다.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "계정 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim()) {
      toast({
        title: "ID 입력 필요",
        description: "사용자 ID를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.nickname.trim()) {
      toast({
        title: "닉네임 입력 필요",
        description: "닉네임을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (!/^\d{4}$/.test(formData.password)) {
      toast({
        title: "비밀번호 형식 오류",
        description: "4자리 숫자로 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="cyber-card">
          <CardContent className="p-8">
{registerMutation.isPending ? (
              // AI 분석 처리 중 화면
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-primary mb-8 uppercase">
                  &gt; AI 분석 진행 중
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="flex space-x-1">
                        <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="h-3 w-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                    
                    <p className="text-primary font-medium text-lg mb-2">
                      당신에 대한 분석을 정리하는 중...
                    </p>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      AI가 당신의 답변을 바탕으로 개인화된 스탯을 계산하고 있습니다.<br/>
                      잠시만 기다려주세요.
                    </p>
                  </div>
                  
                  <div className="text-accent text-xs">
                    &gt; 처리 시간: 약 30-60초
                  </div>
                </div>
              </div>
            ) : (
              // 일반 계정 생성 폼
              <>
                <h2 className="text-2xl font-bold text-primary text-center mb-8 uppercase">
                  &gt; 계정 생성
                </h2>
                
                {method && (
                  <div className="bg-background/50 p-4 mb-6 border border-accent/30 text-center">
                    <p className="text-accent text-sm">
                      {method === "questionnaire" 
                        ? "✅ 질문지 분석이 완료되었습니다."
                        : "✅ GPT 분석 결과가 저장되었습니다."
                      }
                    </p>
                    <p className="text-secondary text-xs mt-1">
                      계정을 생성하여 분석을 시작하세요.
                    </p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="block text-secondary font-bold mb-2 uppercase text-sm">
                      사용자 ID
                    </Label>
                    <Input 
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="terminal-input"
                      placeholder="고유한 ID를 입력하세요"
                    />
                  </div>

                  <div>
                    <Label className="block text-secondary font-bold mb-2 uppercase text-sm">
                      닉네임
                    </Label>
                    <Input 
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                      className="terminal-input"
                      placeholder="게임에서 사용할 닉네임"
                    />
                  </div>

                  <div>
                    <Label className="block text-secondary font-bold mb-2 uppercase text-sm">
                      4자리 숫자 비밀번호
                    </Label>
                    <Input 
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="terminal-input text-center text-2xl tracking-widest"
                      placeholder="••••"
                      maxLength={4}
                      pattern="[0-9]{4}"
                    />
                    <p className="text-xs text-accent mt-1">
                      &gt; 숫자 4자리로 입력해주세요 (예: 1234)
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-primary w-full py-4 text-lg"
                  >
                    계정 생성 및 분석 시작
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
