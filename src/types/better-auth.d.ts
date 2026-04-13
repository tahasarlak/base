// src/types/better-auth.d.ts
import type { User as BetterAuthUser } from 'better-auth';

declare module 'better-auth' {
  interface User extends BetterAuthUser {
    role: 'admin' | 'moderator' | 'user';
  }
}