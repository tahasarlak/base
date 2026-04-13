'use client';
import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center border border-destructive/30 rounded-3xl bg-destructive/5">
          <div className="text-5xl mb-6">😵</div>
          <h2 className="text-2xl font-semibold mb-3">مشکلی پیش آمد</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            متأسفانه خطایی رخ داده است. لطفاً صفحه را دوباره بارگذاری کنید.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="default"
          >
            بارگذاری مجدد صفحه
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}