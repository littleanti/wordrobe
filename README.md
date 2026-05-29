# Wordrobe

> 내가 닮고 싶은 말의 옷장.
> 멋진 글귀를 모아 페르소나 메모리를 만들고, 거친 문장을 그 톤으로 다듬어주는 멀티플랫폼 PWA.

## 문서
- [PRD.md](./PRD.md) — 제품 요구사항
- [TRD.md](./TRD.md) — 기술 요구사항
- [PLAN.md](./PLAN.md) — 마일스톤 / 작업 계획
- [WIREFRAMES.md](./WIREFRAMES.md) — 3화면 와이어프레임

## 빠른 시작

```bash
npm install
npm run dev      # http://localhost:5173
```

## 핵심 아키텍처

- 정적 PWA. 서버 없음.
- 모든 LLM 호출은 브라우저 → Google AI Studio (Gemini) 직통.
- 사용자 API 키는 `localStorage`에만 저장 — 외부로 전송되지 않음.
- 글귀·페르소나는 IndexedDB(Dexie) 로컬 저장.
