// src/features/user/hooks.ts
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAllUsers } from './actions';
import type { User } from './types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const rawUsers = await getAllUsers();

      const formattedUsers: User[] = (rawUsers || []).map((user: any) => ({
        id: user.id,
        name: user.name ?? null,
        email: user.email,
        role: user.role ?? 'user',                    
        emailVerified: user.emailVerified ?? false,
        createdAt: user.createdAt,
        image: user.image ?? null,
      }));

      setUsers(formattedUsers);
    } catch (err: any) {
      const errorMsg = err.message || 'خطا در دریافت کاربران';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refreshUsers,
  };
}