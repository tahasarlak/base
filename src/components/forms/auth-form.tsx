'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import * as authActions from '@/lib/actions/auth';
import AuthButtons from '@/components/common/auth-buttons';

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر باید باشد'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'نام حداقل ۲ کاراکتر باید باشد'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(8, 'رمز عبور حداقل ۸ کاراکتر باید باشد'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthForm() {
  const t = useTranslations('auth');
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isPending, startTransition] = useTransition();
  const [forgotMode, setForgotMode] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onLogin = (data: LoginForm) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    startTransition(async () => {
      try {
        await authActions.loginWithEmail(formData);
      } catch (err: any) {
        if (!err.digest?.startsWith('NEXT_REDIRECT')) {
          toast.error(err.message || t('loginFailed') || 'ورود ناموفق بود');
        }
      }
    });
  };

  const onRegister = (data: RegisterForm) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);

    startTransition(async () => {
      try {
        await authActions.registerWithEmail(formData);
      } catch (err: any) {
        if (!err.digest?.startsWith('NEXT_REDIRECT')) {
          toast.error(err.message || t('registerFailed') || 'ثبت‌نام ناموفق بود');
        }
      }
    });
  };

  const handleMagicLink = async () => {
    const email = loginForm.getValues('email');
    if (!email) return toast.error(t('enterEmail') || 'لطفاً ایمیل وارد کنید');

    const formData = new FormData();
    formData.append('email', email);

    startTransition(async () => {
      try {
        await authActions.sendMagicLink(formData);
        toast.success(t('magicLinkSent') || 'لینک ورود به ایمیل ارسال شد');
      } catch (err: any) {
        toast.error(err.message || 'ارسال لینک با مشکل مواجه شد');
      }
    });
  };

  const handleResetPassword = async () => {
    const email = loginForm.getValues('email');
    if (!email) return toast.error(t('enterEmail') || 'لطفاً ایمیل وارد کنید');

    const formData = new FormData();
    formData.append('email', email);

    startTransition(async () => {
      try {
        await authActions.requestPasswordReset(formData);
        toast.success(t('resetLinkSent') || 'لینک ریست ارسال شد');
        setForgotMode(false);
      } catch (err: any) {
        toast.error(err.message || 'ارسال لینک ریست ناموفق بود');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md glass shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              ⚡
            </div>
            <CardTitle className="text-3xl font-bold">{t('welcome')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t('login')}</TabsTrigger>
                <TabsTrigger value="register">{t('register')}</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                {!forgotMode ? (
                  <>
                    {/* Login Tab */}
                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">{t('email')}</Label>
                          <Input
                            id="email"
                            type="email"
                            {...loginForm.register('email')}
                            placeholder="name@example.com"
                          />
                          {loginForm.formState.errors.email && (
                            <p className="text-sm text-destructive">
                              {loginForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">{t('password')}</Label>
                          <Input
                            id="password"
                            type="password"
                            {...loginForm.register('password')}
                          />
                          {loginForm.formState.errors.password && (
                            <p className="text-sm text-destructive">
                              {loginForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                          {isPending ? 'در حال ورود...' : t('loginButton')}
                        </Button>
                      </form>

                      <div className="flex justify-between text-sm">
                        <Button
                          variant="link"
                          onClick={handleMagicLink}
                          disabled={isPending}
                          className="px-0 text-primary"
                        >
                          {t('magicLink')}
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => setForgotMode(true)}
                          className="px-0 text-primary"
                        >
                          {t('forgotPassword')}
                        </Button>
                      </div>

                      <Separator />
                      <AuthButtons />
                    </TabsContent>

                    {/* Register Tab */}
                    <TabsContent value="register" className="space-y-4">
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t('name')}</Label>
                          <Input id="name" {...registerForm.register('name')} />
                          {registerForm.formState.errors.name && (
                            <p className="text-sm text-destructive">
                              {registerForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">{t('email')}</Label>
                          <Input id="email" type="email" {...registerForm.register('email')} />
                          {registerForm.formState.errors.email && (
                            <p className="text-sm text-destructive">
                              {registerForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password">{t('password')}</Label>
                          <Input id="password" type="password" {...registerForm.register('password')} />
                          {registerForm.formState.errors.password && (
                            <p className="text-sm text-destructive">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                          {isPending ? 'در حال ثبت‌نام...' : t('registerButton')}
                        </Button>
                      </form>

                      <Separator />
                      <AuthButtons isLogin={false} />
                    </TabsContent>
                  </>
                ) : (
                  /* Forgot Password Mode */
                  <div className="space-y-6 py-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold">{t('resetPassword')}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('resetPasswordDescription')}
                      </p>
                    </div>
                    <Button onClick={handleResetPassword} className="w-full" disabled={isPending}>
                      {isPending ? 'در حال ارسال...' : t('sendReset')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setForgotMode(false)}
                      className="w-full"
                    >
                      {t('backToLogin')}
                    </Button>
                  </div>
                )}
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}