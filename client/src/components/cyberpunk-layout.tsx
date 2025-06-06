import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CyberpunkLayoutProps {
  children: ReactNode;
}

export function CyberpunkLayout({ children }: CyberpunkLayoutProps) {
  const [location] = useLocation();
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
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
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
            <Link href="/">
              <div className="text-2xl font-semibold text-foreground cursor-pointer hover:text-primary transition-colors">
                Status
              </div>
            </Link>
            <div className="text-sm text-muted-foreground hidden md:block">
              RPG 캐릭터 성장 시스템
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.user ? (
              <>
                <span className="text-muted-foreground text-sm hidden md:inline">
                  {user.user.nickname}님
                </span>
                <Link href="/dashboard">
                  <Button className="btn-primary text-sm">
                    대시보드
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
                </Button>
              </>
            ) : (
              <Link href="/">
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
          <div className="text-muted-foreground text-sm">
            Status v1.0 - RPG 캐릭터 성장 시스템
          </div>
          <div className="text-muted-foreground text-xs mt-2">
            AI 기반 개인 성장 플랫폼
          </div>
          <div className="text-secondary text-xs mt-4">
            현재 단계: 사용자 입력 및 AI 분석 시스템 완료
          </div>
        </div>
      </footer>
    </div>
  );
}
