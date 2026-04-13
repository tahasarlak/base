Universal Next.js Starter (Boilerplate)

یک استارتر کامل، تمیز و قابل استفاده برای **هر نوع پروژه** (لندینگ، داشبورد، فروشگاه، SaaS و ...)

## ویژگی‌های اصلی

- Next.js 15 (App Router + React 19) با `src/` directory
- TypeScript کامل با strict mode
- shadcn/ui + Tailwind CSS + فقط یک `globals.css`
- Dark mode کامل با next-themes
- i18n قوی با next-intl (فارسی + انگلیسی + RTL کامل)
- احراز هویت با **Better Auth** + Drizzle + PostgreSQL
- فرم‌ها با Zod + React Hook Form + Server Actions
- State Management: TanStack Query + Zustand
- PWA ready
- ESLint + Prettier + Husky

## ساختار پروژه
src/
├── app/
│   ├── [locale]/
│   │   ├── auth/           ← صفحه ورود/ثبت‌نام
│   │   ├── (main)/         ← صفحات اصلی (داشبورد و ...)
│   │   ├── layout.tsx
│   │   └── page.tsx
├── components/
│   ├── ui/                 ← کامپوننت‌های shadcn
│   ├── common/             ← Header, Footer, LanguageSwitcher, AuthButtons
│   ├── forms/              ← فرم‌های reusable
│   └── layout/
├── lib/
│   ├── db/                 ← Drizzle
│   ├── auth/               ← کانفیگ Better Auth
│   ├── actions/            ← Server Actions
│   ├── utils.ts
│   └── constants.ts
├── locales/                ← en.json + fa.json
├── i18n/
├── middleware.ts
text## نصب و راه‌اندازی

### ۱. کلون کردن پروژه

```bash
git clone <your-repo-url>
cd my-universal-starter