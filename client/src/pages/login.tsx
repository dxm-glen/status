import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LoginData {
  username: string;
  password: string;
}

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: ""
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "로그인 성공",
        description: "대시보드로 이동합니다.",
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "로그인 실패",
        description: error.message || "아이디 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: "입력 오류",
        description: "아이디와 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="clean-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                로그인
              </h1>
              <p className="text-muted-foreground text-sm">
                기존 계정으로 로그인하여 대시보드에 접속하세요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>

              <Button
                type="submit"
                className="btn-primary w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-muted-foreground text-sm">
                계정이 없으신가요?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary hover:underline"
                >
                  회원가입
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}