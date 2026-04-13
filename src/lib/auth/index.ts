// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, organization, magicLink } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: 'Universal Platform',
  secret: process.env.BETTER_AUTH_SECRET,
  
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verificationTokens,
      organization: schema.organizations,
      organizationMember: schema.organizationMembers,
      auditLog: schema.auditLogs,
    },
  }),

  plugins: [
    admin({ 
      defaultRole: 'user',
      // اجازه می‌دهیم super_admin نقش اصلی را تغییر ندهد
      impersonation: true 
    }),
    organization({ 
      allowUserToCreateOrganization: true,
      maxOrganizationMembers: 100 
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: 'لینک ورود امن - Universal Platform',
          html: `
            <div style="direction: rtl; font-family: system-ui; max-width: 600px; margin: 0 auto;">
              <h2>ورود بدون رمز عبور</h2>
              <p>برای ورود به حساب خود روی لینک زیر کلیک کنید:</p>
              <a href="${url}" style="display: inline-block; padding: 14px 28px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px;">
                ورود به پلتفرم
              </a>
              <p style="margin-top: 20px; color: #666;">این لینک ۱۵ دقیقه معتبر است.</p>
            </div>
          `,
        });
      },
    }),
    nextCookies(),
  ],

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        required: true,
      },
      bio: { type: 'string' },
      phone: { type: 'string' },
      location: { type: 'string' },
      website: { type: 'string' },
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'universal',
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // ۳۰ روز
    updateAge: 60 * 60 * 24,
  },
});

// تابع ارسال ایمیل (کمکی)
async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    await resend.emails.send({
      from: 'no-reply@universalplatform.com',
      to,
      subject,
      html,
    });
  } catch (error) {
    logger.error('Failed to send email', error);
  }
}