'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: 'fa' | 'en') => {
    if (locale === newLocale) return;

    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 bg-muted/70 backdrop-blur rounded-full p-1 border border-border">
      <Button
        suppressHydrationWarning
        variant={locale === 'fa' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('fa')}
        className={cn(
          'rounded-full px-5 transition-all duration-200',
          locale === 'fa' && 'shadow-sm font-semibold'
        )}
      >
        فارسی
      </Button>
      <Button
        suppressHydrationWarning
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('en')}
        className={cn(
          'rounded-full px-5 transition-all duration-200',
          locale === 'en' && 'shadow-sm font-semibold'
        )}
      >
        English
      </Button>
    </div>
  );
}