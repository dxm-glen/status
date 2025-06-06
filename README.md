# Status RPG AI

개인 성장을 위한 RPG 스타일 캐릭터 개발 애플리케이션

![Status RPG AI](attached_assets/Status.png)

## 🌟 개요

Status RPG AI는 일상의 목표와 도전을 RPG 게임의 퀘스트처럼 관리하고, AI 분석을 통해 7가지 핵심 능력치를 기반으로 한 개인 캐릭터를 성장시킬 수 있는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🎯 캐릭터 시스템
- **7가지 스탯 체계**: 지능, 창의성, 사회성, 체력, 감성, 집중력, 적응력
- **동적 스탯 성장**: 99를 초과하여 계속 성장 가능
- **수동 레벨업**: 총 스탯 포인트 ÷ 100 = 레벨
- **실시간 진행률**: 현재 값에 따라 동적 조정되는 프로그레스 바

### 🤖 AI 기반 분석
- **초기 캐릭터 생성**: 설문조사 또는 GPT 분석 결과 기반
- **AI 분석 재생성**: 최신 프로필과 완료된 퀘스트 정보로 새로운 분석 생성
- **개인화된 인사이트**: 각 스탯별 상세한 설명과 성장 근거 제공
- **AWS Bedrock 통합**: Claude 3.5 Sonnet 모델 활용

### 📝 퀘스트 시스템
- **수동/자동 생성**: 직접 생성하거나 AI가 맞춤형 퀘스트 제안
- **난이도 체계**: 쉬움(+1~2), 보통(+2~3), 어려움(+3~5) 스탯 증가
- **타겟 스탯**: 퀘스트별 성장 대상 스탯 지정
- **완료 추적**: 완료일시, 완료 레벨 기록

### 🏆 업적 시스템
- **레벨별 그룹화**: 완료된 퀘스트를 레벨별로 분류
- **성장 이력**: 개인 발전 과정 시각화
- **상세 정보**: 난이도, 소요시간, 대상 스탯 표시

### 👤 프로필 관리
- **개인 정보**: 취미, 관심사, 목표, 선호 활동
- **학습 스타일**: 개인화된 퀘스트 생성을 위한 정보
- **성격 유형**: AI 분석 개선을 위한 추가 데이터

## 🛠 기술 스택

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Query (TanStack Query)
- Wouter Router
- React Hook Form + Zod

### Backend
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Express Session
- AWS Bedrock AI

### DevOps
- Vite Build Tool
- PM2 Process Manager
- Nginx (배포 시)

## 🚀 빠른 시작

### 요구사항
- Node.js 18+
- PostgreSQL 14+
- AWS 계정 (Bedrock 서비스)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/your-username/status-rpg-ai.git
cd status-rpg-ai
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.example .env
```

`.env` 파일에 다음 값들을 설정:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

4. **데이터베이스 설정**
```bash
npm run db:push
```

5. **개발 서버 시작**
```bash
npm run dev
```

애플리케이션이 `http://localhost:5000`에서 실행됩니다.

## 📚 문서

- **[사용자 매뉴얼](docs/user-manual.md)** - 기능별 사용법 및 팁
- **[개발자 가이드](docs/developer-guide.md)** - 아키텍처, API 설계, 코딩 규칙  
- **[EC2 배포 가이드](docs/ec2-deployment-guide.md)** - Amazon EC2 환경 배포 방법
- **[릴리즈 노트](docs/v1.0-release-notes.md)** - v1.0 변경사항 및 기능

## 🎮 사용법

### 1. 캐릭터 생성
- 회원가입 후 설문조사 또는 GPT 분석 결과로 캐릭터 생성
- 7가지 스탯과 개인화된 AI 분석 제공

### 2. 퀘스트 관리
- 개인 목표를 퀘스트로 설정
- AI가 현재 스탯에 맞는 맞춤형 퀘스트 추천
- 완료 시 해당 스탯 자동 증가

### 3. 성장 추적
- 실시간 스탯 변화 확인
- 레벨업 조건 달성 시 수동 승급
- 완료된 퀘스트는 업적으로 기록

## 📊 스탯 가이드

| 스탯 | 설명 | 관련 활동 |
|------|------|-----------|
| 🧠 지능 | 논리적 사고, 문제 해결, 학습 능력 | 독서, 학습, 분석적 사고 |
| 🎨 창의성 | 혁신적 사고, 예술적 표현, 아이디어 생성 | 예술 활동, 창작, 브레인스토밍 |
| 👥 사회성 | 대인관계, 소통 능력, 팀워크 | 교류, 협업, 네트워킹 |
| 💪 체력 | 신체 건강, 지구력, 활력 | 운동, 신체 활동, 건강 관리 |
| ❤️ 감성 | 감정 인식, 공감 능력, 정서 조절 | 명상, 감정 표현, 자기 성찰 |
| 🎯 집중력 | 주의력, 지속성, 몰입도 | 집중 훈련, 장시간 작업 |
| 🔄 적응력 | 변화 수용, 유연성, 새로운 환경 적응 | 새로운 경험, 환경 변화 |

## 🔧 개발 스크립트

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run type-check   # TypeScript 타입 검사
npm run lint         # ESLint 검사
npm run db:push      # 데이터베이스 스키마 적용
npm run db:generate  # 마이그레이션 생성
```

## 🔐 보안

- 세션 기반 인증
- 사용자별 데이터 격리
- 환경 변수로 민감 정보 관리
- SQL 인젝션 방지 (Drizzle ORM)

## 🚀 배포

상세한 배포 가이드는 [EC2 배포 가이드](docs/ec2-deployment-guide.md)를 참조하세요.

### 프로덕션 환경
- PM2를 이용한 프로세스 관리
- Nginx 리버스 프록시
- SSL/TLS 인증서 (Let's Encrypt)
- PostgreSQL 데이터베이스

## 🤝 기여하기

1. Fork 저장소
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 [GitHub Issues](https://github.com/your-username/status-rpg-ai/issues)를 통해 문의해주세요.

## 🗺 로드맵

### v1.1
- AI 분석 재생성 제한 기능
- 퀘스트 템플릿 시스템
- 사용자 피드백 수집

### v1.2  
- 소셜 기능 (친구, 랭킹)
- 팀 퀘스트 시스템
- 업적 시스템 확장

### v2.0
- 모바일 앱 지원
- 고급 AI 분석 및 추천
- 다국어 지원

---

**Status RPG AI** - 당신의 성장 여정을 게임처럼 즐겁게!