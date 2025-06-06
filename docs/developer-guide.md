# Status RPG AI 개발자 가이드

## 프로젝트 구조

```
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 가능한 UI 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── lib/            # 유틸리티 및 설정
│   │   └── hooks/          # 커스텀 React 훅
├── server/                 # Express 백엔드
│   ├── routes.ts           # API 라우트 정의
│   ├── storage.ts          # 데이터베이스 인터페이스
│   ├── bedrock.ts          # AWS Bedrock AI 통합
│   └── utils/              # 서버 유틸리티
├── shared/                 # 공유 타입 및 스키마
│   └── schema.ts           # Drizzle ORM 스키마
└── docs/                   # 프로젝트 문서
```

## 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- PostgreSQL 14+
- AWS 계정 (Bedrock 서비스 활성화)

### 설치 단계
```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일에 실제 값 입력

# 데이터베이스 스키마 적용
npm run db:push

# 개발 서버 시작
npm run dev
```

### 환경 변수
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## 아키텍처 패턴

### Frontend 아키텍처
- **Component-Based**: shadcn/ui 기반 재사용 컴포넌트
- **State Management**: React Query로 서버 상태 관리
- **Form Handling**: React Hook Form + Zod 검증
- **Routing**: Wouter 경량 라우터

### Backend 아키텍처
- **RESTful API**: Express 기반 REST 엔드포인트
- **Database Layer**: Drizzle ORM + PostgreSQL
- **Session Management**: Express Session
- **AI Integration**: AWS Bedrock Claude 3.5 Sonnet

### 데이터 플로우
```
User Action → React Component → React Query → API Route → Storage Layer → Database
                     ↓
User Interface ← State Update ← Cache Update ← Response ← Business Logic ← Data
```

## 데이터베이스 스키마

### 핵심 엔티티
```typescript
// 사용자
users: {
  id: number
  username: string
  nickname: string
  passwordHash: string
}

// 사용자 스탯
user_stats: {
  id: number
  userId: number
  intelligence: number
  creativity: number
  social: number
  physical: number
  emotional: number
  focus: number
  adaptability: number
  totalPoints: number
  level: number
  canLevelUp: boolean
}

// 퀘스트
missions: {
  id: number
  userId: number
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
  targetStats: string[]
  isCompleted: boolean
  completedAt?: Date
  completedAtLevel?: number
}
```

### 관계
- User → UserStats (1:1)
- User → Missions (1:Many)
- User → UserAnalysis (1:Many)
- User → UserProfile (1:1)

## API 설계

### 인증 미들웨어
```typescript
function requireAuth(req: any, res: Response): number | null {
  if (!req.session.userId) {
    res.status(401).json({ message: "Not authenticated" });
    return null;
  }
  return req.session.userId;
}
```

### 표준 응답 형식
```typescript
// 성공 응답
{
  data: any,
  message?: string
}

// 오류 응답
{
  message: string,
  details?: any
}
```

### 주요 엔드포인트

#### 사용자 관리
```typescript
POST /api/register
POST /api/login  
POST /api/logout
GET  /api/user
```

#### 스탯 관리
```typescript
GET  /api/user/stats
POST /api/user/regenerate-analysis
POST /api/user/level-up
```

#### 퀘스트 관리
```typescript
GET    /api/user/missions
POST   /api/user/missions
PATCH  /api/user/missions/:id/complete
DELETE /api/user/missions/:id
POST   /api/user/missions/generate
```

## 컴포넌트 가이드

### 페이지 컴포넌트 구조
```typescript
export default function PageName() {
  // React Query 훅
  const { data, isLoading } = useQuery({ queryKey: [...] });
  
  // 뮤테이션 훅
  const mutation = useMutation({ ... });
  
  // 로딩 상태
  if (isLoading) return <Loading />;
  
  // 메인 렌더링
  return (
    <main>
      <PageHeader />
      <PageContent />
    </main>
  );
}
```

### 폼 컴포넌트 패턴
```typescript
const schema = z.object({
  field: z.string().min(1, "필수 입력")
});

export default function FormComponent() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { field: "" }
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="field"
          render={({ field }) => (
            <FormItem>
              <FormLabel>라벨</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## 스타일링 가이드

### Tailwind CSS 클래스 규칙
```css
/* 컴포넌트별 스타일 */
.clean-card {
  @apply bg-card border border-border rounded-lg;
}

.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.progress-container {
  @apply bg-secondary/20 rounded-full overflow-hidden;
}

.progress-bar {
  @apply bg-gradient-to-r from-primary to-accent transition-all duration-500;
}
```

### 다크모드 지원
```typescript
// ThemeProvider 사용
<div className="bg-white dark:bg-black text-black dark:text-white">
```

## 상태 관리

### React Query 패턴
```typescript
// 데이터 조회
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/endpoint"],
  enabled: !!condition,
  staleTime: 5 * 60 * 1000, // 5분
});

// 데이터 변경
const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await apiRequest("POST", "/api/endpoint", data);
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/related"] });
  }
});
```

### 캐시 무효화 전략
```typescript
// 관련 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });

// 특정 쿼리 제거
queryClient.removeQueries({ queryKey: ["/api/specific"] });

// 즉시 리페치
await queryClient.refetchQueries({ queryKey: ["/api/data"] });
```

## AI 통합

### Bedrock 클라이언트 설정
```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
```

### 프롬프트 엔지니어링
```typescript
const analysisPrompt = `
사용자의 다음 정보를 분석하여 JSON 형식으로 응답해주세요:

현재 프로필:
- 취미: ${profile.hobbies}
- 관심사: ${profile.interests}
...

다음 형식으로 JSON을 생성해주세요:
{
  "summary": "성격 요약",
  "statExplanations": {
    "intelligence": "설명",
    ...
  }
}
`;
```

## 테스팅

### 단위 테스트 예시
```typescript
// utils 함수 테스트
describe('calculateLevel', () => {
  it('should calculate correct level', () => {
    expect(calculateLevel(250)).toBe(2);
    expect(calculateLevel(100)).toBe(1);
  });
});
```

### API 테스트
```typescript
// 엔드포인트 테스트
describe('POST /api/user/missions', () => {
  it('should create new mission', async () => {
    const response = await request(app)
      .post('/api/user/missions')
      .send(missionData)
      .expect(201);
      
    expect(response.body.mission.title).toBe(missionData.title);
  });
});
```

## 성능 최적화

### 프론트엔드 최적화
```typescript
// React.memo로 불필요한 리렌더링 방지
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});

// useMemo로 계산 최적화
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// React Query 스테일 타임 설정
const { data } = useQuery({
  queryKey: ['static-data'],
  staleTime: Infinity, // 정적 데이터는 무한 캐시
});
```

### 백엔드 최적화
```typescript
// 데이터베이스 쿼리 최적화
const userWithStats = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    stats: true,
    profile: true
  }
});

// 응답 압축
app.use(compression());

// 정적 파일 캐싱
app.use(express.static('dist', { maxAge: '1y' }));
```

## 보안 고려사항

### 인증 보안
```typescript
// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24시간
  }
}));
```

### 입력 검증
```typescript
// Zod 스키마로 입력 검증
const createMissionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  targetStats: z.array(z.string()).min(1)
});
```

### SQL 인젝션 방지
```typescript
// Drizzle ORM 사용으로 자동 방지
const user = await db.select().from(users).where(eq(users.id, userId));
```

## 배포 가이드

### 프로덕션 빌드
```bash
# 프론트엔드 빌드
npm run build

# 타입 체크
npm run type-check

# 린트 검사
npm run lint
```

### 환경별 설정
```typescript
// 개발환경
if (process.env.NODE_ENV === 'development') {
  // 개발용 설정
}

// 프로덕션
if (process.env.NODE_ENV === 'production') {
  // 프로덕션용 설정
}
```

### 데이터베이스 마이그레이션
```bash
# 스키마 변경사항 적용
npm run db:push

# 마이그레이션 생성
npm run db:generate

# 마이그레이션 적용
npm run db:migrate
```

## 문제 해결

### 일반적인 이슈

#### React Query 캐시 문제
```typescript
// 강제 리페치
queryClient.invalidateQueries({ queryKey: ['problematic-key'] });

// 캐시 초기화
queryClient.clear();
```

#### TypeScript 타입 오류
```typescript
// 타입 assertion 사용 (최후 수단)
const data = response as ExpectedType;

// 타입 가드 사용 (권장)
function isValidData(data: unknown): data is ExpectedType {
  return typeof data === 'object' && data !== null;
}
```

#### AWS Bedrock 연결 문제
```typescript
// 자격 증명 확인
console.log('AWS Region:', process.env.AWS_REGION);
console.log('AWS Access Key exists:', !!process.env.AWS_ACCESS_KEY_ID);

// 모델 가용성 확인
// AWS 콘솔에서 Bedrock 모델 활성화 상태 점검
```

### 디버깅 도구
- React Developer Tools
- React Query Devtools
- PostgreSQL 로그 모니터링
- AWS CloudWatch 로그

## 코딩 규칙

### 명명 규칙
```typescript
// 컴포넌트: PascalCase
const UserProfile = () => {};

// 함수: camelCase  
const calculateStats = () => {};

// 상수: UPPER_SNAKE_CASE
const MAX_STAT_VALUE = 99;

// 인터페이스: PascalCase with I prefix (선택사항)
interface IUserStats {}
```

### 파일 구조 규칙
```
components/
├── ui/           # shadcn/ui 컴포넌트
├── layout/       # 레이아웃 컴포넌트
└── feature/      # 기능별 컴포넌트

pages/
├── dashboard.tsx
├── quests.tsx
└── ...

lib/
├── utils.ts      # 유틸리티 함수
├── constants.ts  # 상수 정의
└── types.ts      # 타입 정의
```

이 가이드를 따라 일관성 있고 유지보수 가능한 코드를 작성할 수 있습니다.