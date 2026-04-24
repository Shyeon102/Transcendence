# Frontend File Guide

## 왜 파일이 이렇게 나뉘어 있나

Week 1 MVP만 해도 역할이 다른 파일을 분리해야 이후 Week 2 이후 작업이 덜 꼬인다.

- `src/main.tsx`
  앱 시작점이다. React, Redux, Router를 연결한다.

- `src/App.tsx`
  라우트만 관리한다. 지금은 `/`, `/login`, `/signup`만 둬서 단순하게 유지했다.

- `src/pages/HomePage.tsx`
  MVP 확인용 랜딩 페이지다. 로그인 상태와 언어 전환, 데모 계정 안내를 보여준다.

- `src/pages/LoginPage.tsx`
  task 1 담당 파일이다. 로그인 UI, 프론트 유효성 검사, 42 OAuth 버튼 UI가 있다.

- `src/pages/SignupPage.tsx`
  task 2 담당 파일이다. 회원가입 UI와 프론트 유효성 검사가 있다.

- `src/components/LanguageSwitcher.tsx`
  언어 전환 버튼만 따로 뺐다. 로그인/회원가입/홈에서 공통으로 쓰기 때문이다.

- `src/lib/i18n.ts`
  외부 i18n 라이브러리 없이 `t('key')` 형태를 제공하는 최소 헬퍼다.

- `src/locales/ko.json`
  한국어 문구 모음이다.

- `src/locales/en.json`
  영어 문구 모음이다.

- `src/locales/fr.json`
  프랑스어 문구 모음이다.

- `src/store/index.ts`
  Redux store 조립 파일이다. `jihye` 프로젝트와 같은 진입 구조로 auth, ui, chat slice를 여기서 묶는다.

- `src/features/auth/authSlice.ts`
  로그인된 사용자와 access token을 Redux 메모리에만 들고 있는 파일이다.

- `src/features/auth/mockAuth.ts`
  백엔드 없을 때 로그인/회원가입 흐름을 흉내내는 mock API다.

- `src/features/ui/uiSlice.ts`
  현재 언어 같은 UI 상태를 관리한다.

- `src/types/auth.ts`
  auth 관련 타입 모음이다.

- `src/index.css`
  Tailwind 진입점과 전역 기본 스타일이다.

- `tsconfig.app.json`
  TypeScript 앱 컴파일 설정이다. JSON locale import 허용도 여기서 처리한다.

- `package.json`
  Vite, React, Redux, Tailwind 등 실행에 필요한 패키지 목록이다.

## 지금은 안 건드린 파일

- `src/features/chat/*`
  Week 1 범위가 아니라서 그대로 뒀다.

- `public/*`, `assets/*`
  정적 파일 보관용이다.

- `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`
  빌드와 스타일 도구 설정 파일이다.

## 정리

많아 보이지만 실제 Week 1에서 핵심인 파일은 아래 정도다.

- `src/pages/LoginPage.tsx`
- `src/pages/SignupPage.tsx`
- `src/components/LanguageSwitcher.tsx`
- `src/lib/i18n.ts`
- `src/locales/*.json`
- `src/features/auth/authSlice.ts`
- `src/features/auth/mockAuth.ts`
