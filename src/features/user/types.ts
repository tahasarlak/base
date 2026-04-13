// src/features/user/types.ts
export type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;                  
  emailVerified: boolean | null;
  createdAt: Date | string;
  image?: string | null;
};