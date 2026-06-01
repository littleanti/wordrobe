# TRD — Wordrobe

> PRD.md의 기능을 만족하기 위한 기술적 결정과 그 근거.
> 작성일: 2026-05-29 · 버전: 0.2
> 갱신: 2026-06-01 — 실제 출시 구현 반영 (GitHub Pages 배포, 단일 모델 `gemini-3.1-flash-lite`, `@google/genai` 2.7.0 + lazy 코드 스플릿, index.html meta CSP, 폰트 self-hosting).

---

## 1. 설계 원칙

1. **단일 코드베이스, 다중 배포** — 웹/익스텐션/모바일이 같은 PWA를 공유. 플랫폼 특화 코드는 어댑터 레이어에만.
2. **서버리스 by default** — 운영자는 정적 자산 호스팅 비용만 부담. LLM 호출은 브라우저 ↔ Google AI Studio 직통.
3. **로컬-퍼스트 데이터** — 글귀·페르소나·API 키는 모두 클라이언트 저장. 백업은 사용자 수동 export.
4. **점진적 향상** — 핵심 기능은 순수 PWA로 동작. 익스텐션·네이티브 래퍼는 부가 진입점.

---

## 2. 시스템 아키텍처 개요

```
                          ┌──────────────────────────────┐
                          │   Static Host (CDN)          │
                          │   - HTML / JS / SW           │
                          │   - manifest.webmanifest     │
                          └───────────────┬──────────────┘
                                          │ initial load only
                                          ▼
   ┌──────────────────────────────────────────────────────────────┐
   │   Client (Browser / Extension / PWA shell)                   │
   │                                                              │
   │   ┌──────────────┐   ┌──────────────────┐   ┌─────────────┐  │
   │   │  UI (React)  │   │  Persona Engine  │   │  LLM Client │  │
   │   └──────┬───────┘   └────────┬─────────┘   └──────┬──────┘  │
   │          │                    │                     │        │
   │          ▼                    ▼                     ▼        │
   │   ┌──────────────────────────────────────────────────────┐   │
   │   │  Storage Adapter                                     │   │
   │   │   - IndexedDB (Dexie) : phrases, persona, settings   │   │
   │   │   - chrome.storage.local : ext bridge (옵션)         │   │
   │   └──────────────────────────────────────────────────────┘   │
   └────────────────────────────────────┬─────────────────────────┘
                                        │ HTTPS (fetch)
                                        ▼
                          ┌──────────────────────────────┐
                          │  Google AI Studio (Gemini)   │
                          └──────────────────────────────┘
```

서버 측 구성요소: **없음**. 호스팅은 **GitHub Pages**로 확정 (§12 참조). 정적 자산만 전달.

---

## 3. 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프런트 프레임워크 | **Vite + React + TypeScript** | 정적 번들 단순. SSR 불필요. 익스텐션 빌드 친화. |
| 스타일 | Tailwind CSS | 빠른 프로토타입, 작은 런타임. |
| 상태 | Zustand (또는 Jotai) | Redux 오버스펙. localStorage 동기화 쉬움. |
| 저장소 | **IndexedDB via Dexie.js** | 글귀 N개 + 검색 색인. localStorage는 용량 한계. |
| 라우팅 | React Router (해시 라우팅) | 익스텐션 팝업/file:// 호환. |
| 검색 | MiniSearch (옵션) | 클라이언트 풀텍스트 검색. |
| LLM SDK | **`@google/genai` 2.7.0** (브라우저 ESM) | Gemini 공식 SDK. 스트리밍 지원. 무거우므로 동적 `import()`로 lazy 코드 스플릿(분석/변환 시점 로드). |
| PWA | Workbox + `vite-plugin-pwa` | 서비스워커, manifest 자동화. |
| 패키징 (모바일) | Capacitor 6 | iOS/Android 래퍼. 공유 시트 플러그인 활용. |
| 패키징 (Android Play) | TWA (Bubblewrap) 대안 검토 | 순수 PWA → 스토어 등록 옵션. |
| 익스텐션 | Manifest V3 | 컨텍스트 메뉴 + 백그라운드 SW. |
| 테스트 | Vitest + Playwright | 단위 + E2E. |

> **결정 보류**: Capacitor vs TWA. iOS는 PWA 단독 한계로 Capacitor가 거의 필수. Android는 둘 다 가능. [[plan-decision-mobile]]

---

## 4. 멀티플랫폼 전략

### 4.1 웹 (PWA) — 기본 진입점

- 정적 호스팅. HTTPS 필수 (SW, 클립보드 API 요구).
- `display: standalone`, 아이콘셋, 푸시 권한은 불필요.
- 첫 진입 시 API 키 입력 모달.

### 4.2 크롬 익스텐션

- **Manifest V3**, 권한:
  - `contextMenus` — "Wordrobe에 저장" 메뉴
  - `storage` — 익스텐션 전역 상태
  - `activeTab` — 현재 URL/선택 텍스트 접근
  - `clipboardWrite` — 결과 복사
- 구성:
  - `background.ts` (service worker): 컨텍스트 메뉴 등록, 저장 처리
  - `popup.html` → 웹앱의 미니 라우트 (`/#/popup`)
  - `content-script.ts`: 선택 텍스트 추출 보조 (필요 시)
- **데이터 공유 전략 (확정: iframe-bridge)**:
  - 익스텐션 팝업이 웹앱 origin(`https://littleanti.github.io`, 경로 `/wordrobe/`)을 iframe으로 임베드 → 웹앱과 익스텐션이 **동일 IndexedDB**를 공유. (※ origin이 GitHub Pages 서브패스이므로 Phase 2 착수 시 iframe-bridge 세부는 재검증 필요.)
  - 익스텐션 → iframe 간 통신은 `postMessage` (origin 검증 필수).
  - 컨텍스트 메뉴에서 캡처한 텍스트는 background SW → popup iframe `postMessage` 로 전달 후 IndexedDB write.
  - 백업 경로: 네트워크 단절 등 iframe 로드 실패 시 `chrome.storage.local` 큐잉 → 다음 연결 시 flush.

### 4.3 iOS (App Store)

- **Capacitor 래핑** 필수 이유: iOS Safari는 PWA가 공유 시트 수신을 못 함.
- 플러그인:
  - `@capacitor/share` (송신은 안 쓰지만 sheet 통합)
  - `@capacitor-community/share-extension` 또는 커스텀 Share Extension (Swift 소량) → 선택 텍스트 수신.
  - `@capacitor/clipboard`
- 빌드: Xcode 필요 (Mac 빌드 환경). → [[plan-mobile-build]]

### 4.4 Android (Play Store) — 확정: Capacitor

- iOS와 동일한 Capacitor 라인으로 통일 → 단일 CI/코드 경로.
- AndroidManifest의 `intent-filter` (`ACTION_SEND`, `text/plain`) 로 공유 인텐트 수신.
- Bubblewrap/TWA 경로는 채택하지 않음 (코드 분기·CI 이중화 비용이 출시 속도 이득보다 큼).

### 4.5 공유 시트 텍스트 수신 (모바일)

- iOS: Share Extension(Swift) → URL scheme `wordrobe://save?text=...` 로 메인 앱 호출
- Android: AndroidManifest의 intent-filter (`ACTION_SEND`, `text/plain`) → Capacitor 플러그인이 첫 화면에 텍스트 전달

---

## 5. 데이터 모델

### 5.1 엔티티

```ts
interface Phrase {
  id: string;            // ULID
  text: string;
  sourceUrl?: string;
  sourceTitle?: string;
  capturedAt: number;    // epoch ms
  tags?: string[];
  note?: string;
}

interface PersonaMemory {
  version: number;
  updatedAt: number;
  toneKeywords: string[];        // ex: 차분한, 단호한, 유머러스
  signaturePhrases: string[];    // 자주 쓰이는 표현 패턴
  avoidPatterns: string[];       // 회피 표현
  vocabulary: { word: string; weight: number }[];
  backgroundTopics: string[];    // 글귀에서 추출한 도메인 키워드
  rawMarkdown: string;           // 사람이 읽는 PERSONA.md
  sourcePhraseIds: string[];     // 어떤 글귀에서 만들어졌는지 역추적
}

interface Settings {
  apiKey: string;                // Gemini API key
  language: 'ko' | 'en' | 'auto';   // 변환 출력 언어 (auto = UI 언어 따름)
  uiLocale: 'ko' | 'en';
  autoAnalyze: boolean;          // 글귀 추가 후 자동 페르소나 분석 여부
  minPhrasesForAnalysis: number; // 분석 최소 글귀 수 (기본 5)
}
```

> **모델 선택 필드 없음.** 모든 LLM 호출은 단일 모델 `MODEL_ID`(`src/lib/types.ts`)로 통일 — 아래 §7.4 참조.

### 5.2 Dexie 스키마

```ts
db.version(1).stores({
  phrases: 'id, capturedAt, *tags',
  persona: 'version, updatedAt',
  settings: 'key',
});
```

---

## 6. 페르소나 메모리 생성 파이프라인

```
[phrases (N개)] ──▶ [front-end 전처리: 중복 제거, 길이 정규화]
                                │
                                ▼
                ┌─────────────────────────────┐
                │  Gemini 호출 (분석 프롬프트) │
                │  - 톤 키워드 추출           │
                │  - 자주 쓰는 표현 패턴      │
                │  - 회피 표현                │
                │  - 배경 도메인              │
                └──────────────┬──────────────┘
                                ▼
            [구조화 JSON 응답] → [PERSONA.md 마크다운 렌더]
                                ▼
                       [IndexedDB persona 갱신]
```

### 6.1 갱신 트리거
- 글귀 추가/삭제 후 디바운스 30초
- 글귀 수가 직전 분석 시점 대비 ±20% 변동 시 즉시
- 사용자 수동 트리거 버튼

### 6.2 비용 통제
- 분석 호출은 글귀 전체가 아니라 **요약 캐시**를 함께 보내 증분 갱신
- 사용자가 API 키 부담 주체이므로 호출 빈도를 설정에서 조절 가능

---

## 7. LLM 통합 (Gemini)

### 7.1 호출 위치
- 모든 호출은 **클라이언트에서 직접** `generativelanguage.googleapis.com` 으로 fetch
- 우리 도메인은 단 한 줄도 프록시 하지 않음

### 7.2 API 키 보관
- `localStorage` 에 평문 저장 (브라우저 보안 모델에 위임)
- 쿠키 미사용 — 서버로 자동 송신될 위험 차단
- UI에서는 마스킹 표시, "변경"/"삭제" 버튼으로만 재입력
- 첫 진입(온보딩)에서 BYOK 보안/프라이버시 풀 가이드 제공 (ko/en):
  - 키·글귀·페르소나는 이 브라우저(localStorage/IndexedDB)에만 저장, 앱 서버 미전송
  - 분석/변환 시 입력 텍스트와 키가 Google Gemini API로 직통 전송
  - 전용 키 발급 + Gemini API only 제한 + HTTP referrer `https://littleanti.github.io/wordrobe/*` 제한 권장
  - 예산/쿼터 알림 권장, 브라우저 데이터 삭제 시 복구 불가 안내

### 7.3 변환 프롬프트 (개요)

```
System:
  당신은 사용자의 톤을 정확히 모사하는 라이팅 에디터입니다.
  아래 페르소나를 따르고, 의미는 유지하되 톤만 바꾸세요.

Persona:
  {persona.rawMarkdown}

Task:
  다음 문장을 위 페르소나의 톤으로 다듬어 1~3개 변형을 제시:
  ---
  {userInput}
  ---
```

스트리밍 응답(SSE) 사용, 첫 토큰 도착 시 즉시 표시.

### 7.4 모델 (단일 모델로 통일)
- **모든 LLM 호출(변환 스트리밍 + 페르소나 분석)을 단일 모델 `gemini-3.1-flash-lite`로 처리.** 모델 선택 UI 없음.
- 모델 ID는 `src/lib/types.ts`의 `MODEL_ID` 한 곳에서만 관리.
- 페르소나 분석은 `responseSchema` 대신 **프롬프트 기반 JSON 지시 + 코드펜스 제거 파싱**(`gemini.ts`의 `extractJson`)으로 처리 — 모델 교체에 견고한 방식.

---

## 8. 저장소 전략

| 데이터 | 저장 위치 | 이유 |
|---|---|---|
| 글귀 / 페르소나 | IndexedDB | 용량 충분, 인덱싱 가능 |
| API 키 | localStorage | 키-값 단일. SW와 무관. |
| UI 설정 | localStorage | 빠른 동기 접근 |
| 익스텐션 전용 캐시 | chrome.storage.local | 익스텐션 컨텍스트 격리 |

**동기화**:
- v1은 단일 기기 가정. 사용자 수동 export/import (JSON 다운로드).
- v2+ 옵션: 사용자 본인 Google Drive App Folder. 여전히 서버 무관.

---

## 9. 키보드 확장 가능성 분석 {#keyboard}

| 플랫폼 | 가능성 | 비고 |
|---|---|---|
| **Gboard (Android)** | ✗ 공개 확장 API 없음 | Google이 제3자 툴바 버튼 허용 안 함 |
| **삼성 키보드** | ✗ 공개 SDK 없음 | |
| **iOS 기본 키보드** | ✗ Apple이 키보드 위 툴바 확장 미허용 | |
| **자체 IME (Android)** | △ 가능하지만 사용자가 시스템 키보드를 교체해야 함. 네이티브 코드 필요. | UX 마찰 큼. v1 권장 안 함. |
| **iOS Keyboard Extension** | △ 가능하지만 자체 키보드 앱이어야 하고 "전체 접근" 권한 필요 → 사용자 불신. | v1 권장 안 함. |

**결론**: v1에서는 **공유 시트 / 공유 인텐트**로 대체. "키보드 위 버튼" 경험은 OS 정책상 우회로가 사실상 없음. v3에서 자체 iOS 키보드 앱 별도 출시를 재검토.

---

## 10. 보안 & 프라이버시

- HTTPS 강제 (GitHub Pages 기본 제공)
- **CSP는 `index.html`의 `<meta http-equiv="Content-Security-Policy">`로 적용** (GitHub Pages는 Netlify/Cloudflare식 `_headers`를 무시하므로 `public/_headers`는 제거):
  - `default-src 'self'`, `connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com`, `object-src 'none'`, `script-src 'self'`(인라인 SW 등록 스크립트 미사용 → `injectRegister: 'script'`), `style-src 'self' 'unsafe-inline'`, `worker-src 'self'`(PWA SW)
- `<meta name="referrer" content="no-referrer">` 로 referrer 누출 차단
- **폰트 self-hosting** — 외부 CDN(jsdelivr Pretendard / Google Fonts) 제거, `font-family: Pretendard, -apple-system, …, system-ui` 시스템 폰트 스택만 사용 (공급망·프라이버시 리스크 감소)
- API 키 노출 방지:
  - DevTools 외에는 UI에서 평문 노출 안 함
  - 로그/에러 보고에 키 절대 포함 안 함 (에러 객체에서 필터)
- 운영자(나) → 사용자 데이터에 **물리적으로 접근 불가** (서버에 안 보냄)
- 의존성: `npm audit --omit=dev` 0건 (`@google/genai` 2.7.0 → `google-auth-library@10`/`gaxios@7`로 취약한 `uuid` 체인 제거)

---

## 11. 성능

- 번들 사이즈 목표 < 250KB gzip (초기) — **충족**: 초기 메인 청크 ~105KB gzip
- 코드 스플리팅: **Gemini SDK(`@google/genai`)를 동적 `import()`로 분리** → 별도 `gemini-*.js` 청크(~60KB gzip)로 분석/변환 시점에만 로드
- 글귀 100건까지 검색 < 50ms (현재 단순 includes; 100+건에서 MiniSearch 도입)
- Gemini 첫 토큰 < 1.5s (네트워크 의존)

---

## 12. 배포 & 인프라

| 구성 | 선택 |
|---|---|
| 호스팅 | **GitHub Pages** (프로젝트 사이트, `https://littleanti.github.io/wordrobe/`) |
| 빌드 base | Vite `base: '/wordrobe/'` — 서브패스 자산/PWA 경로 정합 |
| 라우팅 | **HashRouter** — Pages 서브패스에서 SPA 404 회피 (404.html 셈 불필요) |
| CI/CD | **GitHub Actions** (`.github/workflows/deploy-pages.yml`): `npm ci → npm test → npm run build → upload-pages-artifact → deploy-pages`. main push + workflow_dispatch 트리거. Pages Source = "GitHub Actions". |
| 자산 경로 | 절대경로 대신 `import.meta.env.BASE_URL` 기준 (예: 로고), 아이콘은 `./` 상대경로 |
| 주소창 색 | `index.html`의 `<meta name="theme-color">`를 브랜드 테마색 `#6366f1`로 통일 (PWA manifest `theme_color`와 일치). 모바일 Chrome 주소 표시창이 흰색 대신 테마색으로 표시 (persora 동일 방식) |
| 헤더 레이아웃 | 좌측 로고+타이틀 `min-w-0`+`truncate`(+로고 `flex-shrink-0`), 우측 액션 그룹(API 상태/언어) `flex-shrink-0`. API 키 편집 시 타이틀이 줄어들며 저장/취소/삭제가 한 줄로 가로 정렬 (persora `App.tsx`/`ApiKeyStatus.tsx` 동일) |
| 모니터링 | 클라이언트 Sentry (옵션, 키 마스킹 필터 필수) |
| 익명 분석 | (미도입) |

---

## 13. 결정 필요 사항

| ID | 결정 | 상태 |
|---|---|---|
| D-01 | Android 패키징 → **Capacitor** | ✅ 확정 2026-05-29. iOS와 단일 코드/CI. |
| D-02 | 익스텐션 ↔ 웹앱 저장소 → **iframe-bridge** | ✅ 확정 2026-05-29. IndexedDB 단일 소스. |
| D-03 | 페르소나 분석 빈도 기본값 | ✅ 자동 분석 on, 최소 글귀 5개(`minPhrasesForAnalysis`). |
| D-04 | 호스팅 → **GitHub Pages** (`littleanti.github.io/wordrobe`) | ✅ 확정 2026-06-01. 기존 Cloudflare Pages/`wordrobe.app` 안 대체. Vite base `/wordrobe/` + GitHub Actions 배포. |
| D-05 | LLM 모델 → **단일 `gemini-3.1-flash-lite`** | ✅ 확정. 모델 선택 UI 제거, `MODEL_ID` 단일 관리. |
| D-06 | LLM SDK → **`@google/genai` 2.x + lazy 스플릿** | ✅ 확정 2026-06-01. 0.3.1 취약점 해소 + 초기 번들 절감. |
| D-07 | 헤더 정렬 + 주소창 테마색 → **persora 동일화** | ✅ 확정 2026-06-02. `theme-color` `#f8fafc`→`#6366f1`. 헤더 `min-w-0`/`truncate`/`flex-shrink-0`로 API 키 편집 시 저장/취소/삭제 한 줄 가로 정렬. |

---

## 14. 관련 문서
- 제품 요구사항: [[prd]] (PRD.md)
- 구현 계획: [[plan]] (PLAN.md)
