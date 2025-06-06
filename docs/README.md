# Status RPG AI v1.0

개인 성장을 위한 RPG 스타일 캐릭터 개발 애플리케이션

## 📋 목차
- [개요](#개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [설치 및 실행](#설치-및-실행)
- [사용법](#사용법)
- [API 문서](#api-문서)
- [개발 가이드](#개발-가이드)
- [버전 정보](#버전-정보)

## 개요

Status RPG AI는 개인의 성장과 발전을 RPG 게임처럼 시각화하고 추적할 수 있는 웹 애플리케이션입니다. 사용자는 7가지 핵심 능력치(지능, 창의성, 사회성, 체력, 감성, 집중력, 적응력)를 기반으로 한 캐릭터를 생성하고, 일상의 목표와 도전을 "퀘스트"로 설정하여 지속적인 자기계발을 도모할 수 있습니다.

## 주요 기능

### 🎯 캐릭터 시스템
- 7가지 스탯으로 구성된 개인 능력치 체계
- AI 기반 초기 캐릭터 생성 및 분석
- 동적 스탯 성장 (99 초과 가능)
- 수동 레벨업 시스템

### 📝 퀘스트 관리
- 개인 목표를 퀘스트로 변환
- 난이도별 차등 보상 시스템
- AI 기반 맞춤형 퀘스트 자동 생성
- 완료 추적 및 진행률 관리

### 🤖 AI 분석
- AWS Bedrock Claude 3.5 Sonnet 기반 성격 분석
- 프로필과 완료 퀘스트를 종합한 재분석 기능
- 개인화된 성장 인사이트 제공

### 🏆 업적 시스템
- 레벨별 완료 퀘스트 아카이브
- 성장 과정 시각화
- 개인 발전 이력 추적

### 👤 프로필 관리
- 상세한 개인 정보 및 선호도 설정
- AI 분석 정확도 향상을 위한 데이터 제공

## 기술 스택

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
- TypeScript
- ESLint + Prettier

## 설치 및 실행

### 요구사항
- Node.js 18+
- PostgreSQL 14+
- AWS 계정 (Bedrock 서비스)

### 설치 단계

1. **저장소 클론**
```bash
git clone <repository-url>
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

`.env` 파일에 다음 변수들을 설정:
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

## 사용법

### 1. 계정 생성
- 사용자명, 닉네임, 비밀번호로 회원가입
- 자동 로그인 후 캐릭터 생성 단계로 진행

### 2. 캐릭터 생성
**설문조사 방식:**
- 5개 질문에 답변
- AI가 답변을 분석하여 7가지 스탯 생성

**GPT 분석 방식:**
- 다른 AI 서비스의 분석 결과 붙여넣기
- 더 정확한 개인화 분석 가능

### 3. 퀘스트 관리
**수동 생성:**
- 제목, 설명, 난이도, 대상 스탯 설정
- 개인 목표를 구체적인 퀘스트로 변환

**AI 자동 생성:**
- 현재 스탯과 프로필 기반 맞춤형 퀘스트 4개 제안
- 성장이 필요한 영역에 집중된 퀘스트

### 4. 성장 추적
- 퀘스트 완료 시 자동 스탯 증가
- 레벨업 조건 달성 시 수동 승급
- AI 분석 재생성으로 성장 과정 확인

## API 문서

### 인증 엔드포인트
```
POST /api/register    # 회원가입
POST /api/login       # 로그인
POST /api/logout      # 로그아웃
```

### 사용자 데이터
```
GET  /api/user                        # 사용자 정보
GET  /api/user/stats                  # 스탯 정보
POST /api/user/regenerate-analysis    # AI 분석 재생성
POST /api/user/level-up               # 레벨업
```

### 퀘스트 관리
```
GET    /api/user/missions              # 퀘스트 목록
POST   /api/user/missions              # 퀘스트 생성
PATCH  /api/user/missions/:id/complete # 퀘스트 완료
DELETE /api/user/missions/:id          # 퀘스트 삭제
POST   /api/user/missions/generate     # AI 퀘스트 생성
```

### 프로필
```
GET  /api/user/profile    # 프로필 조회
POST /api/user/profile    # 프로필 생성/수정
```

## 개발 가이드

상세한 개발 정보는 다음 문서를 참조하세요:

- **[개발자 가이드](developer-guide.md)** - 아키텍처, API 설계, 코딩 규칙
- **[사용자 매뉴얼](user-manual.md)** - 기능별 사용법 및 팁
- **[릴리즈 노트](v1.0-release-notes.md)** - 버전별 변경사항

### 주요 스크립트
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run type-check   # TypeScript 타입 검사
npm run lint         # ESLint 검사
npm run db:push      # 데이터베이스 스키마 적용
npm run db:generate  # 마이그레이션 생성
```

### 프로젝트 구조
```
├── client/           # React 프론트엔드
│   ├── src/components/  # UI 컴포넌트
│   ├── src/pages/       # 페이지 컴포넌트
│   └── src/lib/         # 유틸리티
├── server/           # Express 백엔드
│   ├── routes.ts        # API 라우트
│   ├── storage.ts       # 데이터베이스 레이어
│   └── bedrock.ts       # AI 통합
├── shared/           # 공유 타입/스키마
└── docs/             # 프로젝트 문서
```

## 버전 정보

### v1.0.0 (2025-06-06)
- 초기 정식 릴리즈
- 핵심 캐릭터 시스템 구현
- AI 기반 분석 및 퀘스트 생성
- 업적 시스템 및 레벨링
- 완전한 사용자 인터페이스

### 향후 계획
- v1.1: AI 분석 재생성 제한 기능
- v1.2: 소셜 기능 (친구, 랭킹)
- v1.3: 모바일 앱 지원
- v2.0: 고급 분석 및 추천 시스템

## 라이선스

MIT License - 자세한 내용은 LICENSE 파일을 참조하세요.

## 기여하기

프로젝트 기여를 환영합니다! 다음 절차를 따라주세요:

1. Fork 저장소
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**Status RPG AI** - 당신의 성장 여정을 게임처럼 즐겁게!