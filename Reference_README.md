# NaiClover

> 언어를 배우고 싶은 사람과 원어민을 연결하는 **언어 교환 소셜 플랫폼**

<img src="https://github.com/JHSasdf/NaiClover/assets/146299597/548b3c3a-8e12-4792-9427-41a65253d145" width="400" height="350" />

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=React&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?style=flat-square&logo=TypeScript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=Express&logoColor=white)](https://expressjs.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=flat-square&logo=Socket.io&logoColor=white)](https://socket.io)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=MySQL&logoColor=white)](https://www.mysql.com)
[![Railway](https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=flat-square&logo=Railway&logoColor=white)](https://railway.app)

---

## 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [기술 스택](#-기술-스택)
3. [화면 구성](#-화면-구성)
4. [주요 기능](#-주요-기능)
5. [시작 가이드](#-시작-가이드)
6. [폴더 구조](#-폴더-구조)
7. [버전 히스토리](#-버전-히스토리)

---

## 🌿 프로젝트 소개

**개발 기간:** 2025년 1월 15일 ~ 2월 6일 (3주, 5인 팀 프로젝트)

**현재 상태:** 팀 프로젝트 완료 후 개인 UI/UX 리팩토링 및 기능 개선 진행 함.

NaiClover는 외국어 학습자와 원어민이 **포스트·채팅·문법 교정**을 통해 서로 배우고 가르칠 수 있는 언어 교환 플랫폼입니다.

- 문화/언어 주제로 글을 올리고, 원어민에게 **문법 교정 피드백**을 받을 수 있습니다.
- 교정 이력은 **ErrorLog 페이지**에 자동으로 아카이빙되어 언제든 복습할 수 있습니다.
- 언어 강제 설정이 있는 그룹 채팅(MonoChat)으로 특정 언어만 사용하는 몰입 학습 환경을 제공합니다.

### 배포 주소

> https://nai-clova-production.up.railway.app/

> Railway를 통해 배포되어 있습니다. 아래 테스트 계정으로 바로 체험해볼 수 있습니다.

| 구분             | ID      | PW       |
| ---------------- | ------- | -------- |
| 메인 테스트 계정 | `test`  | `111111` |
| 서브 테스트 계정 | `test2` | `111111` |
| 서브 테스트 계정 | `test3` | `111111` |
| 서브 테스트 계정 | `test4` | `111111` |
| 서브 테스트 계정 | `test5` | `111111` |

---

## 🛠 기술 스택

### Frontend

| 기술             | 비고                          |
| ---------------- | ----------------------------- |
| React            | SPA 컴포넌트 기반 UI          |
| TypeScript       | 타입 안전성 확보              |
| React Router DOM | 클라이언트 사이드 라우팅      |
| SCSS             | 컴포넌트별 스코프 스타일 관리 |
| Bootstrap        | 그리드 시스템                 |
| Axios            | HTTP 클라이언트               |
| Socket.IO Client | 실시간 채팅                   |
| React Hook Form  | 폼 상태 관리                  |
| Swiper           | 이미지 캐러셀                 |

### Backend

| 기술                | 비고                               |
| ------------------- | ---------------------------------- |
| Express.js          | REST API 서버                      |
| TypeScript          | 서버 사이드 타입                   |
| Sequelize           | MySQL ORM                          |
| MySQL2              | DB 드라이버                        |
| Socket.IO           | 실시간 이벤트 서버                 |
| Multer + Cloudinary | 이미지 업로드 및 CDN 저장          |
| Bcrypt              | 비밀번호 해싱                      |
| Express Session     | 세션 기반 인증 (MySQL 세션 스토어) |

### 배포

| 기술       | 비고                                                     |
| ---------- | -------------------------------------------------------- |
| Railway    | 서버(Express) + MySQL DB 통합 호스팅, Git push 자동 배포 |
| Cloudinary | 이미지 클라우드 스토리지 (게시글·프로필 이미지)          |

---

## 🖥 화면 구성

### DB 구조도

<img src='./readme-assets/DB 구조도.png' width="600"/>

### 화면 흐름도

## <img src='./readme-assets/프론트엔드 아키텍처.png' width='600'/>

---

## ✨ 주요 기능

### 1. 피드 (문화 / 언어 포스트)

- 문화·언어 두 카테고리로 포스트 작성 및 조회
- 이미지 다중 업로드 (Cloudinary 저장), 좋아요 토글, 댓글
- 팔로우한 사용자의 글이 우선 정렬되는 팔로우 기반 피드

<p>
  <img src='./readme-assets/피드2.gif' width='32%'/>
  <img src='./readme-assets/피드3.gif' width='32%'/>
  <img src='./readme-assets/피드4.gif' width='32%'/>
</p>

### 2. 문법 교정 & ErrorLog

- 댓글/채팅 메시지에 교정을 달면 교정 전·후가 비교 UI로 표시
- 내가 받은 모든 교정 내역을 **ErrorLog 페이지**에서 한눈에 복습 가능

<p>
    <img src='./readme-assets/첨삭.gif' width='40%'/>
    <img src='./readme-assets/첨삭2.gif' width='40%'/>
</p>

### 3. 실시간 1:1 채팅

- Socket.IO 기반 실시간 채팅 (새로고침 없이 즉시 반영)
- 읽음 여부 추적, 채팅 메시지 교정 기록 별도 조회 가능

<p>
    <img src='./readme-assets/대화.gif' width='50%'/>
</p>

### 4. MonoChat (언어 강제 그룹 채팅)

- 방 개설 시 사용 언어(한/영/일/중/프/독 6종) 설정 → 해당 언어만 사용하도록 유도
- 언어별 전용 테마 UI, 실시간 참가자 수 표시, 초대 코드 참가 지원

<p>
    <img src='./readme-assets/단체대화.gif' width='50%'/>
</p>

### 5. 팔로우 & 알림

- 유저 팔로우/언팔로우, 팔로워·팔로잉 목록 조회
- 팔로우·좋아요·댓글·교정·MonoChat 5종 알림 통합 관리 + 개별 삭제

<p>
    <img src='./readme-assets/팔로우.gif' width='40%'/>
    <img src='./readme-assets/팔로우 알람.gif' width='40%'/>
</p>

### 마이페이지 & 유저 검색

- 프로필 이미지 변경, 자기소개 편집, 학습 언어 수정
- 비밀번호 변경 (클라이언트 유효성 검사 포함), 회원 탈퇴
- 닉네임으로 다른 사용자 프로필 검색 및 팔로우

---

### 세부 화면

#### - 로그인 · 회원가입

<p>
    <img src='./readme-assets/로그인.jpg' width='32%'/>
    <img src='./readme-assets/회원가입.jpg' width='32%'/>
    <img src='./readme-assets/회원가입2.jpg' width='32%'/>
</p>

#### - 에러로그

<p>
    <img src='./readme-assets/에러로그.jpg' width='50%'/>
</p>

#### - 마이페이지 / 설정페이지

<p>
    <img src='./readme-assets/마이 페이지.jpg' width='40%'/>
    <img src='./readme-assets/설정 페이지.jpg' width='40%'/>
</p>

#### - 프로필 이미지 변경 창 / 기본이미지 제공(defalut)

<p>
    <img src='./readme-assets/프로필 이미지 변경.jpg' width='40%'/>
    <img src='./readme-assets/기본이미지 제공.jpg' width='40%'/>
</p>

---

## 🚀 시작 가이드

### 요구 사항

- Node.js 20.x
- MySQL 8.x
- Cloudinary 계정

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/JHSasdf/NaiClover.git
cd NaiClover

# 클라이언트 의존성 설치
cd client && npm install

# 서버 의존성 설치
cd ../server && npm install
```

### 환경변수 설정

`server/.env` 파일을 생성하고 아래 값을 채워주세요.

```env
# MySQL 접속 정보
MYSQLUSERNAME=root
MYSQLUSERPASSWORD=your_password
DATABASENAME=naiclover
SERVERIPNO=localhost
MYSQLPORT=3306

# 서버 설정
SERVERPORT=4000
SERVERURL=http://localhost:4000
CLIENTURL=http://localhost:3000
SECRETKEY=your-secret-key-32-chars-or-more

# Cloudinary (이미지 업로드용)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`client/.env` 파일을 생성하세요.

```env
REACT_APP_SERVERURL=http://localhost:4000
```

### 개발 서버 실행

```bash
# 클라이언트 (포트 3000)
cd client && npm start

# 서버 (포트 4000)
cd server && npm start

# 더미 데이터 시딩 (선택)
cd server && npm run seed
```

---

## 📁 폴더 구조

```
NaiClover/
├── client/                   # 프론트엔드 (React + TypeScript)
│   └── src/
│       ├── pages/            # 라우트 단위 페이지 컴포넌트 (18개)
│       ├── components/       # 도메인별 UI 컴포넌트 (40+개)
│       │   ├── postspage/
│       │   ├── postdetailpage/
│       │   ├── Mypage/
│       │   ├── alertpage/
│       │   ├── Modals/
│       │   └── chat/
│       ├── styles/           # SCSS 파일 (컴포넌트 1:1 매핑)
│       ├── types/            # TypeScript 인터페이스
│       └── utils/            # 날짜 포맷, 이미지 URL 변환 유틸
│
└── server/                   # 백엔드 (Express + TypeScript)
    ├── model/                # Sequelize 모델 (16개)
    ├── controllers/          # 비즈니스 로직 (8개)
    ├── routes/               # API 라우트 (8개)
    ├── config/               # DB, 세션, Multer/Cloudinary 설정
    ├── middlewares/          # 에러 핸들링
    ├── utils/                # 채팅방·메시지 생성 유틸
    └── app.ts                # Express + Socket.IO 서버 진입점
```

---

## 📝 버전 히스토리

### v1.1

- 그룹 채팅방 뒤로가기 시 현재 접속 인원 미반영 버그 수정
- ErrorLog 작성 후 새로고침 없이 즉시 반영되도록 수정
- 언어 포스트 댓글 삭제 버그 수정
- 마이페이지 팔로우 목록에서 상대방 이름 대신 내 이름이 표시되던 버그 수정
- 마이페이지 내 포스트에서 이름 대신 ID가 표시되던 버그 수정

### v1.2 (개인 리팩토링)

- 전체 폰트 시스템 통일 (`Font.scss` 기준 정비)
- 헤더·푸터·본문 컨테이너 폭 일관성 통일
- 국기 이미지 렌더링 오류 수정
- Socket.IO 이벤트 리스너 누수 수정 (`useEffect` cleanup 처리)
- `getPersonalRooms` 빈 채팅방 정렬 crash 수정
- 알림 삭제 기능 추가 (백엔드 API + 프론트 UI)
- 게시글 수정 페이지 추가 (`EditPostPage`)
- 마이페이지 클라이언트 유효성 검사 강화
- 로그인/회원가입 페이지 UI 리디자인
- AWS EC2 → Railway 플랫폼 전환, 이미지 스토리지 Cloudinary 마이그레이션

---

## 관련 링크

- **API 문서:** [Notion API 명세](https://shore-alley-14b.notion.site/naiClover-API-1f641843d2ce8302bb18816c1b41031c?pvs=74)
