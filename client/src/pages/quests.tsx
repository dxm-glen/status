import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatStatIncreases, DIFFICULTY_COLORS, DIFFICULTY_LABELS, STAT_NAMES } from "@/lib/constants";
import { CheckCircle, Clock, Plus, Sparkles, Trophy, Trash2, User, ArrowRight } from "lucide-react";

interface Mission {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  targetStats: string[];
  isCompleted: boolean;
  isAiGenerated: boolean;
  createdAt: string;
  completedAt?: string;
}

interface NewMission {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  targetStats: string[];
}

export default function Missions() {
  const [, navigate] = useLocation();
  const [isAddingMission, setIsAddingMission] = useState(false);
  const [newMission, setNewMission] = useState<NewMission>({
    title: "",
    description: "",
    difficulty: "easy",
    estimatedTime: "",
    targetStats: []
  });
  const [completingMissionId, setCompletingMissionId] = useState<number | null>(null);
  const [deletingMissionId, setDeletingMissionId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch missions
  const { data: missionsData, isLoading } = useQuery({
    queryKey: ["/api/user/missions"],
    refetchOnWindowFocus: false,
  });

  // Fetch user stats to get current level
  const { data: statsData } = useQuery({
    queryKey: ["/api/user/stats"],
    refetchOnWindowFocus: false,
  });

  // Fetch user profile
  const { data: profileData } = useQuery({
    queryKey: ["/api/user/profile"],
    refetchOnWindowFocus: false,
  });

  // Generate AI missions
  const generateMissionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/generate-missions");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI 미션 생성 완료",
        description: `${data.missions.length}개의 개인화된 미션이 생성되었습니다.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/missions"] });
    },
    onError: (error: any) => {
      toast({
        title: "미션 생성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add custom mission
  const addMissionMutation = useMutation({
    mutationFn: async (mission: NewMission) => {
      const response = await apiRequest("POST", "/api/user/missions", mission);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "미션 추가 완료",
        description: "새로운 미션이 추가되었습니다.",
      });
      setIsAddingMission(false);
      setNewMission({
        title: "",
        description: "",
        difficulty: "easy",
        estimatedTime: "",
        targetStats: []
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/missions"] });
    },
    onError: (error: any) => {
      toast({
        title: "미션 추가 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete mission
  const completeMissionMutation = useMutation({
    mutationFn: async (missionId: number) => {
      const response = await apiRequest("PATCH", `/api/user/missions/${missionId}/complete`);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Mission completion data:", data);
      console.log("Stat increases:", data.statIncrease);
      
      const increases = formatStatIncreases(data.statIncrease || {});
      console.log("Final increases string:", increases);
      
      toast({
        title: "퀘스트 완료!",
        description: `축하합니다! ${increases} 증가했습니다.`,
      });
      setCompletingMissionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/user/missions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "퀘스트 완료 실패",
        description: error.message,
        variant: "destructive",
      });
      setCompletingMissionId(null);
    },
  });

  // Delete mission
  const deleteMissionMutation = useMutation({
    mutationFn: async (missionId: number) => {
      const response = await apiRequest("DELETE", `/api/user/missions/${missionId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "미션 삭제 완료",
        description: "미션이 삭제되었습니다.",
      });
      setDeletingMissionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/user/missions"] });
    },
    onError: (error: any) => {
      toast({
        title: "미션 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
      setDeletingMissionId(null);
    },
  });

  const missions: Mission[] = missionsData?.missions || [];
  const activeMissions = missions.filter(m => !m.isCompleted);
  const allCompletedMissions = missions.filter(m => m.isCompleted);
  
  // Get current user level
  const currentLevel = statsData?.stats?.level || 1;
  
  // Get profile data
  const profile = profileData?.profile;
  const hasDetailedProfile = profile && profile.desiredSelf && profile.interests;
  
  // Get all completed missions for current level (no limit)
  const allCurrentLevelCompletedMissions = allCompletedMissions
    .filter(m => (m as any).completedAtLevel === currentLevel)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  // Show only recent 3 for display, but count all for header
  const currentLevelCompletedMissions = allCurrentLevelCompletedMissions.slice(0, 3);
  
  const maxMissions = 10;
  const currentActiveCount = activeMissions.length;
  const isAtLimit = currentActiveCount >= maxMissions;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatIcon = (stat: string) => {
    return STAT_NAMES[stat as keyof typeof STAT_NAMES]?.split(' ')[0] || "📊";
  };

  const getStatDisplayName = (stat: string) => {
    return STAT_NAMES[stat as keyof typeof STAT_NAMES]?.split(' ')[1] || stat;
  };

  const handleStatToggle = (stat: string) => {
    const currentStats = newMission.targetStats;
    if (currentStats.includes(stat)) {
      setNewMission(prev => ({
        ...prev,
        targetStats: currentStats.filter(s => s !== stat)
      }));
    } else if (currentStats.length < 3) {
      setNewMission(prev => ({
        ...prev,
        targetStats: [...currentStats, stat]
      }));
    }
  };

  const handleCompleteMission = (mission: Mission) => {
    setCompletingMissionId(mission.id);
  };

  const handleDeleteMission = (mission: Mission) => {
    setDeletingMissionId(mission.id);
  };

  const confirmCompleteMission = () => {
    if (completingMissionId) {
      completeMissionMutation.mutate(completingMissionId);
    }
  };

  const confirmDeleteMission = () => {
    if (deletingMissionId) {
      deleteMissionMutation.mutate(deletingMissionId);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-primary">퀘스트 목록</h1>
          <p className="text-muted-foreground">개인 성장을 위한 퀘스트를 수행하고 스탯을 증가시키세요</p>
        </div>

        {/* Mission Counter */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            진행 중인 미션: {currentActiveCount} / {maxMissions}
          </p>
          {isAtLimit && (
            <p className="text-destructive text-xs mt-1">
              최대 미션 개수에 도달했습니다. 기존 미션을 완료해주세요.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => generateMissionsMutation.mutate()}
            disabled={generateMissionsMutation.isPending || isAtLimit}
            className="btn-primary"
          >
            {generateMissionsMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>AI 퀘스트 생성 중...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>{isAtLimit ? "퀘스트 한도 초과" : "AI 퀘스트 생성"}</span>
              </div>
            )}
          </Button>

          <Dialog open={isAddingMission} onOpenChange={setIsAddingMission}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                disabled={isAtLimit}
              >
                <Plus className="h-4 w-4" />
                <span>{isAtLimit ? "퀘스트 한도 초과" : "직접 추가"}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>새 퀘스트 추가</DialogTitle>
                <DialogDescription>
                  원하는 퀘스트를 직접 만들어보세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>퀘스트 제목</Label>
                  <Input
                    value={newMission.title}
                    onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="퀘스트 제목을 입력하세요"
                  />
                </div>
                <div>
                  <Label>퀘스트 설명</Label>
                  <Textarea
                    value={newMission.description}
                    onChange={(e) => setNewMission(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="구체적인 퀘스트 내용을 입력하세요"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>난이도</Label>
                    <Select
                      value={newMission.difficulty}
                      onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                        setNewMission(prev => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">쉬움</SelectItem>
                        <SelectItem value="medium">보통</SelectItem>
                        <SelectItem value="hard">어려움</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>예상 시간</Label>
                    <Input
                      value={newMission.estimatedTime}
                      onChange={(e) => setNewMission(prev => ({ ...prev, estimatedTime: e.target.value }))}
                      placeholder="예: 30분"
                    />
                  </div>
                </div>
                <div>
                  <Label>목표 스탯 (1-3개 선택)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      { id: 'intelligence', icon: '🧠', name: '지능' },
                      { id: 'creativity', icon: '🎨', name: '창의성' },
                      { id: 'social', icon: '👥', name: '사회성' },
                      { id: 'physical', icon: '💪', name: '체력' },
                      { id: 'emotional', icon: '❤️', name: '감성' },
                      { id: 'focus', icon: '🎯', name: '집중력' },
                      { id: 'adaptability', icon: '🔄', name: '적응력' }
                    ].map((stat) => (
                      <div key={stat.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={stat.id}
                          checked={newMission.targetStats.includes(stat.id)}
                          onChange={() => handleStatToggle(stat.id)}
                          disabled={!newMission.targetStats.includes(stat.id) && newMission.targetStats.length >= 3}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={stat.id} className="text-sm font-medium flex items-center space-x-1 cursor-pointer">
                          <span>{stat.icon}</span>
                          <span>{stat.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {newMission.targetStats.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">최소 1개의 스탯을 선택해주세요</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => addMissionMutation.mutate(newMission)}
                  disabled={addMissionMutation.isPending || !newMission.title || !newMission.description || newMission.targetStats.length === 0}
                  className="btn-primary"
                >
                  {addMissionMutation.isPending ? "추가 중..." : "퀘스트 추가"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Enhancement Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">🎯 더 개인화된 퀘스트 받기</h3>
                  <p className="text-muted-foreground text-sm">
                    {hasDetailedProfile 
                      ? "프로필을 업데이트하여 더욱 맞춤형 퀘스트를 받아보세요"
                      : "프로필에 상세 정보를 추가하면 AI가 더 개인화된 퀘스트를 생성합니다"
                    }
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {hasDetailedProfile ? "프로필 업데이트" : "프로필 상세 추가"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Missions */}
        {activeMissions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-foreground">진행 중인 퀘스트</h2>
            <div className="grid gap-4">
              {activeMissions.map((mission) => (
                <Card key={mission.id} className="clean-card hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h3 className="font-semibold text-foreground">{mission.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getDifficultyColor(mission.difficulty)}>
                              {mission.difficulty === 'easy' ? '쉬움' : mission.difficulty === 'medium' ? '보통' : '어려움'}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {mission.estimatedTime}
                            </span>
                            {mission.isAiGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI 생성
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* Target Stats Display */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-muted-foreground">연관 스탯:</span>
                          {(Array.isArray(mission.targetStats[0]) ? mission.targetStats[0] : mission.targetStats).map((stat: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                              <span className="mr-1">{getStatIcon(stat)}</span>
                              <span>{getStatDisplayName(stat)}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleCompleteMission(mission)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          완료
                        </Button>
                        <Button
                          onClick={() => handleDeleteMission(mission)}
                          disabled={deletingMissionId === mission.id}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          {deletingMissionId === mission.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {mission.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Missions - Current Level Only */}
        {(currentLevelCompletedMissions.length > 0 || allCompletedMissions.length > 0) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                레벨 {currentLevel}에서 완료된 퀘스트 ({allCurrentLevelCompletedMissions.length})
              </h2>
              {allCurrentLevelCompletedMissions.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/achievements")}
                  className="text-xs px-3 py-1"
                >
                  전체 보기
                </Button>
              )}
            </div>
            <div className="grid gap-4">
              {currentLevelCompletedMissions.map((mission) => (
                <Card key={mission.id} className="clean-card opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h3 className="font-semibold text-foreground line-through">{mission.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              완료
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(mission.completedAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {/* Target Stats Display */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-muted-foreground">연관 스탯:</span>
                          {(Array.isArray(mission.targetStats[0]) ? mission.targetStats[0] : mission.targetStats).map((stat: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 opacity-75">
                              <span className="mr-1">{getStatIcon(stat)}</span>
                              <span>{getStatDisplayName(stat)}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {mission.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {missions.length === 0 && (
          <Card className="clean-card text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="text-6xl">🎯</div>
                <h3 className="text-xl font-semibold text-foreground">퀘스트가 없습니다</h3>
                <p className="text-muted-foreground">
                  AI가 생성한 개인화된 퀘스트를 받거나 직접 퀘스트를 추가해보세요
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Confirmation Dialog */}
        <Dialog open={completingMissionId !== null} onOpenChange={() => setCompletingMissionId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>퀘스트 완료 확인</DialogTitle>
              <DialogDescription>
                이 퀘스트를 통해 당신의 성장을 이뤄낸 것을 확인하겠습니까?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCompletingMissionId(null)}>
                취소
              </Button>
              <Button
                onClick={confirmCompleteMission}
                disabled={completeMissionMutation.isPending}
                className="btn-primary"
              >
                {completeMissionMutation.isPending ? "처리 중..." : "완료 확인"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deletingMissionId !== null} onOpenChange={() => setDeletingMissionId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>퀘스트 삭제 확인</DialogTitle>
              <DialogDescription>
                이 퀘스트를 삭제하시겠습니까? 삭제된 퀘스트는 복구할 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingMissionId(null)}>
                취소
              </Button>
              <Button
                onClick={confirmDeleteMission}
                disabled={deleteMissionMutation.isPending}
                variant="destructive"
              >
                {deleteMissionMutation.isPending ? "삭제 중..." : "삭제"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}