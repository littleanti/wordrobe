# PLAN — Wordrobe 구현 계획

> PRD.md · TRD.md를 실행 가능한 단위로 분해한 로드맵.
> 작성일: 2026-05-29 · 버전: 0.1 (초안)

---

## 1. 전략

- **1인 또는 소규모 개발 가정.** 외주·디자이너 의존 최소화.
- **PWA를 먼저 완성**한 뒤 익스텐션/모바일 래퍼는 그 위에 얹는다. 핵심 로직을 어디서도 다시 쓰지 않는다.
- **각 마일스톤은 "사용자가 실제로 쓸 수 있는" 상태**로 끝낸다 (dogfooding).

---

## 2. 마일스톤 한눈에

| M | 목표 | 산출물 | 예상 소요 |
|---|---|---|---|
| M0 | 기초 결정 / 디자인 골격 | 와이어프레임, 도메인 확보, 리포 부트스트랩 | 3~5일 |
| M1 | **PWA MVP** (변환까지 작동) | wordrobe.app 베타 1 | 2~3주 |
| M2 | 크롬 익스텐션 | Chrome Web Store 비공개 베타 | 1~1.5주 |
| M3 | 모바일 래핑 (iOS/Android) | TestFlight + Internal Track | 2~3주 |
| M4 | 베타 → 정식 출시 | 스토어 심사 통과 + 랜딩 페이지 | 1~2주 |
| M5 | 검증 후 v2 후보 (멀티기기 동기화 등) | 별도 PRD | TBD |

---

## 3. M0 — 기초 결정

### 작업
- [x] **앱 이름 확정**: Wordrobe (2026-05-29)
- [ ] 도메인 가용성 확인 (`wordrobe.app` 1순위) — **사용자 작업**
- [ ] **로고 / 컬러 팔레트** 임시안 1쌍 — **사용자 작업** (현재 라이트 임시: 슬레이트 950 + 인디고 300)
- [x] **와이어프레임 3화면**: [WIREFRAMES.md](./WIREFRAMES.md)
- [x] Repo 부트스트랩 — Vite + React + TS + Tailwind + ESLint + Prettier + Vitest + vite-plugin-pwa
- [x] git 초기화 (local `main`)
- [ ] GitHub remote 생성 + 푸시 — **사용자 작업**
- [ ] Cloudflare Pages 연결 — **사용자 작업**
- [x] TRD §13 결정 사항 확정:
  - D-01 Android 패키징 → **Capacitor** (iOS와 통일)
  - D-02 익스텐션 저장소 → **iframe-bridge** (IndexedDB 단일 소스)

### 종료 조건
- `npm run dev` 로 3-탭 셸이 뜬다 ✅ (이번 세션에서 검증)
- `main` 푸시 시 Cloudflare Pages 자동 배포 확인 — 사용자 작업 후 검증

---

## 4. M1 — PWA MVP

### 4.1 작업 분해

**[A] 인프라**
- [x] PWA manifest + 아이콘셋 (192/512) — manifest 등록, 아이콘은 임시 SVG (PNG 192/512 추후)
- [x] vite-plugin-pwa, Workbox precache
- [x] CSP 헤더 (`public/_headers`)

**[B] 저장소 레이어**
- [x] Dexie 스키마 (`phrases`, `persona`) + Settings는 localStorage
- [x] Repo 패턴 (`phraseRepo`, `personaRepo`, `settingsRepo`)
- [x] JSON export/import

**[C] LLM 클라이언트**
- [x] `@google/genai` 통합 (`src/lib/gemini.ts`)
- [x] 스트리밍 응답 처리 (`stream()` async generator)
- [x] 키 마스킹 + 에러 분류 (401/429/5xx/network/unknown)
- [x] CSP `connect-src` 화이트리스트

**[D] 페르소나 엔진**
- [x] 분석 프롬프트 v1 (`src/lib/prompts.ts`)
- [x] 구조화 출력(`responseSchema`) → PERSONA.md 렌더러
- [x] 디바운스 (30초, `scheduleAutoAnalyze`)
- [x] 수동 트리거 버튼 (페르소나 페이지)
- [ ] 증분 캐시 (현재는 전체 분석 — 비용 체감 후 결정, D-03)

**[E] UI**
- [x] 첫 진입 온보딩 (API 키 입력 + 프라이버시 설명)
- [x] 3-탭 셸 (글귀 / 페르소나 / 변환)
- [x] 글귀 추가 모달 (텍스트 + 출처 URL + 태그)
- [x] 글귀 리스트 + 검색 (단순 includes; MiniSearch는 100+건에서 도입)
- [x] 페르소나 마크다운 뷰어/에디터 (수동 편집 지원)
- [x] 변환 화면 (입력창 + 스트리밍 + 1~3안 + 복사)
- [x] 토스트 시스템

**[F] 품질**
- [x] Vitest: 프롬프트 파서 / 렌더러 6 테스트 통과
- [ ] Vitest: 저장소 (`fake-indexeddb` 필요) — 도입 보류
- [ ] Playwright: 핵심 플로우 — M1 후반
- [ ] Lighthouse PWA 점수 90+ — 배포 후 측정

### 4.2 종료 조건
- 자기 자신이 일주일 dogfood 가능 (글귀 10개 이상 저장, 매일 2~3회 변환)
- `wordrobe.app` (또는 임시 도메인)에서 정상 동작
- 초기 사용자가 README만 보고 1분 안에 API 키 등록 → 첫 변환 도달

---

## 5. M2 — 크롬 익스텐션

### 작업
- [ ] Manifest V3 골격 (`background.ts`, `popup.html`)
- [ ] 컨텍스트 메뉴 "Wordrobe에 저장" — 드래그 텍스트 + URL 캡처
- [ ] 익스텐션 → 웹앱 저장소 브릿지 (TRD §4.2 결정에 따름)
- [ ] 팝업 미니 변환 UI
- [ ] Chrome Web Store 등록 자산 (스크린샷 5장, 1280×800)
- [ ] 개인정보 처리 방침 페이지

### 종료 조건
- 익스텐션 설치 → 임의 페이지에서 텍스트 드래그 → 메뉴 → 저장 → 웹앱에서 확인
- Chrome Web Store 비공개 베타 등록 완료

---

## 6. M3 — 모바일 래핑

### 6.1 공통
- [ ] Capacitor 6 도입 (`pnpm add @capacitor/core @capacitor/cli`)
- [ ] iOS · Android 프로젝트 생성
- [ ] 클립보드 / Share 플러그인 연동

### 6.2 Android
- [ ] AndroidManifest `intent-filter` (`ACTION_SEND`, `text/plain`)
- [ ] 첫 진입 시 받은 텍스트를 "글귀 저장" 또는 "멋지게 변환" 중 선택하게 라우팅
- [ ] Play Console 내부 테스트 트랙

### 6.3 iOS
- [ ] Share Extension (최소 Swift) → URL scheme `wordrobe://save?text=...`
- [ ] Capacitor URL scheme 핸들러
- [ ] TestFlight 빌드

### 6.4 종료 조건
- 실제 단말에서 브라우저 텍스트 선택 → 공유 → Wordrobe 수신 → 저장/변환
- 스토어 심사 제출 직전 상태

---

## 7. M4 — 출시

### 작업
- [ ] 랜딩 페이지 (정적 1페이지: 영상/스크린샷/CTA)
- [ ] 개인정보 처리 방침 / 이용약관 페이지 (변호사 템플릿 + Gemini 항목 명시)
- [ ] Chrome Web Store 정식 공개
- [ ] App Store / Play Store 심사 제출
- [ ] 익명 분석(클라이언트) 점등
- [ ] 한국 커뮤니티 1차 공유 (GeekNews, X)

### 종료 조건
- 3개 스토어 모두 "공개" 상태
- 가입→변환 도달률 측정 시작

---

## 8. 작업 우선순위 (M1 한정 Daily 시야)

P0 (없으면 출시 불가)
1. 온보딩(API 키) → 글귀 저장 → 페르소나 생성 → 변환의 End-to-End
2. Gemini 호출 오류 처리 (잘못된 키, 한도 초과)
3. JSON export (데이터 손실 안전망)

P1 (있어야 dogfood 됨)
4. 검색
5. 페르소나 수동 편집
6. 결과 복사 + 토스트

P2 (M1 끝에 시간 남으면)
7. 다크 모드
8. 다중 변환안(3안) UI
9. 다국어 UI

---

## 9. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| Gemini API 키 사용자 가입 마찰 | Activation 저하 | 가장 짧은 발급 가이드 동영상/스크린샷 임베드 |
| 변환 품질이 기대 미달 | Retention 저하 | 페르소나 분석 프롬프트 A/B + Pro 모델 토글 |
| iOS Share Extension 빌드 환경 (Mac 필요) | M3 지연 | M3 전에 Mac 임대/구입 결정 |
| Chrome Web Store 심사 거부 (권한 과다) | M2 지연 | 권한을 최소화, 명세에 사유 명기 |
| 도메인 `wordrobe.app` 선점 가능성 | 브랜드 손실 | M0 1일차에 확보. 차순위: `wordrobe.io`, `wordrobeapp.com` |
| 사용자가 키를 분실/노출 | 비용 폭주 | 키 입력 시 "Google 콘솔에서 도메인 잠금 권장" 안내 |

---

## 10. 결정 대기 체크리스트

PRD/TRD에서 보류된 사항을 M0~M1 사이에 정리한다.

- [x] **이름 확정**: Wordrobe / Eloq / Phrasr / Tonemate / Mellow 중 택1
- [x] **Android 패키징**: Capacitor (권장) vs TWA
- [x] **익스텐션 저장소 전략**: iframe-bridge vs chrome.storage 단독
- [ ] **유료 모델 도입 여부**: v1은 무료 가정. 향후 자체 키 옵션을 유료 토대로 검토.
- [ ] **자체 LLM 프록시 도입 시점**: 사용자가 "내 키 등록이 부담" 피드백 다수면 검토.

---

## 11. 예상 일정 (참고)

```
Week 1        : M0
Week 2 ~ 4    : M1 (PWA MVP) ── dogfood 시작
Week 5        : M2 (Chrome Extension) ── 익스텐션 베타
Week 6 ~ 8    : M3 (iOS/Android) ── TestFlight/Internal
Week 9        : M4 (출시) ── 스토어 심사 대기 포함
```

스토어 심사 변동성을 감안해 +1~2주 여유.

---

## 12. 다음 액션 (오늘 / 내일)

1. 앱 이름 후보 5개를 30분 안에 도메인·상표·발음 기준으로 검증 → 확정.
2. Figma에 와이어프레임 3화면 그리기.
3. GitHub repo 생성 + Vite/React/TS 부트스트랩 커밋.
4. Cloudflare Pages 연결.
5. Gemini API 키 받아 `@google/genai` "hello world" 호출 한 번 성공.

---

## 13. 관련 문서

- 제품 요구사항: [[prd]] (PRD.md)
- 기술 요구사항: [[trd]] (TRD.md)
