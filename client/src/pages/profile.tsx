import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CyberpunkLayout } from "@/components/cyberpunk-layout";

const profileSchema = z.object({
  currentSelf: z.string().min(10, "현재 모습을 최소 10자 이상 작성해주세요.").optional(),
  desiredSelf: z.string().min(10, "원하는 모습을 최소 10자 이상 작성해주세요.").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      currentSelf: profileData?.profile?.currentSelf || "",
      desiredSelf: profileData?.profile?.desiredSelf || "",
    },
  });

  // Update form values when data loads
  useState(() => {
    if (profileData?.profile) {
      form.reset({
        currentSelf: profileData.profile.currentSelf || "",
        desiredSelf: profileData.profile.desiredSelf || "",
      });
    }
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to save profile");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "프로필 저장 완료",
        description: "프로필 정보가 성공적으로 저장되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
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

  if (isLoading) {
    return (
      <CyberpunkLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-400">프로필 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </CyberpunkLayout>
    );
  }

  return (
    <CyberpunkLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
              프로필 설정
            </h1>
            <p className="text-gray-400">
              현재 모습과 원하는 모습을 입력하면, AI가 더 개인화된 미션을 제안합니다.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="bg-black/40 border-cyan-500/20">
                <CardHeader>
                  <CardTitle className="text-cyan-400">현재 모습</CardTitle>
                  <CardDescription className="text-gray-400">
                    지금의 나는 어떤 사람인가요? 성격, 습관, 현재 상황 등을 자유롭게 작성해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="currentSelf"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="예: 매일 아침 일찍 일어나려고 하지만 잘 안 되고, 새로운 기술을 배우는 것을 좋아하지만 집중력이 부족한 편입니다. 사람들과 대화하는 것은 좋아하지만 새로운 환경에 적응하는 데 시간이 걸립니다..."
                            className="min-h-[120px] bg-black/20 border-cyan-500/30 text-white placeholder:text-gray-500 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          최소 10자 이상 작성해주세요. 솔직한 자기 분석이 더 정확한 AI 분석에 도움됩니다.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="bg-black/40 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-purple-400">원하는 모습</CardTitle>
                  <CardDescription className="text-gray-400">
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
                            className="min-h-[120px] bg-black/20 border-purple-500/30 text-white placeholder:text-gray-500 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-gray-500">
                          구체적인 목표와 개선하고 싶은 부분을 작성하면 더 맞춤형 미션을 받을 수 있습니다.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saveProfileMutation.isPending}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold px-8 py-2"
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </>
                  ) : (
                    "프로필 저장"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="text-blue-400 font-semibold mb-2">💡 프로필 작성 팁</h3>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• 현재 모습: 솔직하게 현재 상황과 성격을 적어주세요</li>
              <li>• 원하는 모습: 구체적인 목표와 개선하고 싶은 점을 명시해주세요</li>
              <li>• AI가 이 정보를 바탕으로 개인화된 성장 미션을 제안합니다</li>
              <li>• 언제든지 수정할 수 있으니 부담 없이 작성해보세요</li>
            </ul>
          </div>
        </div>
      </div>
    </CyberpunkLayout>
  );
}