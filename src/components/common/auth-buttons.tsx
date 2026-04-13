// src/components/common/auth-buttons.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth-client';
import { FaGithub } from "react-icons/fa";
import { FaChrome } from "react-icons/fa";
interface AuthButtonsProps {
  isLogin?: boolean;
}

export default function AuthButtons({ isLogin = true }: AuthButtonsProps) {
  const t = useTranslations('auth');

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: isLogin ? '/' : `/${isLogin ? '' : 'fa/auth'}`,
      });
    } catch (err: any) {
      toast.error(t('oauthError', { provider: provider === 'google' ? 'Google' : 'GitHub' }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-4 text-muted-foreground">{t('orContinueWith')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => handleOAuth('google')}
          className="gap-2 hover:bg-[#4285f4]/10 hover:text-[#4285f4] transition-colors"
          suppressHydrationWarning   // ← این رو اضافه کن
        >
          <FaChrome className="h-5 w-5" />  
          Google
        </Button>

        <Button
          variant="outline"
          onClick={() => handleOAuth('github')}
          className="gap-2 hover:bg-foreground/5 transition-colors"
          suppressHydrationWarning   // ← این رو اضافه کن
        >
          <FaGithub className="h-5 w-5" />
          GitHub
        </Button>
      </div>
    </div>
  );
}