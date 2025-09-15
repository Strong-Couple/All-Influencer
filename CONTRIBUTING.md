# 기여하기 (Contributing)

All Influencer 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 효과적으로 기여하는 방법을 안내합니다.

## 🤝 기여 방법

### 1. 이슈 리포팅
버그나 새로운 기능 제안이 있다면 GitHub Issues를 통해 알려주세요.

**버그 리포트 템플릿:**
```markdown
## 버그 설명
간단한 버그 설명

## 재현 단계
1. '...' 로 이동
2. '...' 를 클릭
3. '...' 까지 스크롤
4. 에러 확인

## 예상 동작
어떤 결과를 예상했는지 설명

## 실제 동작
실제로 어떤 일이 발생했는지 설명

## 환경 정보
- OS: [예: macOS 12.0]
- Browser: [예: Chrome 95.0]
- Node.js: [예: 18.17.0]
```

**기능 제안 템플릿:**
```markdown
## 기능 설명
새로운 기능에 대한 간단한 설명

## 문제점
이 기능이 해결하고자 하는 문제는?

## 제안하는 해결책
어떤 방식으로 구현하면 좋을지 설명

## 대안
고려해본 다른 방법들
```

### 2. 개발 환경 설정

```bash
# 1. 저장소 포크 및 클론
git clone https://github.com/your-username/All-influencer.git
cd All-influencer

# 2. 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/original-owner/All-influencer.git

# 3. 의존성 설치
pnpm install

# 4. 개발 서버 실행
pnpm dev
```

### 3. 브랜치 전략

**브랜치 명명 규칙:**
- `feature/기능명` - 새로운 기능 개발
- `bugfix/버그명` - 버그 수정
- `docs/문서명` - 문서 작업
- `refactor/리팩토링명` - 코드 리팩토링
- `test/테스트명` - 테스트 코드 작성

**예시:**
```bash
# 새로운 기능 개발
git checkout -b feature/user-profile

# 버그 수정
git checkout -b bugfix/login-error

# 문서 작업
git checkout -b docs/api-documentation
```

### 4. 커밋 메시지 규칙

[Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

**형식:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**타입:**
- `feat` - 새로운 기능
- `fix` - 버그 수정
- `docs` - 문서만 변경
- `style` - 코드 의미에 영향을 주지 않는 변경사항 (공백, 포맷팅 등)
- `refactor` - 버그 수정이나 기능 추가가 아닌 코드 변경
- `test` - 누락된 테스트 추가나 기존 테스트 수정
- `chore` - src 또는 test 파일을 수정하지 않는 기타 변경사항
- `perf` - 성능을 개선하는 코드 변경
- `ci` - CI 설정 파일 및 스크립트 변경
- `build` - 빌드 시스템이나 외부 의존성에 영향을 주는 변경사항

**스코프 (선택사항):**
- `web` - 웹 애플리케이션
- `api` - API 서버
- `ui` - UI 컴포넌트
- `types` - 타입 정의
- `utils` - 유틸리티
- `sdk` - SDK
- `docs` - 문서
- `config` - 설정

**예시:**
```bash
feat(api): add user authentication endpoint
fix(web): resolve navigation menu overflow
docs(readme): update installation instructions
refactor(ui): simplify Button component props
test(utils): add tests for date formatting functions
```

### 5. 코드 스타일 가이드

#### TypeScript/JavaScript
- **함수명**: camelCase 사용
- **상수**: UPPER_SNAKE_CASE 사용
- **컴포넌트명**: PascalCase 사용
- **파일명**: kebab-case 사용 (컴포넌트는 PascalCase)

#### React 컴포넌트
```tsx
// ✅ 좋은 예시
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.displayName}</CardTitle>
      </CardHeader>
    </Card>
  );
};
```

#### NestJS 컨트롤러/서비스
```typescript
// ✅ 좋은 예시
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '사용자 목록 조회' })
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }
}
```

### 6. 테스트 작성

새로운 기능이나 버그 수정시에는 관련 테스트를 포함해 주세요.

```typescript
// utils 함수 테스트 예시
describe('formatPrice', () => {
  it('should format Korean won correctly', () => {
    expect(formatPrice(1000, 'KRW')).toBe('₩1,000');
  });

  it('should handle decimal places for USD', () => {
    expect(formatPrice(10.99, 'USD')).toBe('$10.99');
  });
});
```

### 7. 문서 작성

새로운 기능을 추가할 때는 관련 문서도 업데이트해 주세요:
- README.md 업데이트
- API 문서 (Swagger 주석)
- JSDoc 주석 추가
- 타입 정의 문서

### 8. Pull Request 가이드

**PR 제목:**
커밋 메시지와 동일한 규칙을 따릅니다.

**PR 설명 템플릿:**
```markdown
## 변경사항
무엇을 변경했는지 설명

## 변경 이유
왜 이 변경이 필요한지 설명

## 테스트
어떤 테스트를 했는지 설명

## 스크린샷 (UI 변경시)
변경 전후 스크린샷

## 체크리스트
- [ ] 코드가 코드 스타일 가이드를 따름
- [ ] 자체 리뷰를 수행함
- [ ] 관련 문서를 업데이트함
- [ ] 테스트를 추가함 (해당하는 경우)
- [ ] 모든 테스트가 통과함
```

### 9. 코드 리뷰

- 건설적인 피드백을 제공해 주세요
- 코드의 가독성, 성능, 보안을 고려해 주세요
- 제안사항이 있다면 대안도 함께 제시해 주세요
- 칭찬도 잊지 마세요! 👍

## 🚀 개발 워크플로우

1. **이슈 생성** - 작업할 내용을 명확히 정의
2. **브랜치 생성** - 적절한 이름으로 브랜치 생성
3. **개발** - 코드 작성 및 테스트
4. **커밋** - 규칙에 따른 커밋 메시지 작성
5. **푸시** - 원격 저장소에 푸시
6. **PR 생성** - 상세한 설명과 함께 PR 생성
7. **코드 리뷰** - 리뷰어의 피드백 반영
8. **머지** - 승인 후 메인 브랜치에 머지

## 📞 문의

기여와 관련해 궁금한 점이 있다면:
- GitHub Issues에서 질문
- Discussion 섹션 활용
- 이메일로 직접 연락

함께 더 좋은 프로젝트를 만들어 나가요! 🚀

