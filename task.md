# Project Task Guide

기준 문서: [HANDOVER_project_overview.md](/home/jaoh/42/M6/aejone/HANDOVER_project_overview.md)

이 문서는 Jay 기준으로 `주차별로 무엇을 해야 하는지`를 바로 실행 가능한 수준으로 정리한 작업 문서다.

## 전체 방향

- Week 1: 인증 화면 MVP 완성
- Week 2: 인증 실제 연결 + 취향 선택 시작
- Week 3~4: 프로필, 내 공간, 계정 설정
- Week 4~5: 리뷰 기능
- Week 5~6: 보완, 반응형, 선택 모듈
- Week 6~7: 팀 전체 마감 준비

## Week 1

### 목표

- 로그인 페이지 완성
- 회원가입 페이지 완성
- 42 OAuth 버튼 UI 추가
- i18n 키 추가
- auth API 틀 만들기
- 공유 타입 정리
- JWT 연결 준비

### 해야 할 일

1. 로그인 페이지
- `frontend/src/pages/LoginPage.tsx` 작성 또는 정리
- 이메일 입력 필드 추가
- 비밀번호 입력 필드 추가
- 로그인 버튼 추가
- 에러 메시지 영역 추가
- 회원가입 링크 추가
- 로딩 상태 처리 추가

2. 회원가입 페이지
- `frontend/src/pages/SignupPage.tsx` 작성 또는 정리
- 이메일 입력 필드 추가
- 닉네임 입력 필드 추가
- 비밀번호 입력 필드 추가
- 비밀번호 확인 필드 추가
- 회원가입 버튼 추가
- 로그인 링크 추가
- 에러 메시지 영역 추가
- 로딩 상태 처리 추가

3. 프론트 유효성 검사
- 빈 값 검사
- 이메일 형식 검사
- 비밀번호 길이 검사
- 비밀번호 확인 일치 검사
- 잘못된 입력이면 제출 막기

4. 42 OAuth 버튼 UI
- 로그인 페이지에 버튼 추가
- 클릭 시 앱이 죽지 않게 처리
- 실제 연결은 하지 않음

5. i18n
- `frontend/src/locales/ko.json`
- `frontend/src/locales/en.json`
- `frontend/src/locales/fr.json`
- 로그인/회원가입 관련 키 추가
- 검증 문구 키 추가
- 공통 버튼 문구 키 추가
- 하드코딩 문구 제거

6. auth API
- `frontend/src/store/api/authApi.ts` 생성
- login mutation 정의
- signup mutation 정의
- mock API 또는 임시 API와 연결
- 실패 시 메시지 반환 구조 만들기

7. 공유 타입
- `frontend/src/types/index.ts` 생성 또는 정리
- `LoginRequest`
- `LoginResponse`
- `SignupRequest`
- `SignupResponse`
- `AuthUser`
- `AuthErrorResponse`
- `AuthSession`

8. JWT 연결 준비
- `authSlice`의 `setCredentials` payload 정리
- 로그인/회원가입 성공 시 dispatch 구조 연결
- 토큰을 Redux 메모리에만 저장
- `localStorage`, `sessionStorage` 사용 금지

### 완료 기준

- 로그인 페이지 렌더링 정상
- 회원가입 페이지 렌더링 정상
- 프론트 유효성 검사 정상
- API 실패 시 에러 메시지 정상
- `localStorage` 사용 없음
- `npm run build` 통과
- `npm run lint` 통과

### 산출물

- `LoginPage`
- `SignupPage`
- `authApi`
- `src/types/index.ts`
- 3개 언어 번역 파일

## Week 2

### 목표

- 인증 실제 연결
- 42 OAuth 연결 시작
- 취향 선택 온보딩 구현

### 해야 할 일

1. 백엔드 인증 연결
- Django 인증 API URL 확인
- RTK Query endpoint URL 실제 값으로 교체
- 성공/실패 응답 형식 확인
- 에러 응답 shape 백엔드와 맞추기

2. JWT 플로우 마무리
- 로그인 후 `setCredentials` 동작 확인
- 보호된 페이지 접근 흐름 점검
- 토큰 만료 시 재로그인 또는 refresh 설계 확인
- JH의 reauth 구조와 충돌 없는지 확인

3. 42 OAuth 실제 연결
- 백엔드 OAuth 시작 URL 확인
- 프론트에서 버튼 클릭 시 해당 흐름 연결
- OAuth 성공 후 토큰 수신 구조 확인
- 실패 시 에러 처리 추가

4. 취향 선택 페이지
- `/onboarding` 라우트 추가
- 장르 선택 UI 만들기
- 선호 작품 선택 UI 만들기
- 최소 선택 조건 정의
- 다음 단계 이동 버튼 추가

5. 가입 후 이동 흐름
- 회원가입 성공 후 `/onboarding` 이동
- 이미 온보딩 완료한 유저는 홈으로 보내는 조건 검토

### 완료 기준

- 이메일 로그인 실제 동작
- 회원가입 실제 동작
- 42 OAuth 기본 연결 확인
- 온보딩 화면 진입 가능
- 가입 후 온보딩 이동 흐름 동작

### 산출물

- 실제 auth API 연결본
- onboarding 페이지 초안
- OAuth 버튼 실제 연결

## Week 3~4

### 목표

- 프로필 페이지
- 프로필 수정
- 비밀번호 변경
- 마이페이지/내 공간

### 해야 할 일

1. 프로필 조회 페이지
- `/profile/:id` 또는 팀 라우트 규칙 확인
- 유저 기본 정보 표시
- 아바타 표시
- 소개글 표시
- 공개 활동 일부 표시

2. 프로필 수정
- 닉네임 수정
- 소개글 수정
- 아바타 업로드 UI
- 저장 버튼
- 성공/실패 메시지 처리

3. 비밀번호 변경
- 현재 비밀번호 입력
- 새 비밀번호 입력
- 새 비밀번호 확인 입력
- 비밀번호 규칙 검사
- 성공 후 사용자 피드백 표시

4. 내 공간
- `/mypage` 또는 팀 라우트 규칙 확인
- 내 리뷰 목록
- 평가한 작품 목록
- 찜 목록
- 최근 활동 목록

### 완료 기준

- 프로필 조회 가능
- 프로필 수정 가능
- 비밀번호 변경 가능
- 마이페이지에서 최소 2개 이상 정보 섹션 표시

### 산출물

- `ProfilePage`
- `ProfileEditForm`
- `AvatarUpload`
- `PasswordChangeForm`
- `MyPageDashboard`

## Week 4~5

### 목표

- 리뷰 작성, 수정, 삭제
- 별점 컴포넌트
- 리뷰 목록 정리

### 해야 할 일

1. 별점 컴포넌트
- 클릭으로 별점 선택
- 읽기 전용 표시 모드
- hover 상태 처리
- 접근성 속성 점검

2. 리뷰 작성 폼
- 별점 입력
- 한줄평 또는 본문 입력
- 스포일러 여부 선택
- 제출 버튼
- 에러 처리

3. 리뷰 수정/삭제
- 본인 리뷰에서만 버튼 표시
- 수정 모드 진입
- 삭제 확인 UI
- 삭제 후 목록 갱신

4. 리뷰 목록
- 최신순 정렬
- 공감순 정렬
- 평점순 정렬
- 스포일러 토글

5. 리뷰 좋아요
- 공감 버튼 추가
- 중복 클릭 처리 규칙 확인

6. JH와 협업
- 미디어 상세 페이지에 어떤 props로 주입할지 합의
- API 응답 shape 합의
- 리뷰 카드 표시 방식 합의

### 완료 기준

- 리뷰 작성 가능
- 리뷰 수정/삭제 가능
- 리뷰 목록 정렬 최소 2개 이상 동작
- 미디어 상세 페이지와 연결 가능한 형태 확보

### 산출물

- `StarRating`
- `ReviewForm`
- `ReviewCard`
- `ReviewList`

## Week 5~6

### 목표

- 선택 기능 보완
- 반응형 점검
- 번역 마무리
- 시간 남으면 소개 페이지

### 해야 할 일

1. 2FA 설정 화면
- 선택 모듈 채택 시에만 진행
- 설정 진입 UI
- OTP 입력 또는 QR 안내 UI
- 성공/실패 처리

2. 계정 탈퇴
- 확인 모달 추가
- 되돌릴 수 없다는 안내
- 탈퇴 성공 후 로그아웃 처리

3. i18n 마무리
- 내 담당 페이지 모든 문구 점검
- 누락 키 제거
- 3개 언어 파일 키 구조 동일하게 맞추기

4. 반응형 점검
- 모바일 화면에서 입력 폼 깨짐 없는지
- 헤더 줄바꿈 여부
- 카드 폭과 여백 확인
- 버튼 터치 영역 확인

5. Info 소개 페이지
- 시간 남으면 서비스 소개 페이지 추가
- 평가 때 설명용으로 쓸 수 있게 정리

### 완료 기준

- 담당 페이지 모바일 대응 완료
- i18n 누락 없음
- 선택 기능 또는 보완 기능 1개 이상 추가

### 산출물

- 반응형 보완본
- 번역 마감본
- 선택 기능 또는 소개 페이지

## Week 6~7

### 목표

- 팀 전체 마감
- 평가 대응
- 필수 문서와 정책 페이지 준비

### 해야 할 일

1. Privacy Policy / Terms of Service
- 빈 페이지 금지
- 실제 내용 작성
- 라우트 연결
- footer 또는 헤더에서 접근 가능하게 연결

2. README 정리
- 역할 분담
- 모듈 점수
- 기술 스택
- 실행 방법
- 기여도 정리

3. Docker 배포 확인
- 프론트 빌드 명령어가 Docker에서 정상 동작하는지 확인
- 환경변수 문서화
- `.env.example` 점검

4. 최종 점검
- 콘솔 에러 0개
- 콘솔 경고 0개
- 다중 접속 시 문제 없는지 팀 테스트
- 시연 흐름 리허설

5. 평가 대비
- React를 왜 썼는지 설명 준비
- TypeScript를 왜 썼는지 설명 준비
- Redux Toolkit을 왜 썼는지 설명 준비
- localStorage 대신 Redux 메모리를 쓰는 이유 설명 준비

### 완료 기준

- 정책 페이지 준비 완료
- README 완료
- 빌드와 실행 흐름 설명 가능
- 평가 질문 대응 가능

## 매주 공통 체크리스트

- [ ] `localStorage`에 토큰 저장 코드가 없다
- [ ] 하드코딩된 사용자 문구가 없다
- [ ] 새 타입은 `frontend/src/types/index.ts`에 넣었다
- [ ] 콘솔 에러/경고 0개 확인했다
- [ ] 작업 브랜치가 맞다
- [ ] 커밋 메시지가 컨벤션에 맞다
- [ ] JH와 공유 파일 충돌 가능성을 확인했다

## JH에게 매번 확인할 것

- `apiSlice` 또는 RTK Query 구조가 바뀌었는지
- `authSlice.setCredentials` payload가 바뀌었는지
- 라우트 규칙이 바뀌었는지
- `src/types/index.ts` 충돌이 있는지
- i18n 키 네임스페이스 충돌이 없는지

## 추천 브랜치명

- `feature/auth-pages`
- `feature/onboarding`
- `feature/profile-page`
- `feature/review-system`
- `feature/auth-oauth`

## 추천 커밋 메시지

- `feat: implement login and signup pages`
- `feat: connect auth api mutations`
- `feat: add onboarding page`
- `feat: implement profile edit flow`
- `feat: add review form and rating component`
- `fix: resolve auth error handling`
- `docs: update frontend task guide`
