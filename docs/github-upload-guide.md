# GitHub 업로드 가이드

Status RPG AI 프로젝트를 GitHub에 업로드하는 방법입니다.

## 1. GitHub 저장소 생성

1. GitHub에 로그인
2. 새 저장소 생성 (New repository)
3. 저장소 이름: `status-rpg-ai`
4. 설명: `개인 성장을 위한 RPG 스타일 캐릭터 개발 애플리케이션`
5. Public 또는 Private 선택
6. **Initialize this repository with README 체크하지 않음** (이미 파일이 있으므로)

## 2. 로컬 Git 초기화 및 업로드

프로젝트 루트 디렉토리에서 다음 명령어를 실행하세요:

```bash
# Git 저장소 초기화
git init

# 모든 파일 스테이징
git add .

# 초기 커밋
git commit -m "Initial commit: Status RPG AI v1.0"

# GitHub 저장소를 원격으로 추가 (your-username을 실제 GitHub 사용자명으로 변경)
git remote add origin https://github.com/your-username/status-rpg-ai.git

# 메인 브랜치로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

## 3. 환경 변수 보안 확인

업로드 전 확인사항:
- ✅ `.env` 파일이 `.gitignore`에 포함되어 있음
- ✅ `.env.example` 파일에는 실제 값이 아닌 예시만 포함
- ✅ AWS 키나 데이터베이스 비밀번호가 코드에 하드코딩되지 않음

## 4. 저장소 설정

### 브랜치 보호 규칙 (선택사항)
GitHub 저장소 Settings > Branches에서:
- `main` 브랜치 보호 활성화
- Pull request 필수 설정
- 코드 리뷰 필수 설정

### GitHub Pages 설정 (선택사항)
GitHub 저장소 Settings > Pages에서:
- Source: Deploy from a branch
- Branch: main / docs

## 5. README 및 문서 확인

업로드된 파일들:
- ✅ `README.md` - 프로젝트 메인 설명
- ✅ `LICENSE` - MIT 라이선스
- ✅ `.gitignore` - Git 제외 파일 목록
- ✅ `.env.example` - 환경 변수 예시
- ✅ `CONTRIBUTING.md` - 기여 가이드
- ✅ `docs/` - 상세 문서들

## 6. 추가 Git 명령어

### 파일 수정 후 업데이트
```bash
git add .
git commit -m "기능 추가: 설명"
git push
```

### 브랜치 작업
```bash
# 새 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 브랜치 푸시
git push -u origin feature/new-feature
```

### 협업자와 동기화
```bash
# 최신 변경사항 가져오기
git pull origin main

# 충돌 해결 후
git add .
git commit -m "Merge conflicts resolved"
git push
```

## 7. GitHub Actions (CI/CD) 설정

`.github/workflows/ci.yml` 파일 생성 (선택사항):

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Type check
      run: npm run type-check
    
    - name: Lint
      run: npm run lint
    
    - name: Build
      run: npm run build
```

## 8. 저장소 클론 (다른 환경에서)

```bash
git clone https://github.com/your-username/status-rpg-ai.git
cd status-rpg-ai
npm install
cp .env.example .env
# .env 파일 설정 후
npm run db:push
npm run dev
```

## 9. 릴리즈 태그 생성

```bash
# 태그 생성
git tag -a v1.0.0 -m "Release v1.0.0"

# 태그 푸시
git push origin v1.0.0
```

GitHub에서 Releases 페이지를 통해 릴리즈 노트도 작성할 수 있습니다.

## 주의사항

1. **절대 업로드하지 말 것:**
   - `.env` 파일
   - `node_modules/` 디렉토리
   - AWS 키나 비밀번호
   - 개인 정보

2. **정기적으로 확인할 것:**
   - 의존성 보안 취약점
   - 오래된 패키지 업데이트
   - 문서 최신화

3. **백업:**
   - 정기적으로 로컬 백업
   - 중요 브랜치는 여러 곳에 푸시

이제 Status RPG AI 프로젝트가 GitHub에 안전하게 업로드되어 버전 관리와 협업이 가능합니다.