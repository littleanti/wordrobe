import type { PersonaMemory, Phrase } from './types';

export const PERSONA_ANALYSIS_SYSTEM = `당신은 한국어/영어 텍스트에서 작가의 톤과 문체를 추출하는 분석가입니다.
사용자가 모은 글귀들을 보고, 이 사람이 닮고 싶어하는 말투의 특징을 구조화해서 반환합니다.
판단 근거가 약하면 추측하지 말고 빈 배열을 반환하세요.`;

export function buildPersonaAnalysisUserPrompt(phrases: Phrase[]): string {
  const lines = phrases.map((p, i) => {
    const src = p.sourceUrl ? ` (출처: ${p.sourceUrl})` : '';
    return `[${i + 1}] ${p.text}${src}`;
  });
  return [
    '아래 글귀들을 분석해주세요.',
    '',
    ...lines,
    '',
    '다음 JSON 스키마로 답하세요:',
    '- toneKeywords: 톤 형용사 3-7개 (예: "차분한", "단호한")',
    '- signaturePhrases: 자주 등장하는 표현 패턴 0-5개 (실제 문장 일부 또는 패턴)',
    '- avoidPatterns: 이 톤에서 회피되는 표현 0-5개',
    '- backgroundTopics: 글귀들이 다루는 도메인/주제 키워드 2-6개',
  ].join('\n');
}

export const PERSONA_ANALYSIS_SCHEMA = {
  type: 'OBJECT',
  properties: {
    toneKeywords: { type: 'ARRAY', items: { type: 'STRING' } },
    signaturePhrases: { type: 'ARRAY', items: { type: 'STRING' } },
    avoidPatterns: { type: 'ARRAY', items: { type: 'STRING' } },
    backgroundTopics: { type: 'ARRAY', items: { type: 'STRING' } },
  },
  required: ['toneKeywords', 'signaturePhrases', 'avoidPatterns', 'backgroundTopics'],
} as const;

export function renderPersonaMarkdown(
  analysis: {
    toneKeywords: string[];
    signaturePhrases: string[];
    avoidPatterns: string[];
    backgroundTopics: string[];
  },
  sourceCount: number,
): string {
  const lines: string[] = [];
  lines.push('# Persona');
  lines.push('');
  lines.push(`_분석된 글귀: ${sourceCount}개_`);
  lines.push('');
  lines.push('## 톤');
  if (analysis.toneKeywords.length === 0) lines.push('- _(추출되지 않음)_');
  else analysis.toneKeywords.forEach((k) => lines.push(`- ${k}`));
  lines.push('');
  lines.push('## 자주 쓰는 표현');
  if (analysis.signaturePhrases.length === 0) lines.push('- _(추출되지 않음)_');
  else analysis.signaturePhrases.forEach((k) => lines.push(`- ${k}`));
  lines.push('');
  lines.push('## 회피할 표현');
  if (analysis.avoidPatterns.length === 0) lines.push('- _(없음)_');
  else analysis.avoidPatterns.forEach((k) => lines.push(`- ${k}`));
  lines.push('');
  lines.push('## 배경 주제');
  if (analysis.backgroundTopics.length === 0) lines.push('- _(추출되지 않음)_');
  else analysis.backgroundTopics.forEach((k) => lines.push(`- ${k}`));
  return lines.join('\n');
}

export function buildComposePrompt(persona: PersonaMemory | null, userInput: string, variantCount: number): string {
  const personaBlock = persona
    ? persona.rawMarkdown
    : '_(아직 페르소나가 없습니다. 일반적으로 명료하고 절제된 톤을 가정하세요.)_';

  return [
    '당신은 사용자가 모은 글귀들로부터 추출된 아래 페르소나의 톤을 따라 문장을 다듬는 라이팅 에디터입니다.',
    '의미는 반드시 유지하고, 톤·어휘·리듬만 페르소나에 맞추세요.',
    '과장하거나 새로운 정보를 추가하지 마세요.',
    '',
    '--- 페르소나 시작 ---',
    personaBlock,
    '--- 페르소나 끝 ---',
    '',
    `다음 문장을 위 페르소나의 톤으로 ${variantCount}가지 변형으로 다듬어주세요.`,
    `각 변형은 "①" "②" "③" 처럼 번호로 시작하고, 변형 사이에는 빈 줄을 둡니다.`,
    '본문 외 다른 설명/해설은 출력하지 않습니다.',
    '',
    '--- 입력 ---',
    userInput,
    '--- 입력 끝 ---',
  ].join('\n');
}

export function parseComposeVariants(text: string): { index: number; text: string }[] {
  const markers = ['①', '②', '③', '④', '⑤'];
  const parts: { index: number; text: string }[] = [];
  let current: { index: number; text: string } | null = null;
  for (const line of text.split('\n')) {
    const trimmed = line.replace(/^\s+/, '');
    const markerIdx = markers.findIndex((m) => trimmed.startsWith(m));
    if (markerIdx >= 0) {
      if (current) parts.push(current);
      current = { index: markerIdx + 1, text: trimmed.slice(markers[markerIdx].length).trim() };
    } else if (current) {
      current.text += (current.text ? '\n' : '') + line;
    }
  }
  if (current) parts.push(current);
  // Clean trailing whitespace per variant
  return parts.map((p) => ({ ...p, text: p.text.trim() })).filter((p) => p.text.length > 0);
}
