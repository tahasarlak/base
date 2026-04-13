// src/lib/actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { handleError } from './error/error';

export async function safeAction<T>(
  actionFn: () => Promise<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    revalidatePath?: string;
    redirectTo?: string;
  } = {}
) {
  try {
    const result = await actionFn();

    if (options.successMessage) {
      toast.success(options.successMessage);
    }

    if (options.revalidatePath) revalidatePath(options.revalidatePath);
    if (options.redirectTo) redirect(options.redirectTo);

    return { success: true, data: result };
  } catch (error) {
    const { message } = handleError(error);

    toast.error(options.errorMessage || message);

    return { success: false, error: message };
  }
}