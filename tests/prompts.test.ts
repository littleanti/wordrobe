import { describe, expect, it } from 'vitest';
import { parseComposeVariants, renderPersonaMarkdown } from '../src/lib/prompts';

describe('parseComposeVariants', () => {
  it('extracts single variant', () => {
    const r = parseComposeVariants('① 안녕하세요.');
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({ index: 1, text: '안녕하세요.' });
  });

  it('extracts multiple variants with blank lines between', () => {
    const r = parseComposeVariants(
      ['① 첫 번째 변형 문장.', '', '② 두 번째 변형, 조금 더 부드럽게.', '', '③ 세 번째 변형.'].join(
        '\n',
      ),
    );
    expect(r.map((v) => v.index)).toEqual([1, 2, 3]);
    expect(r[1].text).toBe('두 번째 변형, 조금 더 부드럽게.');
  });

  it('handles multi-line variant bodies', () => {
    const r = parseComposeVariants('① 첫 줄.\n계속되는 두 번째 줄.\n\n② 다음 변형.');
    expect(r).toHaveLength(2);
    expect(r[0].text).toBe('첫 줄.\n계속되는 두 번째 줄.');
  });

  it('returns empty array when no markers', () => {
    expect(parseComposeVariants('아무 마커도 없습니다.')).toEqual([]);
  });

  it('trims whitespace and skips empty variants', () => {
    const r = parseComposeVariants('①   \n② 정상.\n');
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual({ index: 2, text: '정상.' });
  });
});

describe('renderPersonaMarkdown', () => {
  it('produces sections for all categories', () => {
    const md = renderPersonaMarkdown(
      {
        toneKeywords: ['차분한', '단호한'],
        signaturePhrases: ['결국에는'],
        avoidPatterns: [],
        backgroundTopics: ['글쓰기', 'stoicism'],
      },
      12,
    );
    expect(md).toMatch(/# Persona/);
    expect(md).toMatch(/_분석된 글귀: 12개_/);
    expect(md).toMatch(/## 톤[\s\S]*차분한[\s\S]*단호한/);
    expect(md).toMatch(/## 회피할 표현[\s\S]*\(없음\)/);
  });
});
