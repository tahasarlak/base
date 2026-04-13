import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';
import { createCachedQuery } from '../cache/cache';

type SessionData = {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: string;
  } | null;
  session: any;
} | null;

export async function getServerSession(): Promise<SessionData | null> {
  try {
    const cachedSession = createCachedQuery(
      async (headerList: Headers) => {
        return await auth.api.getSession({ headers: headerList });
      },
      ['session', 'current'],
      { revalidate: 300 } // ۵ دقیقه
    );

    const session = await cachedSession(await headers());

    if (!session?.user) return null;

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as any).role || 'user',
      },
      session: session.session,
    };
  } catch (error) {
    logger.error('Failed to get server session', error);
    return null;
  }
}