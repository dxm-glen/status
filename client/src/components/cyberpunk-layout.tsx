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
      <header className="border-b-2 border-secondary bg-card/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="text-2xl font-bold text-primary neon-glow animate-glow cursor-pointer">
                &gt; STATUS_
              </div>
            </Link>
            <div className="text-sm text-accent animate-matrix">
              [RPG CHARACTER GROWTH SYSTEM]
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.user ? (
              <>
                <span className="text-secondary text-sm">
                  Welcome, {user.user.nickname}
                </span>
                <Link href="/dashboard">
                  <Button className="cyber-button-cyan text-sm">
                    DASHBOARD
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout}
                  className="cyber-button text-sm"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "LOGGING OUT..." : "LOGOUT"}
                </Button>
              </>
            ) : (
              <Link href="/">
                <Button className="cyber-button-cyan">
                  LOGIN
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="border-t-2 border-secondary bg-card/20 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-accent text-sm">
            &gt; STATUS v1.0 - RPG CHARACTER GROWTH SYSTEM
          </div>
          <div className="text-secondary text-xs mt-2">
            POWERED BY AI • DESIGNED FOR GROWTH
          </div>
          <div className="text-accent text-xs mt-4">
            현재 단계: Phase 1 완료 - 사용자 입력 및 저장 시스템
          </div>
        </div>
      </footer>
    </div>
  );
}
