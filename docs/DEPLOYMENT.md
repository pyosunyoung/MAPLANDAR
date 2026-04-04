# Deployment Guide

## 개요

이 저장소의 간이 배포 구조는 다음을 전제로 합니다.

- 프런트엔드: Vercel
- 인증/DB/API: Supabase
- 지도/추천:
  - Kakao JavaScript SDK
  - Kakao Local REST API

기존 Spring Boot 서버를 Vercel에 그대로 올리는 방식은 사용하지 않습니다.

## 1. GitHub 업로드

루트에서 아래를 확인합니다.

```bash
git status
```

확인 포인트:

- `.env` 는 추적되지 않아야 함
- `node_modules`, `build`, `.vercel`, `.supabase` 는 무시되어야 함
- `legacy-spring-backend/` 는 보존본으로 포함 가능

## 2. Supabase 프로젝트 생성

Supabase 대시보드에서 새 프로젝트를 만듭니다.

필요한 값:

- `Project URL`
- `anon public key`
- `service_role key`

## 3. Supabase 스키마 반영

로컬 CLI를 쓸 경우:

```bash
npm run supabase:start
npm run supabase:db:push
```

원격 프로젝트에 반영하려면 Supabase CLI 로그인 후 링크가 필요합니다.

예시:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

## 4. Supabase Edge Function 설정

로컬 확인:

```bash
npm run supabase:functions:serve
```

배포:

```bash
npx supabase functions deploy app
```

필수 secret:

```bash
npx supabase secrets set KAKAO_REST_API_KEY=YOUR_KAKAO_REST_API_KEY
```

## 5. Supabase Auth 설정

권장 설정:

- Email auth 활성화
- Redirect URL 에 Vercel 도메인 추가
- 필요 시 이메일 확인 비활성화 또는 SMTP 설정

프런트에서 기대하는 로그인 흐름은 즉시 세션 생성 방식에 가깝습니다.  
기본 이메일 확인 정책을 그대로 둘 경우 회원가입 후 바로 로그인 UX가 달라질 수 있습니다.

## 6. Vercel 프로젝트 생성

GitHub 저장소를 Vercel에 연결합니다.

프레임워크:

- Create React App

빌드 관련:

- Build Command: `npm run build`
- Output Directory: `build`

현재 [`vercel.json`](../vercel.json) 에 SPA rewrite 가 포함되어 있습니다.

## 7. Vercel 환경변수 등록

필수:

```env
REACT_APP_API_BASE_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/app
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
REACT_APP_KAKAO_JS_KEY=YOUR_KAKAO_JAVASCRIPT_KEY
```

주의:

- `service_role key` 는 Vercel 프런트 환경변수에 넣지 않음
- Kakao REST 키도 프런트에 넣지 않음

## 8. Kakao Developers 설정

필수 작업:

- JavaScript 키 확인
- 사이트 도메인에 Vercel 배포 도메인 등록
- 필요한 경우 프리뷰 도메인도 추가

누락 시 증상:

- Kakao 지도 SDK 로드 실패
- geocoder 동작 실패

## 9. 배포 후 점검 순서

1. 회원가입
2. 로그인
3. 홈에서 그룹 목록 조회
4. 친구 요청/수락
5. 그룹 생성
6. 일정 생성
7. 장소 추천

## 10. 남는 제한점

- 완전한 운영 배포보다는 간이 배포 전환 목적의 구조입니다.
- 원본 Spring 서버의 예외 처리와 응답 세부 사항을 모두 복제하지는 않았습니다.
- 이메일 변경, 고급 프로필 관리, 운영용 접근제어 강화는 추가 작업이 필요합니다.

## 11. 추가 설치가 필요한 경우

클라우드 배포만 하면:

- 별도 Java/MySQL 설치 불필요
- Vercel 계정
- Supabase 계정
- Kakao Developers 앱

로컬에서 Supabase까지 직접 실행/검증하려면:

- Docker Desktop
- Node.js
- Supabase CLI

## 12. 권장 명령 모음

```bash
npm install
npm run build
npm run supabase:start
npm run supabase:db:push
npm run supabase:functions:serve
npx supabase functions deploy app
```
