# MAPLANDAR
<img width="1013" height="277" alt="MAPLANDAR 로고" src="https://github.com/user-attachments/assets/5ed721e9-ebbe-48db-9dae-111c572d473e" />

---

## 📌 프로젝트 개요


**프로젝트 배경** :
현대 사회에서는 다양한 인간관계 속에서 효율적인 일정 조율이 중요해지고 있다.
하지만 기존 캘린더 서비스는 위치 정보를 고려하지 않아 일정 조율에 불편함이 있다.
따라서 위치 기반 만남 장소 추천 기능이 포함된 새로운 공유 캘린더 시스템이 필요하다.

**프로젝트 목표** :  
1. 모임 조율 시 반복적인 커뮤니케이션 발생 => 공유 캘린더와 장소 추천을 통합하여 소통 과정을 간소화
2. 지인의 위치 정보 부재 => 일정 등록 시 위치 정보를 함께 입력
3. 공정하지 않은 약속 장소 => 그룹 구성원의 위치를 기반으로 중간 지점 도출
4. 기존 캘린더의 장소 추천 기능 부재 => 도출된 중간 지점 주변의 카페나 음식점 추천

**사용자가 일정을 서로 공유하고, 위치 정보를 기반으로 약속 장소를 추천해주는 공유 캘린더 시스템을 구축.** 

**개발 기간** : 2025/03 ~ 2025/07  

---

## 👥 팀 구성

| Name   | Position | GitHub / Blog |
|--------|----------|----------------|
| 홍성우 | PM(팀장) | [GitHub]() |
| 표선영 | FE | [GitHub]() |
| 최준서 | BE | [GitHub]() |
| 정예린 | DE | [GitHub]() |

---

## 🔧 기술 스택

### Frontend
- HTML, CSS, JavaScript, React, Redux Toolkit, Axios
- React-Toastify, Formik, Yup
- KaKao Map API

### Backend
- Spring Boot
- Spring Data JPA, MySQL
- KaKao Map API
  
### Collaboration & Tools
- Git, GitHub, Notion, Figma, Postman, VS Code, IntelliJ, Draw.io

---

## 🌐 배포 / 외부 링크

- **Notion 전체 문서** : [노션 바로가기](https://www.notion.so/1c690d0318b780aa976cd913b5097a41)
- **Notion 개인 기여 문서** : [노션 바로가기](https://www.notion.so/MAPLANDAR-272fbb5624cd80f4965fd733a8aad156)  
- **시연 영상 (YouTube)** : [보러가기](https://www.youtube.com/watch?v=CsLGKEjiS44)  
- **GitHub Repo**
  - [Frontend](https://github.com/pyosunyoung/MAPLANDAR)
  - [Backend](https://github.com/junseoch57/MAPLANDAR)

---


## 🧑‍💻 주요 기능

- 쿠키 세션 기반 로그인 및 회원가입
- 친구 맺기 기능
- 캘린더 그룹 생성, 조회, 삭제, 그룹 이름 수정
- 캘린더 일정 생성, 조회, 수정, 삭제
- kakao Map API 기반 중간 장소 추천 기능

---

## 💫 트러블슈팅

### 🚨 마커 중복 문제
- **원인**: displayMarker가 기존 마커 제거 없이 새로운 마커를 계속 추가 → 지도 성능 저하
- **해결**: `markerRefs`를 `useRef([])`로 관리, `removeMarkers` 함수로 기존 마커 삭제 후 새로 렌더링
- **배운 점**: 외부 라이브러리 객체는 상태 관리 외에 `useRef`를 통한 수동 관리가 필요하며, `useEffect`/`useCallback` 의존성 배열을 철저히 검토해야 함

---

### 🚨 사용자 장소 미표시 문제
- **원인**: 서버에서 받은 `userPlaces` 데이터의 좌표가 `string` 타입 → Kakao Map API는 `number` 필요
- **해결**: 데이터 전처리 시 `parseFloat()`로 변환하여 `displayMarker`에 전달
- **배운 점**: 외부 API 연동 시 데이터 타입 정합성이 중요하며, 좌표 유효성을 반드시 검증해야 함 => 타입스크립트 도입의 중요성

---

## 📂 디렉토리 구조 (예시)

---

## 📒 화면 구성

### 메인페이지
|로그인 전 | 로그인 후 |
|-------------|---------------|
| <img width="1269" height="938" alt="로그인전 메인페이지" src="https://github.com/user-attachments/assets/56c2fbbe-e786-4765-8fe2-0713b3569e57" /> | <img width="1278" height="939" alt="로그인 후 메인페이지" src="https://github.com/user-attachments/assets/6b50753c-ae21-4467-884f-cd4e045d4e4e" />|

### 회원가입 & 로그인
| 회원가입 |  로그인 |
|---------------|-------|
|<img width="1259" height="936" alt="회원가입" src="https://github.com/user-attachments/assets/9d8d94ad-38a3-4176-8f1a-02d75ac943f3" /> | <img width="1268" height="939" alt="로그인" src="https://github.com/user-attachments/assets/76202362-eb26-48b3-92f5-2d0b7ad40428" /> |

---

### 친구 관리
| 친구 목록| 친구 추가 | 친구 요청  |
|----------------|------------|------------|
| <img width="802" height="558" alt="친구창" src="https://github.com/user-attachments/assets/03363482-1bc0-4f26-999e-33244b2f7c4e" /> | <img width="1273" height="565" alt="친구 추가 모달창" src="https://github.com/user-attachments/assets/57d82751-6f34-446e-80d1-9ee225069752" /> | <img width="1289" height="552" alt="친구 요청 창" src="https://github.com/user-attachments/assets/1cc61732-b085-420b-8835-e81b488fef6b" /> | 

---

### 그룹 캘린더
<img width="1079" height="624" alt="그룹 캘린더 동작화면" src="https://github.com/user-attachments/assets/bd2017dc-4b13-4682-b392-753c53797406" />

---

### 중간 장소 추천
<img width="986" height="657" alt="중간 장소 추천 동작화면" src="https://github.com/user-attachments/assets/d367a1a1-38d9-4279-b006-862b3c585627" />

---

### 중간 장소 추천 결과
<img width="984" height="700" alt="중간 장소 추천 결과 동작화면" src="https://github.com/user-attachments/assets/bd6d4dc2-dc8c-4305-b220-539765697aa0" />


---



