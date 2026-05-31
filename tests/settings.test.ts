import { describe, expect, it } from 'vitest';
import { detectUiLocale } from '../src/lib/repos/settingsRepo';

describe('detectUiLocale', () => {
  it('returns ko when Korean is the preferred language', () => {
    expect(detectUiLocale(['ko-KR', 'en-US'])).toBe('ko');
  });

  it('returns en when English is preferred over Korean (order respected)', () => {
    expect(detectUiLocale(['en-US', 'ko-KR'])).toBe('en');
  });

  it('matches bare language codes without region', () => {
    expect(detectUiLocale(['ko'])).toBe('ko');
    expect(detectUiLocale(['en'])).toBe('en');
  });

  it('picks the first recognized language, skipping unknown ones', () => {
    expect(detectUiLocale(['fr-FR', 'de', 'ko'])).toBe('ko');
    expect(detectUiLocale(['fr-FR', 'en-GB'])).toBe('en');
  });

  it('falls back to en for entirely unrecognized languages', () => {
    expect(detectUiLocale(['fr-FR', 'de-DE'])).toBe('en');
  });

  it('falls back to en for an empty list', () => {
    expect(detectUiLocale([])).toBe('en');
  });

  it('is case-insensitive and ignores empty entries', () => {
    expect(detectUiLocale(['', 'KO-kr'])).toBe('ko');
  });
});
