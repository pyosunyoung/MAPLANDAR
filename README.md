# MAPLANDAR_VeSu

MAPLANDAR를 `Vercel + Supabase` 조합으로 간이 배포할 수 있도록 정리한 프런트엔드 중심 저장소입니다.

현재 목표는 다음 두 가지입니다.

- 기존 React UI와 주요 사용자 흐름을 최대한 유지한다.
- 기존 Spring Boot + MySQL 백엔드를 Supabase Auth, Postgres, Edge Functions로 대체해 정적 프런트와 함께 배포 가능하게 만든다.

## 현재 구조

```text
.
├─ public/                      # CRA 정적 자산
├─ src/                         # React 앱 소스
│  ├─ Layout/                   # 앱 공통 레이아웃
│  ├─ features/                 # Redux slice
│  ├─ pages/                    # 화면 단위 컴포넌트
│  ├─ utils/                    # API, geocode 유틸
│  └─ lib/                      # Supabase 클라이언트
├─ supabase/
│  ├─ migrations/               # Postgres 스키마 마이그레이션
│  ├─ functions/app/            # 기존 /api/* 를 대체하는 Edge Function
│  └─ config.toml               # 로컬 Supabase 개발 설정
├─ legacy-spring-backend/       # 기존 Spring 백엔드 보존본
├─ docs/                        # 배포/설정 문서
├─ .env.example                 # 프런트 필수 환경변수 예시
└─ vercel.json                  # Vercel SPA rewrite 설정
```

## 무엇이 바뀌었나

- 프런트 인증 흐름을 `JSESSIONID` 대신 `Supabase Auth session` 기준으로 변경
- Axios API 클라이언트가 Supabase access token을 `Authorization: Bearer ...` 로 자동 첨부
- Kakao REST 키의 브라우저 직접 호출 제거
- `supabase/functions/app` 에서 기존 `/api/auth`, `/api/friends`, `/api/groups`, `/api/schedules`, `/api/locations/recommend/*` 경로를 대체
- `supabase/migrations` 에 프로필, 친구 요청, 그룹, 캘린더, 일정 스키마 추가
- 루트 `.env` 는 Git 추적에서 제외하고 `.env.example` 기반으로 설정하도록 정리

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 준비

`.env.example` 를 참고해 루트 `.env` 를 구성합니다.

필수 키:

```env
REACT_APP_API_BASE_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/app
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
REACT_APP_KAKAO_JS_KEY=YOUR_KAKAO_JAVASCRIPT_KEY
```

Supabase Edge Function 쪽에는 `KAKAO_REST_API_KEY` secret 이 별도로 필요합니다.

### 3. 프런트 개발 서버

```bash
npm start
```

### 4. 로컬 Supabase 사용 시

```bash
npm run supabase:start
npm run supabase:db:push
npm run supabase:functions:serve
```

자세한 절차는 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) 에 정리했습니다.

## 배포 대상 아키텍처

- Frontend: Vercel
- Auth: Supabase Auth
- Database: Supabase Postgres
- API: Supabase Edge Functions
- Map / Place Search:
  - 클라이언트 지도 표시: Kakao JavaScript SDK
  - 장소 추천: Kakao Local REST API via Edge Function

## 구현된 간이 배포 범위

현재 코드 기준으로 다음 기능은 Vercel + Supabase 구조에 맞춰 옮겨갈 수 있게 정리되어 있습니다.

- 이메일 회원가입 / 로그인
- 현재 로그인 사용자 조회
- 친구 요청 / 수락 / 거절 / 목록
- 그룹 생성 / 조회 / 삭제 / 이름 변경
- 그룹 일정 생성 / 조회 / 수정 / 삭제
- 중간 장소 추천 카페 / 음식점 추천 API

## 남아 있는 제한점

- 기존 Spring 백엔드와 100% 동일한 서버 동작을 완전 재현한 것은 아닙니다.
- `MyPage` 는 원본 저장소에서도 실질 기능이 거의 없었고, 현재도 간단한 placeholder 상태입니다.
- 간이 배포본에서는 이메일 변경을 지원하지 않습니다.
- Supabase 이메일 인증 정책을 기본값으로 두면, 회원가입 직후 로그인 UX가 기존 로컬 개발 경험과 달라질 수 있습니다.
- Kakao 배포 도메인 등록이 누락되면 지도 SDK가 동작하지 않습니다.
- `KAKAO_REST_API_KEY` secret 이 없으면 장소 추천 API는 동작하지 않습니다.

## 레거시 백엔드

`legacy-spring-backend/` 는 비교와 참조를 위한 보존본입니다.

- Vercel 배포 대상이 아닙니다.
- 현재 간이 배포 흐름에서는 직접 실행하지 않습니다.
- 기존 DTO, 엔드포인트 계약, 도메인 구조를 확인할 때만 참고합니다.

## GitHub 업로드 전 체크

- `.env` 가 Git에 포함되지 않았는지 확인
- `npm run build` 가 통과하는지 확인
- Kakao / Supabase 실제 키는 Vercel과 Supabase 대시보드에만 등록
- `legacy-spring-backend/` 는 보존본임을 README와 docs 기준으로 유지

## 참고 문서

- [배포 절차 문서](docs/DEPLOYMENT.md)
- [환경변수 예시](.env.example)
- [Vercel 설정](vercel.json)
- [Supabase 스키마](supabase/migrations/202604040001_initial_schema.sql)
