import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QuestionnaireAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
}

const questions = [
  {
    id: "q1",
    question: "몰입할 때 나는 어떤 행동을 하나요?",
    options: [
      { value: "focused", label: "완전히 집중해서 주변 소음도 들리지 않는다" },
      { value: "methodical", label: "체계적으로 계획을 세우고 단계별로 진행한다" },
      { value: "creative", label: "창의적인 아이디어가 계속 떠올라 실험해본다" },
    ],
    color: "accent"
  },
  {
    id: "q2",
    question: "내가 배우고 싶은 것은?",
    options: [
      { value: "technical", label: "실용적이고 기술적인 스킬" },
      { value: "creative", label: "예술적이고 창작 관련 분야" },
      { value: "interpersonal", label: "인간관계와 소통 능력" },
    ],
    color: "secondary"
  },
  {
    id: "q3",
    question: "스트레스 받을 때 어떻게 대처하나요?",
    options: [
      { value: "analytical", label: "문제를 분석하고 해결책을 찾으려 한다" },
      { value: "social", label: "친구나 가족과 대화를 나눈다" },
      { value: "activity", label: "운동이나 취미활동으로 전환한다" },
    ],
    color: "primary"
  },
  {
    id: "q4",
    question: "새로운 환경에서 나는?",
    options: [
      { value: "observer", label: "관찰하고 파악한 후 행동한다" },
      { value: "active", label: "적극적으로 참여하고 소통한다" },
      { value: "cautious", label: "신중하게 접근하며 적응 시간이 필요하다" },
    ],
    color: "accent"
  },
  {
    id: "q5",
    question: "성취감을 느끼는 순간은?",
    options: [
      { value: "completion", label: "목표를 완수했을 때" },
      { value: "recognition", label: "타인에게 인정받았을 때" },
      { value: "improvement", label: "이전보다 발전했음을 느낄 때" },
    ],
    color: "secondary"
  },
];

export default function Questionnaire() {
  const [, navigate] = useLocation();
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (answers: QuestionnaireAnswers) => {
      const response = await apiRequest("POST", "/api/submit-questionnaire", { answers });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "분석 완료",
        description: "질문지가 성공적으로 제출되었습니다. 계정을 생성해주세요.",
      });
      navigate("/registration?method=questionnaire");
    },
    onError: (error) => {
      toast({
        title: "제출 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all questions are answered
    const allAnswered = questions.every(q => answers[q.id as keyof QuestionnaireAnswers]);
    if (!allAnswered) {
      toast({
        title: "모든 질문에 답해주세요",
        description: "분석을 위해 모든 질문에 답변이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate(answers as QuestionnaireAnswers);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case "accent": return "border-accent";
      case "secondary": return "border-secondary";
      case "primary": return "border-primary";
      default: return "border-accent";
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card className="cyber-card">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-primary text-center mb-8 uppercase">
              &gt; 자기 성찰 질문지
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className={`border-l-4 ${getColorClass(question.color)} pl-4`}>
                  <label className="block text-secondary font-bold mb-3 uppercase text-sm">
                    Q{index + 1}. {question.question}
                  </label>
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start space-x-3 cursor-pointer hover:text-primary transition-colors group"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          value={option.value}
                          onChange={() => handleAnswerChange(question.id, option.value)}
                          className="cyber-radio mt-1"
                        />
                        <span className="text-sm leading-relaxed">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="cyber-button-green w-full py-4 text-lg"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "분석 중..." : "분석 시작 >"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
