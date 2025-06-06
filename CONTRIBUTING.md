# 기여 가이드

Status RPG AI 프로젝트에 기여해주셔서 감사합니다!

## 개발 환경 설정

1. **포크 및 클론**
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
# .env 파일에 실제 값 입력
```

4. **데이터베이스 설정**
```bash
npm run db:push
```

## 개발 규칙

### 브랜치 명명 규칙
- `feature/기능명` - 새로운 기능
- `fix/버그명` - 버그 수정
- `docs/문서명` - 문서 수정
- `refactor/리팩토링명` - 코드 리팩토링

### 커밋 메시지 규칙
```
type(scope): 설명

예시:
feat(auth): 사용자 인증 기능 추가
fix(quest): 퀘스트 완료 시 스탯 업데이트 오류 수정
docs(readme): 설치 가이드 업데이트
```

### 코드 스타일
- TypeScript 사용 필수
- ESLint 규칙 준수
- Prettier로 포맷팅
- 함수와 변수에 명확한 이름 사용

## 기여 프로세스

1. **이슈 확인**
   - 기존 이슈 검색
   - 새로운 이슈 생성 (필요시)

2. **개발**
   - 기능 브랜치 생성
   - 코드 작성 및 테스트
   - 커밋 및 푸시

3. **Pull Request**
   - 명확한 제목과 설명
   - 변경사항 요약
   - 스크린샷 첨부 (UI 변경시)

## 테스트

```bash
npm run type-check  # TypeScript 타입 검사
npm run lint        # ESLint 검사
npm run build       # 빌드 테스트
```

## 문의

질문이나 제안사항이 있으시면 GitHub Issues를 이용해주세요.