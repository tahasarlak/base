'use client';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/auth-client';

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const result = await authClient.getSession();
      if (result.error || !result.data?.user) {
        return null;
      }
      return result.data; // { user, session }
    },
    staleTime: 1000 * 60 * 5, // ۵ دقیقه
    retry: 1,
  });
}