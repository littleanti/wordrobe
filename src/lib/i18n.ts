import { useApp } from './store';

export type UiLocale = 'ko' | 'en';

type Dict = Record<string, string>;

const ko: Dict = {
  // common
  'common.save': '저장',
  'common.cancel': '취소',
  'common.delete': '삭제',
  'common.edit': '편집',
  'common.copy': '복사',
  'common.copied': '복사됨',
  'common.loading': '불러오는 중...',
  'common.more': '더보기',

  // app / nav
  'nav.phrases': '글귀',
  'nav.persona': '페르소나',
  'nav.compose': '변환',
  'app.docTitle': 'Wordrobe — 내가 닮고 싶은 말의 옷장',

  // api key status
  'apiStatus.ready': 'Gemini 준비됨',
  'apiStatus.newKeyPlaceholder': '새 API 키',
  'apiStatus.changeKey': 'API 키 변경',
  'toast.apiKeyUpdated': 'API 키를 갱신했습니다.',

  // onboarding
  'onboarding.enterKey': 'API 키를 입력해주세요.',
  'onboarding.checkPrivacy': '프라이버시 안내를 확인해주세요.',
  'onboarding.welcomeToast': 'Wordrobe에 오신 걸 환영합니다.',
  'onboarding.welcomeTitle': 'Wordrobe에 오신 걸 환영합니다',
  'onboarding.subtitle': '내가 닮고 싶은 말의 옷장.',
  'onboarding.desc': '변환은 Google AI Studio (Gemini) 를 사용합니다. 본인 API 키를 입력해주세요.',
  'onboarding.keyLabel': 'Gemini API Key',
  'onboarding.getKey': 'AI Studio에서 키 발급받기',
  'onboarding.privacyNote': '본 기기에만 저장되며, 외부 서버로 전송되지 않음을 이해했습니다. (LLM 호출은 브라우저 → Google 직통)',
  'onboarding.start': '시작하기',

  // phrase card
  'phraseCard.directInput': '직접 입력',
  'phraseCard.saved': '저장됨',

  // relative time
  'time.justNow': '방금 전',
  'time.minutesAgo': '{n}분 전',
  'time.hoursAgo': '{n}시간 전',
  'time.daysAgo': '{n}일 전',
  'time.monthsAgo': '{n}달 전',
  'time.yearsAgo': '{n}년 전',

  // add dialog
  'addDialog.enterBody': '본문을 입력해주세요.',
  'addDialog.savedToast': '글귀를 저장했습니다.',
  'addDialog.personaUpdated': '페르소나가 갱신되었습니다.',
  'addDialog.saveFailed': '저장 실패: {msg}',
  'addDialog.title': '글귀 추가',
  'addDialog.bodyPlaceholder': '어떤 글이 마음에 들었나요?',
  'addDialog.collapseExtra': '출처 · 태그 접기',
  'addDialog.expandExtra': '출처 URL · 태그 추가 (선택)',
  'addDialog.urlPlaceholder': '출처 URL (https://...)',
  'addDialog.tagsPlaceholder': '태그 (쉼표로 구분: stoic, 글쓰기)',
  'addDialog.saving': '저장 중...',
  'addDialog.save': '저장하기',

  // phrases page
  'phrases.confirmDelete': '이 글귀를 삭제할까요?',
  'phrases.deletedToast': '삭제했습니다.',
  'phrases.exportedToast': 'JSON으로 내보냈습니다.',
  'phrases.confirmImport': '기존 데이터를 대체할까요?\n확인=대체 / 취소=병합',
  'phrases.importDone': '가져오기 완료',
  'phrases.importFailed': '가져오기 실패: {msg}',
  'phrases.searchPlaceholder': '검색...',
  'phrases.export': '내보내기',
  'phrases.import': '가져오기',
  'phrases.addAria': '글귀 추가',
  'phrases.all': '전체',
  'phrases.countSuffix': '{n}개',
  'phrases.noResults': '검색 결과가 없습니다.',
  'phrases.emptyTitle': '아직 모은 글귀가 없어요',
  'phrases.noResultsHint': '다른 검색어를 시도해보세요.',
  'phrases.emptyHint': '마음에 드는 글귀를 저장해보세요.',
  'phrases.firstAdd': '첫 글귀 추가하기',

  // persona page
  'persona.analyzeSkipped': '분석을 건너뛰었습니다.',
  'persona.updatedToast': '페르소나를 갱신했습니다.',
  'persona.manualSaved': '수동 수정 사항을 저장했습니다.',
  'persona.title': '내 페르소나',
  'persona.analyzing': '분석 중...',
  'persona.reanalyze': '재분석',
  'persona.analyze': '분석',
  'persona.metaLine': 'v{version} · 갱신 {time} · 글귀 {n}개',
  'persona.emptyMeta': '현재 글귀 {n}개 (분석은 {min}개 이상부터)',
  'persona.emptyTitle': '글귀를 모으면 페르소나가 만들어집니다',
  'persona.currentCount': '현재 글귀 {n}개',
  'persona.fullscreen': '전체화면',
  'persona.minimize': '축소',
  'persona.editTitle': '페르소나 편집',

  // compose page
  'compose.enterText': '변환할 문장을 입력하세요.',
  'compose.copiedToast': '클립보드에 복사했습니다.',
  'compose.copyFailed': '복사에 실패했습니다.',
  'compose.noPersona1': '페르소나가 아직 없습니다. 결과는 일반 톤으로 나옵니다.',
  'compose.noPersona2': '글귀 탭에서 글귀를 모은 뒤 페르소나 탭에서 분석해보세요.',
  'compose.inputPlaceholder': '자유롭게 쓰세요…',
  'compose.count': '안 수',
  'compose.transforming': '변환 중…',
  'compose.submit': '✨ 멋지게',

  // persona analysis skip reasons (lib/persona.ts)
  'persona.skipTooFew': '글귀가 {min}개 미만 ({n}개)',
  'persona.skipNoKey': 'API 키 미설정',

  // gemini errors (lib/gemini.ts)
  'error.auth': 'API 키가 유효하지 않습니다. 설정에서 키를 다시 확인해주세요.',
  'error.rate': 'Google AI Studio 사용 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
  'error.server': 'Gemini 서버 오류입니다. 잠시 후 다시 시도해주세요.',
  'error.network': '네트워크 오류입니다. 연결을 확인해주세요.',
  'error.unknown': '알 수 없는 오류',
  'error.emptyKey': 'API 키가 비어 있습니다.',
  'error.emptyResponse': '빈 응답을 받았습니다.',
  'error.unsupportedSchema': '지원하지 않는 스키마: {schema}',
};

const en: Dict = {
  // common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.copy': 'Copy',
  'common.copied': 'Copied',
  'common.loading': 'Loading...',
  'common.more': 'More',

  // app / nav
  'nav.phrases': 'Phrases',
  'nav.persona': 'Persona',
  'nav.compose': 'Compose',
  'app.docTitle': 'Wordrobe — a wardrobe of words you admire',

  // api key status
  'apiStatus.ready': 'Gemini ready',
  'apiStatus.newKeyPlaceholder': 'New API key',
  'apiStatus.changeKey': 'Change API key',
  'toast.apiKeyUpdated': 'API key updated.',

  // onboarding
  'onboarding.enterKey': 'Please enter your API key.',
  'onboarding.checkPrivacy': 'Please confirm the privacy notice.',
  'onboarding.welcomeToast': 'Welcome to Wordrobe.',
  'onboarding.welcomeTitle': 'Welcome to Wordrobe',
  'onboarding.subtitle': 'A wardrobe of words you want to emulate.',
  'onboarding.desc': 'Compose uses Google AI Studio (Gemini). Please enter your own API key.',
  'onboarding.keyLabel': 'Gemini API Key',
  'onboarding.getKey': 'Get a key from AI Studio',
  'onboarding.privacyNote': 'I understand it is stored only on this device and never sent to external servers. (LLM calls go browser → Google directly.)',
  'onboarding.start': 'Get started',

  // phrase card
  'phraseCard.directInput': 'Manual entry',
  'phraseCard.saved': 'Saved',

  // relative time
  'time.justNow': 'just now',
  'time.minutesAgo': '{n}m ago',
  'time.hoursAgo': '{n}h ago',
  'time.daysAgo': '{n}d ago',
  'time.monthsAgo': '{n}mo ago',
  'time.yearsAgo': '{n}y ago',

  // add dialog
  'addDialog.enterBody': 'Please enter some text.',
  'addDialog.savedToast': 'Phrase saved.',
  'addDialog.personaUpdated': 'Persona updated.',
  'addDialog.saveFailed': 'Save failed: {msg}',
  'addDialog.title': 'Add phrase',
  'addDialog.bodyPlaceholder': 'What words caught your eye?',
  'addDialog.collapseExtra': 'Hide source · tags',
  'addDialog.expandExtra': 'Add source URL · tags (optional)',
  'addDialog.urlPlaceholder': 'Source URL (https://...)',
  'addDialog.tagsPlaceholder': 'Tags (comma-separated: stoic, writing)',
  'addDialog.saving': 'Saving...',
  'addDialog.save': 'Save',

  // phrases page
  'phrases.confirmDelete': 'Delete this phrase?',
  'phrases.deletedToast': 'Deleted.',
  'phrases.exportedToast': 'Exported as JSON.',
  'phrases.confirmImport': 'Replace existing data?\nOK = replace / Cancel = merge',
  'phrases.importDone': 'Import complete',
  'phrases.importFailed': 'Import failed: {msg}',
  'phrases.searchPlaceholder': 'Search...',
  'phrases.export': 'Export',
  'phrases.import': 'Import',
  'phrases.addAria': 'Add phrase',
  'phrases.all': 'All',
  'phrases.countSuffix': '{n} items',
  'phrases.noResults': 'No results found.',
  'phrases.emptyTitle': 'No phrases collected yet',
  'phrases.noResultsHint': 'Try a different search term.',
  'phrases.emptyHint': 'Save the words you love.',
  'phrases.firstAdd': 'Add your first phrase',

  // persona page
  'persona.analyzeSkipped': 'Analysis skipped.',
  'persona.updatedToast': 'Persona updated.',
  'persona.manualSaved': 'Manual edits saved.',
  'persona.title': 'My Persona',
  'persona.analyzing': 'Analyzing...',
  'persona.reanalyze': 'Re-analyze',
  'persona.analyze': 'Analyze',
  'persona.metaLine': 'v{version} · updated {time} · {n} phrases',
  'persona.emptyMeta': '{n} phrases so far (analysis starts at {min}+)',
  'persona.emptyTitle': 'Collect phrases to build your persona',
  'persona.currentCount': '{n} phrases so far',
  'persona.fullscreen': 'Fullscreen',
  'persona.minimize': 'Minimize',
  'persona.editTitle': 'Edit persona',

  // compose page
  'compose.enterText': 'Please enter text to transform.',
  'compose.copiedToast': 'Copied to clipboard.',
  'compose.copyFailed': 'Copy failed.',
  'compose.noPersona1': 'No persona yet. Results will use a neutral tone.',
  'compose.noPersona2': 'Collect phrases in the Phrases tab, then analyze in the Persona tab.',
  'compose.inputPlaceholder': 'Write freely…',
  'compose.count': 'Count',
  'compose.transforming': 'Transforming…',
  'compose.submit': '✨ Polish',

  // persona analysis skip reasons (lib/persona.ts)
  'persona.skipTooFew': 'Fewer than {min} phrases ({n})',
  'persona.skipNoKey': 'API key not set',

  // gemini errors (lib/gemini.ts)
  'error.auth': 'Invalid API key. Please re-check it in settings.',
  'error.rate': 'Google AI Studio usage limit exceeded. Please try again shortly.',
  'error.server': 'Gemini server error. Please try again shortly.',
  'error.network': 'Network error. Please check your connection.',
  'error.unknown': 'Unknown error',
  'error.emptyKey': 'API key is empty.',
  'error.emptyResponse': 'Received an empty response.',
  'error.unsupportedSchema': 'Unsupported schema: {schema}',
};

const dicts: Record<UiLocale, Dict> = { ko, en };

export type TranslateParams = Record<string, string | number>;

export function translate(locale: UiLocale, key: string, params?: TranslateParams): string {
  const dict = dicts[locale] ?? ko;
  let s = dict[key] ?? ko[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return s;
}

export type TFn = (key: string, params?: TranslateParams) => string;

/** React hook: returns a translator bound to the current UI locale. */
export function useT(): TFn {
  const locale = useApp((s) => s.settings.uiLocale);
  return (key, params) => translate(locale, key, params);
}

/** React hook: current UI locale. */
export function useLocale(): UiLocale {
  return useApp((s) => s.settings.uiLocale);
}

/**
 * Non-hook translator for use outside React (services, error classes).
 * Reads the current UI locale from the store at call time.
 */
export function tStatic(key: string, params?: TranslateParams): string {
  return translate(useApp.getState().settings.uiLocale, key, params);
}

/**
 * Resolve the language the LLM should WRITE its output in.
 * `language` is the explicit output-language setting:
 *   - 'ko' | 'en' → use that language directly
 *   - 'auto'      → follow the UI language (uiLocale)
 */
export function resolveContentLocale(settings: {
  language: 'ko' | 'en' | 'auto';
  uiLocale: UiLocale;
}): UiLocale {
  return settings.language === 'auto' ? settings.uiLocale : settings.language;
}
