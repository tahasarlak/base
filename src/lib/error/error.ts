// src/lib/error.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): { 
  message: string; 
  code: string; 
  statusCode?: number 
} {
  if (error instanceof AppError) {
    return { 
      message: error.message, 
      code: error.code, 
      statusCode: error.statusCode 
    };
  }

  if (error instanceof Error) {
    console.error('[App Error]:', error.message, error.stack);
    return { 
      message: process.env.NODE_ENV === 'production' 
        ? 'خطایی رخ داد. لطفاً دوباره تلاش کنید.' 
        : error.message, 
      code: 'UNKNOWN_ERROR' 
    };
  }

  console.error('[Unknown Error]:', error);
  return { 
    message: 'خطای ناشناخته رخ داد', 
    code: 'UNKNOWN_ERROR' 
  };
}