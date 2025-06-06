import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import statusLogo from "@assets/Status.png";

interface CyberpunkLayoutProps {
  children: ReactNode;
}

export function CyberpunkLayout({ children }: CyberpunkLayoutProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src={statusLogo} 
                alt="Status 로고" 
                className="h-8 w-8 rounded-lg bg-white p-1 shadow-sm"
              />
              <div className="text-2xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors">
                Status
              </div>
            </Link>
            <div className="text-sm text-muted-foreground hidden md:block">당신을 위한 현실의 상태창 서비스</div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.user ? (
              <>
                <span className="text-muted-foreground text-sm hidden md:inline">
                  {user.user.nickname}님
                </span>
                <div className="flex space-x-2">
                  <Link href="/dashboard">
                    <Button className="btn-primary text-sm">
                      대시보드
                    </Button>
                  </Link>
                  <Link href="/missions">
                    <Button variant="outline" className="text-sm">퀘스트</Button>
                  </Link>
                  <Link href="/achievements">
                    <Button variant="outline" className="text-sm">업적</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="text-sm">프로필</Button>
                  </Link>
                </div>
                <Button 
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="btn-primary">
                  로그인
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      {/* Main Content */}
      {children}
      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-muted-foreground text-sm">Status v1.0 - 당신읠 위한 현실의 상태창 서비스</div>
          <div className="text-muted-foreground text-xs mt-2">AI 기반 개인 성장 지원 플랫폼</div>
          <div className="text-secondary text-xs mt-4">
            현재 단계: 사용자 입력 및 AI 분석 시스템 완료
          </div>
        </div>
      </footer>
    </div>
  );
}
