'use client';
import { useSession } from './use-session';

export function useUserRole() {
  const { data: sessionData } = useSession();

  const role = sessionData?.user?.role as 
    | 'super_admin' 
    | 'admin' 
    | 'instructor' 
    | 'seller' 
    | 'blogger' 
    | 'support' 
    | 'student' 
    | 'customer' 
    | 'user' 
    | undefined;

  return {
    role,
    isSuperAdmin: role === 'super_admin',
    isAdmin: role === 'admin' || role === 'super_admin',
    isInstructor: role === 'instructor',
    isSeller: role === 'seller',
    isBlogger: role === 'blogger',
    isSupport: role === 'support',
    isStudent: role === 'student',
    isCustomer: role === 'customer',
    isUser: role === 'user' || !role,
  };
}