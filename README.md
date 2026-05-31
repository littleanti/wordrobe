# Wordrobe

> 내가 닮고 싶은 말의 옷장.
> 멋진 글귀를 모아 페르소나 메모리를 만들고, 거친 문장을 그 톤으로 다듬어주는 멀티플랫폼 PWA.

## 문서
- [docs/PRD.md](./docs/PRD.md) — 제품 요구사항
- [docs/TRD.md](./docs/TRD.md) — 기술 요구사항
- [docs/PLAN.md](./docs/PLAN.md) — 마일스톤 / 작업 계획
- [docs/WIREFRAMES.md](./docs/WIREFRAMES.md) — 3화면 와이어프레임

## 빠른 시작

```bash
npm install
npm run dev      # http://localhost:5173
```

## 핵심 아키텍처

- 정적 PWA. 서버 없음.
- 모든 LLM 호출은 브라우저 → Google AI Studio 직통.
- **단일 모델 `gemma-4-31b-it`** 로 모든 LLM 콜(글 다듬기 스트리밍 + 페르소나 분석)을 처리. 모델 선택 UI 없음. 모델 ID는 `src/lib/types.ts`의 `MODEL_ID` 한 곳에서 관리.
  - Gemma 계열은 구조화 출력(`responseSchema`)을 지원하지 않으므로, 페르소나 분석은 프롬프트 기반 JSON 지시 + 코드펜스 제거 파싱(`gemini.ts`의 `extractJson`)으로 처리.
- 사용자 API 키는 `localStorage`에만 저장 — 외부로 전송되지 않음.
- 글귀·페르소나는 IndexedDB(Dexie) 로컬 저장.
