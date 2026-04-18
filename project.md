# ft_transcendence — Jay 프로젝트 핸드오버

---

## 1. 프로젝트 개요

### 1-1. 프로젝트 정의
42 Common Core 마지막 팀 프로젝트. 4~5인이 함께 웹 애플리케이션을 만든다.
우리 팀은 5인이며, **IMDB 스타일의 영화/시리즈/드라마/애니메이션 평점·리뷰 플랫폼 + 커뮤니티**를 만든다.

### 1-2. 팀 구성
| 멤버 | 역할 | 담당 영역 |
|------|------|----------|
| JH | PM / Frontend | 공통 기반(스토어,라우터,레이아웃) → 메인/추천피드, 미디어 상세, 게시판, 토론방 |
| Jay | Frontend | 로그인/회원가입/취향선택 → 내 공간, 프로필, 리뷰 |
| LL | PO / Backend | Django + DRF 백엔드 |
| TL | AI | Collaborative Filtering + RAG 추천 파이프라인 |
| SH | Architect / Data / DevOps | Docker, AWS, CI/CD, PostgreSQL, Redis |

### 1-3. 서비스 핵심 기능
- 작품 정보 열람 (영화, 시리즈, 드라마, 애니메이션)
- 작품별 댓글형 평점 + 후기 (네이버 영화 스타일)
- 맞춤 추천 시스템 (Collaborative Filtering + RAG)
- 커뮤니티 게시판 (자유게시판, 작품 추천 게시판, 정보 게시판)
- 실시간 토론방
- 취향 기반 팔로우 시스템
- 개인 리뷰 공간

### 1-4. 42 필수 요구사항 (이걸 빠뜨리면 프로젝트 리젝)
- 프론트엔드 + 백엔드 + 데이터베이스 필수
- Git 사용, 모든 팀원의 커밋 필요, 명확한 커밋 메시지
- Docker/Podman으로 컨테이너화, 단일 명령어로 배포
- 최신 Google Chrome 호환
- 브라우저 콘솔에 에러/경고 0개
- Privacy Policy + Terms of Service 페이지 (실제 내용 필수, 빈 페이지 불가)
- 다중 사용자 동시 접속 지원 (데이터 충돌/레이스 컨디션 없어야 함)
- 모든 폼/입력은 프론트+백 양쪽에서 유효성 검사
- 백엔드 HTTPS 필수
- 민감 정보(API키 등)는 .env 파일로 관리, .env.example 제공

### 1-5. 모듈 시스템 (점수제)
총 14포인트 이상 필요. Major = 2pt, Minor = 1pt.
평가 시 각 모듈을 시연해야 하며, 미완성 모듈 = 0점.
14점 초과 모듈은 보너스 (최대 5점 추가 가능).

---

## 2. 개발 환경

### 2-1. 프론트엔드 스택 (확정)
| 항목 | 선택 | 비고 |
|------|------|------|
| 언어 | TypeScript 6 | — |
| 프레임워크 | React 19 | — |
| 빌드 도구 | Vite 8 | — |
| 라우팅 | React Router 7 | — |
| 데이터 페칭 | RTK Query | @reduxjs/toolkit/query/react |
| 상태 관리 | Redux Toolkit | — |
| 스타일링 | Tailwind CSS + shadcn/ui | — |
| 다국어 | react-i18next | 최소 3개 언어 (한/영/불) |

### 2-2. 백엔드 스택
| 항목 | 선택 |
|------|------|
| 프레임워크 | Django + DRF + Django Channels |
| 인증 | JWT |

### 2-3. 전체 스택 요약
| 계층 | 기술 |
|------|------|
| Frontend | React + TypeScript + Redux Toolkit (RTK Query) |
| Backend | Django + DRF + Django Channels |
| Database | PostgreSQL + Redis |
| AI | Collaborative Filtering + RAG (pgvector) |
| DevOps | Docker + AWS EC2 + GitHub Actions |

### 2-4. 프로젝트 폴더 구조
```
root-workspace/
├── frontend/                # React + TypeScript
├── backend/                 # Django + DRF + Channels
├── ai/                      # recommand pipeline + RAG
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
├── docker-compose.yml       # local dev environment
├── docker-compose.prod.yml  # production environment
├── .env.example             # .env template
└── .gitignore
```

### 2-5. 환경 통일 규칙
- Node.js: 20 LTS
- 패키지 매니저: npm (yarn/pnpm 금지)
- 프로젝트 시작: `git clone` → `cd ft_transcendence-frontend` → `npm install` → `npm run dev`

### 2-6. 팀 내 코드 규칙
- JWT 토큰은 **Redux authSlice에만 저장** (localStorage 사용 절대 금지)
- 42 OAuth 로그인도 동일한 authSlice에서 처리
- 모든 사용자 노출 텍스트는 i18n 키로 관리 (하드코딩 금지)
- 공유 타입은 `src/types/index.ts` 단일 파일로 관리
- 폴더 구조는 설계서 코드 예시 경로를 따름

### 2-7. 브랜치 전략
| 브랜치 | 용도 |
|--------|------|
| `main` | 프로덕션/배포 (직접 push 금지) |
| `dev` | 통합 개발 브랜치 |
| `feature/<기능명>` | 새 기능 구현 |
| `fix/<에러명>` | 버그 수정 |
| `test/<테스트명>` | 테스트 |
| `docs/<문서명>` | 문서 업데이트 |

**규칙:**
- 모든 작업은 `dev`에서 브랜치를 딴다
- PR 흐름: `feature/*`, `fix/*`, `test/*`, `docs/*` → `dev`
- `main` 머지는 주요 마일스톤 완료 시에만

**Jay 작업 예시:**
- `feature/login-page` → 로그인 페이지 개발
- `feature/signup-page` → 회원가입 페이지 개발
- `fix/login-validation` → 로그인 유효성 검사 수정

### 2-8. 커밋 컨벤션
| 접두사 | 용도 |
|--------|------|
| `feat:` | 새 기능 추가 |
| `fix:` | 버그 수정 (오타, 경로 변경 등) |
| `test:` | 테스트 코드 작성/수정 |
| `setup:` | 환경 설정 (Docker, CI, 패키지 등) |
| `docs:` | 문서 변경 (README 등) |

**예시:**
- `feat: implement login page UI with i18n support`
- `feat: add signup form with password validation`
- `fix: resolve login token expiration error`
- `docs: add auth API type definitions`

---

## 3. 팀 역할 분담

### 3-1. 42 공식 역할 (README에 명시 필수)
| 멤버 | 공식 역할 |
|------|----------|
| LL | Product Owner (PO) — 제품 비전, 기능 우선순위, 완성 검증, 평가자 소통 |
| JH | Project Manager (PM) — 미팅 주관, 진행 추적, 장애물 해결, 소통 관리 |
| SH | Architect — 아키텍처, 기술 스택 결정, 코드 품질, 코드 리뷰 |
| 전원 | Developers — 기능 구현, 코드 리뷰 참여, 테스트, 문서화 |

### 3-2. 프론트엔드 작업 분담
**JH (공통 기반 담당):**
- 개발 환경 구성
- Redux Toolkit + RTK Query 스토어 설정 (authSlice, uiSlice, apiSlice)
- 공통 컴포넌트 (Layout, Header, ErrorBoundary, PrivateRoute)
- → 이후: 메인/추천피드, 미디어 상세, 게시판, 토론방

**Jay (인증 + 유저 담당):**
- 로그인/회원가입/취향선택 페이지
- → 이후: 내 공간, 프로필, 리뷰
- 시간 남으면: Info 소개 페이지

### 3-3. 전체 팀 담당 영역
| 멤버 | 영역 |
|------|------|
| JH | PM + Frontend 공통 기반 + 페이지 개발 |
| Jay | Frontend 인증/유저/리뷰 |
| LL | PO + Backend (Django + DRF) |
| TL | AI 추천 시스템 (Collaborative Filtering + RAG) |
| SH | Architect + Data (PostgreSQL, Redis) + DevOps (Docker, AWS, CI/CD) |

### 3-4. 평가 시 질문받는 것
- 역할이 어떻게 나뉘었는지
- 작업을 어떻게 조직했는지
- 팀원 간 소통 방식
- **모든 팀원이 프로젝트 전체를 설명할 수 있어야 함** (자기 파트만 아는 건 안 됨)

---

## 4. 프론트엔드 전체 할 일 (전체 목록)

### 4-1. 인프라/공통 (JH 담당)
- [x] 개발 환경 구성 (React + TS + Vite)
- [x] Redux Toolkit 스토어 설정
- [x] authSlice, uiSlice 초기 구현
- [x] apiSlice baseQuery + 자동 reauth 미들웨어
- [x] 공통 컴포넌트 (Layout, Header, ErrorBoundary)
- [x] PrivateRoute
- [x] react-i18next 세팅
- [ ] 메인 페이지 (인기 작품, 최신 리뷰, 커뮤니티 미리보기)
- [ ] 추천 피드 (취향 기반 작품 목록)
- [ ] 미디어 상세 페이지 (작품 정보 + 리뷰 목록)
- [ ] 게시판 (자유/추천/정보 — 목록, 상세, 글쓰기)
- [ ] 토론방 (실시간 채팅)
- [ ] 검색 기능 (필터, 정렬, 페이지네이션)
- [ ] Privacy Policy / Terms of Service 페이지

### 4-2. 인증/유저 (Jay 담당)
- [ ] 로그인 페이지
- [ ] 회원가입 페이지
- [ ] 42 OAuth 로그인
- [ ] JWT 토큰 연결 (authSlice dispatch)
- [ ] 취향 선택 페이지 (온보딩)
- [ ] 프로필 페이지 (조회, 수정, 아바타)
- [ ] 내 공간/마이페이지 (활동 내역, 찜 목록)
- [ ] 리뷰 작성/수정/삭제 컴포넌트
- [ ] 비밀번호 변경
- [ ] 2FA 설정 (선택 모듈)
- [ ] Info 소개 페이지 (시간 남으면)

### 4-3. 공통 관심사 (같이 맞춰야 할 것)
- [ ] i18n 번역 파일 완성 (3개 언어, 모든 페이지)
- [ ] 반응형 디자인 전체 점검
- [ ] 브라우저 콘솔 에러/경고 0개 확인
- [ ] shadcn/ui 컴포넌트 통일 (디자인 시스템 10개+ → Minor 1pt)

---

## 5. Jay가 기여하는 42 모듈 포인트

| 모듈 | 카테고리 | 종류 | 점수 | Jay 기여도 |
|------|---------|------|------|-----------|
| 프론트+백엔드 프레임워크 | Web | Major | 2 | 팀 전체 |
| 표준 유저 관리 + 인증 | User Mgmt | Major | 2 | Jay 주 담당 |
| OAuth 2.0 (42 로그인) | User Mgmt | Minor | 1 | Jay 주 담당 |
| 다국어 지원 (i18n, 3언어) | Accessibility | Minor | 1 | 팀 전체 |
| 커스텀 디자인 시스템 (10개+) | Web | Minor | 1 | 팀 전체 |
| 2FA (선택) | User Mgmt | Minor | 1 | Jay (시간 되면) |

Jay 개인 기여분: 약 3~4pt / 팀 전체 목표: 14pt 이상.

---

## 6. 주차별 계획 (Jay 기준)

### Week 1 — 인증 화면 ✅ (현재 여기)

**목표:** 로그인 + 회원가입 페이지 UI 완성

| 작업 | 파일 | 상태 |
|------|------|------|
| 로그인 페이지 UI | src/pages/LoginPage.tsx | ⬜ |
| 회원가입 페이지 UI | src/pages/SignupPage.tsx (새로 생성) | ⬜ |
| 42 OAuth 버튼 (UI만) | LoginPage 안에 포함 | ⬜ |
| i18n 번역 키 추가 | src/locales/ko·en·fr.json | ⬜ |
| auth API 엔드포인트 정의 | store/api/authApi.ts | ⬜ |
| 타입 정의 추가 | src/types/index.ts | ⬜ |
| JWT 토큰 연결 | 팀원과 같이 테스트 | ⬜ (백엔드 대기) |

**규칙 체크:**
- localStorage에 토큰 저장 코드 없는지 확인
- 모든 텍스트가 t() 키로 처리되었는지 확인
- 콘솔 에러/경고 0개인지 확인

**백엔드 없는 동안:**
- API 호출은 네트워크 에러로 실패 → catch에서 에러 메시지 표시 → 크래시 안 함
- UI 렌더링 + 프론트 유효성 검사가 동작하면 1주차 목표 달성

### Week 2 — 인증 연결 + 취향 선택

| 작업 | 설명 |
|------|------|
| 백엔드 연결 | Django 인증 API 완성되면 RTK Query 엔드포인트 URL 맞추기 |
| JWT 토큰 플로우 완성 | 로그인 → setCredentials → 자동 reauth 미들웨어 동작 확인 |
| 42 OAuth 연결 | 백엔드 OAuth 엔드포인트와 연결 |
| 취향 선택 페이지 | /onboarding — 장르 선택 + 작품 선택 UI |
| 회원가입 → 취향 선택 흐름 | 가입 직후 자동으로 취향 선택 페이지로 이동 |

### Week 3~4 — 내 공간 + 프로필

| 작업 | 설명 |
|------|------|
| 프로필 페이지 | /profile/:id — 유저 정보, 아바타, 소개글 표시 |
| 프로필 수정 | 닉네임, 소개글, 아바타 업로드 |
| 비밀번호 변경 | 현재 비밀번호 확인 → 새 비밀번호 |
| 내 공간 | /mypage — 내 리뷰 목록, 평가한 작품, 찜 목록, 최근 활동 |

### Week 4~5 — 리뷰 시스템

| 작업 | 설명 |
|------|------|
| 별점 컴포넌트 | StarRating — 클릭으로 별점 선택/표시 |
| 리뷰 작성 | 별점 + 한줄평 작성 폼 |
| 리뷰 수정/삭제 | 본인 리뷰만 수정/삭제 가능 |
| 리뷰 목록 | 정렬 (최신순/공감순/평점순), 스포일러 토글 |
| 리뷰 좋아요 | 다른 사람 리뷰에 공감 |

※ 리뷰 컴포넌트는 JH의 미디어 상세 페이지 안에 들어가므로 **협업 필요**

### Week 5~6 — 마무리 + 보완

| 작업 | 설명 |
|------|------|
| 2FA 설정 화면 | (Minor 모듈 선택 시) |
| 계정 탈퇴 | 확인 모달 → 데이터 삭제 |
| i18n 번역 완성 | 내 담당 페이지 3개 언어 번역 누락 없는지 점검 |
| 반응형 디자인 점검 | 모바일/태블릿에서 내 페이지들 깨지는지 확인 |
| Info 소개 페이지 | 시간 남으면 |

### Week 6~7 — 팀 전체 마무리

| 작업 | 설명 |
|------|------|
| Privacy Policy / ToS | 팀원과 분담해서 작성 (없으면 프로젝트 리젝) |
| README.md | 역할, 모듈, 기여도, 기술 스택 근거 등 전부 문서화 |
| Docker 배포 | DevOps 담당이 하되, 프론트 빌드 명령어 확인 필요 |
| 최종 점검 | 콘솔 에러 0개, 다중 접속 테스트, 모듈별 시연 리허설 |

---

## 7. Jay가 만들 컴포넌트 전체 목록

| 컴포넌트 | 용도 | 해당 Phase |
|---------|------|-----------|
| LoginPage | 로그인 페이지 | Week 1 |
| SignupPage | 회원가입 페이지 | Week 1 |
| OAuthButton | 42 OAuth 로그인 버튼 | Week 1 |
| GenreSelector | 취향 선택 — 장르 카드 복수 선택 | Week 2 |
| MediaPicker | 취향 선택 — 인기 작품 중 선택 | Week 2 |
| ProfileCard | 유저 프로필 정보 표시 | Week 3 |
| ProfileEditForm | 프로필 수정 폼 | Week 3 |
| AvatarUpload | 아바타 업로드/변경 | Week 3 |
| PasswordChangeForm | 비밀번호 변경 폼 | Week 3 |
| MyPageDashboard | 내 공간 대시보드 | Week 3 |
| ActivityFeed | 최근 활동 목록 | Week 3 |
| StarRating | 별점 입력/표시 | Week 4 |
| ReviewForm | 리뷰 작성/수정 | Week 4 |
| ReviewCard | 리뷰 한 건 표시 | Week 4 |
| ReviewList | 리뷰 목록 + 정렬 | Week 4 |

---

## 8. 팀원과 협업 포인트

### 8-1. JH에게 확인해야 할 것
- apiSlice의 `injectEndpoints` 패턴 사용 여부 (authApi 엔드포인트 추가 방식에 영향)
- authSlice에서 `setCredentials`의 정확한 payload 타입
- 라우터 파일 위치 및 `/login`, `/signup` 경로 등록 방법
- i18n 번역 파일 구조 (이미 있는 키와 충돌하지 않는지)
- src/types/index.ts에 이미 정의된 타입 확인 (중복 방지)

### 8-2. JH와 동시 작업하는 영역
- **리뷰 컴포넌트** → JH의 미디어 상세 페이지 안에 들어감. props/데이터 형태 합의 필요
- **i18n 번역 파일** → 같은 JSON 파일을 수정하므로 키 네임스페이스 충돌 주의 (login.*, signup.* 등 접두사로 구분)
- **타입 파일** → src/types/index.ts 하나를 공유하므로 PR 충돌 가능 → 작업 전 pull 습관

---

## 9. 주의사항 체크리스트

### 매번 커밋 전 확인
- [ ] localStorage에 토큰 저장하는 코드가 없는가
- [ ] 하드코딩된 한글/영어 텍스트가 없는가 (전부 t() 사용)
- [ ] 새 타입을 src/types/index.ts에 추가했는가 (별도 파일 생성 X)
- [ ] 콘솔에 에러/경고가 0개인가
- [ ] 커밋 메시지가 컨벤션에 맞는가 (`feat:`, `fix:`, `test:`, `setup:`, `docs:`)
- [ ] 올바른 브랜치에서 작업 중인가 (`dev`에서 분기한 `feature/*` 브랜치)

### 평가 대비
- 자기 코드뿐 아니라 JH 코드(스토어, 레이아웃, 라우터)도 설명할 수 있어야 함
- "왜 React를 골랐는가" → 42 커뮤니티 레퍼런스, 생태계, 취업 연계
- "왜 TypeScript를 골랐는가" → 5인 협업에서 타입 안정성, 자동완성, 버그 방지
- "왜 Redux Toolkit을 골랐는가" → RTK Query와의 통합, 미들웨어 기반 자동 reauth
- "왜 localStorage 대신 Redux에 토큰 저장하는가" → XSS 공격 시 localStorage는 탈취 가능, Redux는 메모리에만 존재하므로 더 안전
