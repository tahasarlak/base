// src/i18n/config.ts
export const locales = ['fa', 'en'] as const;
export const defaultLocale = 'fa' as const;

export type Locale = (typeof locales)[number];