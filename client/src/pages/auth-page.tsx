import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  nickname: string;
  password: string;
}

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginForm, setLoginForm] = useState<LoginData>({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState<RegisterData>({ username: "", nickname: "", password: "" });

  // Check if user is already logged in
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  // Redirect if already logged in
  if (user?.user) {
    navigate("/dashboard");
    return null;
  }

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      navigate("/dashboard");
      toast({
        title: "로그인 성공",
        description: "대시보드로 이동합니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      navigate("/questionnaire");
      toast({
        title: "회원가입 성공",
        description: "설문조사를 시작해주세요.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({
        title: "입력 오류",
        description: "아이디와 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.username || !registerForm.nickname || !registerForm.password) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(registerForm);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[80vh]">
          {/* Left side - Auth forms */}
          <div className="space-y-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                Status RPG AI
              </h1>
              <p className="text-muted-foreground text-lg">
                AI 기반 개인 성장 RPG 시스템에 오신 것을 환영합니다
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>로그인</CardTitle>
                <CardDescription>
                  기존 계정으로 로그인하여 대시보드에 접근하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">아이디</Label>
                    <Input
                      id="login-username"
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="아이디를 입력하세요"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">비밀번호</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="비밀번호를 입력하세요"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "로그인 중..." : "로그인"}
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    계정이 없으신가요?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    홈페이지에서 "질문지 작성하기" 또는 "GPT 분석 결과 입력하기"를 완료한 후 계정을 생성할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Hero section */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">AI가 분석하는 당신의 성장</h2>
              <p className="text-lg text-muted-foreground">
                개인 맞춤형 AI 분석을 통해 7가지 핵심 역량을 발견하고 성장시켜보세요
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="clean-card p-4 text-center">
                <div className="text-2xl mb-2">🧠</div>
                <div className="font-medium text-sm">지능</div>
              </div>
              <div className="clean-card p-4 text-center">
                <div className="text-2xl mb-2">🎨</div>
                <div className="font-medium text-sm">창의성</div>
              </div>
              <div className="clean-card p-4 text-center">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-medium text-sm">사회성</div>
              </div>
              <div className="clean-card p-4 text-center">
                <div className="text-2xl mb-2">💪</div>
                <div className="font-medium text-sm">체력</div>
              </div>
              <div className="clean-card p-4 text-center">
                <div className="text-2xl mb-2">❤️</div>
                <div className="font-medium text-sm">감성</div>
              </div>
              <div className="clean-card p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium text-sm">집중력</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-semibold">주요 기능</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  AI 기반 개인 성향 분석
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  맞춤형 성장 미션 제공
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  실시간 스탯 추적 및 시각화
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  개인 성장 일기 분석
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}