import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Save, X, ArrowRight } from "lucide-react";

const profileSchema = z.object({
  gender: z.string().optional(),
  ageGroup: z.string().optional(),
  affiliation: z.string().optional(),
  interests: z.string().optional(),
  additionalInfo: z.string().optional(),
  desiredSelf: z.string().min(10, "원하는 모습을 최소 10자 이상 작성해주세요.").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  const profile = profileData?.profile;
  const hasProfile = profile && (profile.gender || profile.ageGroup || profile.affiliation || profile.interests || profile.additionalInfo || profile.desiredSelf);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: "",
      ageGroup: "",
      affiliation: "",
      interests: "",
      additionalInfo: "",
      desiredSelf: "",
    },
  });

  // Update form values when data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        gender: profile.gender || "",
        ageGroup: profile.ageGroup || "",
        affiliation: profile.affiliation || "",
        interests: profile.interests || "",
        additionalInfo: profile.additionalInfo || "",
        desiredSelf: profile.desiredSelf || "",
      });
    }
  }, [profile, form]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("POST", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setIsEditing(false);
      toast({
        title: "저장 완료",
        description: "프로필이 성공적으로 저장되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "저장 실패",
        description: error.message || "프로필 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    saveProfileMutation.mutate(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      form.reset({
        gender: profile.gender || "",
        ageGroup: profile.ageGroup || "",
        affiliation: profile.affiliation || "",
        interests: profile.interests || "",
        additionalInfo: profile.additionalInfo || "",
        desiredSelf: profile.desiredSelf || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">프로필 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show editing form if no profile exists or if in editing mode
  const showEditForm = !hasProfile || isEditing;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                프로필 설정
              </h1>
              <p className="text-muted-foreground">
                기본 정보와 목표를 입력하면, AI가 더 개인화된 미션을 제안합니다.
              </p>
            </div>
            {hasProfile && !isEditing && (
              <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                수정
              </Button>
            )}
          </div>
        </div>

        {!showEditForm ? (
          // Read-only view
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">성별</label>
                    <p className="mt-1">{profile?.gender || "미설정"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">연령대</label>
                    <p className="mt-1">{profile?.ageGroup || "미설정"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">학교/직장/팀 등 소속</label>
                  <p className="mt-1">{profile?.affiliation || "미설정"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">관심 영역</label>
                  <p className="mt-1">{profile?.interests || "미설정"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">추가 정보</label>
                  <p className="mt-1 whitespace-pre-wrap">{profile?.additionalInfo || "미설정"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>원하는 모습</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="whitespace-pre-wrap">{profile?.desiredSelf || "미설정"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation to Missions */}
            {hasProfile && (
              <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">🎯 개인화된 미션 생성</h3>
                      <p className="text-muted-foreground text-sm">
                        작성하신 프로필을 바탕으로 AI가 맞춤형 성장 미션을 제안합니다.
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate("/missions")}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                      미션 확인하기
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Edit form
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>
                    기본 정보를 입력하여 더 개인화된 미션을 받아보세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>성별</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="성별을 선택해주세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="남">남</SelectItem>
                              <SelectItem value="여">여</SelectItem>
                              <SelectItem value="기타">기타</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>연령대</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="연령대를 선택해주세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="10대">10대</SelectItem>
                              <SelectItem value="20대">20대</SelectItem>
                              <SelectItem value="30대">30대</SelectItem>
                              <SelectItem value="40대">40대</SelectItem>
                              <SelectItem value="50대">50대</SelectItem>
                              <SelectItem value="60대 이상">60대 이상</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="affiliation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>학교/직장/팀 등 소속</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: 서울대학교 컴퓨터공학부, 삼성전자 개발팀, 프리랜서 디자이너"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          현재 소속하고 있는 기관이나 직장을 입력해주세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>관심 영역</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="예: 프로그래밍, 디자인, 운동, 요리, 독서, 여행"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          관심 있는 분야나 취미를 쉼표로 구분하여 입력해주세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>추가 정보</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="예: 매일 아침 일찍 일어나려고 하지만 잘 안 되고, 새로운 기술을 배우는 것을 좋아하지만 집중력이 부족한 편입니다. 사람들과 대화하는 것은 좋아하지만 새로운 환경에 적응하는 데 시간이 걸립니다..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          성격, 습관, 현재 상황 등 추가로 알려주고 싶은 정보를 자유롭게 작성해주세요.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>원하는 모습</CardTitle>
                  <CardDescription>
                    앞으로 어떤 사람이 되고 싶은가요? 목표, 개선하고 싶은 점, 꿈 등을 작성해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="desiredSelf"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="예: 규칙적인 생활 습관을 가지고, 새로운 기술을 꾸준히 학습하여 전문성을 키우고 싶습니다. 더 적극적으로 소통하고, 변화에 유연하게 대응할 수 있는 사람이 되고 싶습니다..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          구체적인 목표와 개선하고 싶은 부분을 작성하면 더 맞춤형 미션을 받을 수 있습니다.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    취소
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saveProfileMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saveProfileMutation.isPending ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        <div className="mt-8 p-4 bg-muted/50 border rounded-lg">
          <h3 className="font-semibold mb-2">💡 프로필 작성 팁</h3>
          <ul className="text-muted-foreground text-sm space-y-1">
            <li>• 기본 정보: 성별, 연령대, 소속 등을 선택하여 맞춤형 추천을 받으세요</li>
            <li>• 관심 영역: 좋아하는 분야를 입력하면 관련 미션을 더 많이 받을 수 있습니다</li>
            <li>• 추가 정보: 현재 상황과 성격을 솔직하게 적어주세요</li>
            <li>• 원하는 모습: 구체적인 목표와 개선하고 싶은 점을 명시해주세요</li>
            <li>• AI가 이 정보를 바탕으로 개인화된 성장 미션을 제안합니다</li>
            <li>• 언제든지 수정할 수 있으니 부담 없이 작성해보세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}