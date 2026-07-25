import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-error-container text-on-error-container rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-[32px]" />
          </div>
          <h1 className="font-headline-md text-error mb-2">Something went wrong.</h1>
          <p className="font-body-md text-on-surface-variant mb-6 max-w-md">
            The application encountered an unexpected error. 
          </p>
          <div className="bg-surface-container-low p-4 rounded-lg w-full max-w-2xl text-left overflow-auto border border-outline-variant mb-6">
            <p className="font-label-md text-on-surface mb-2 font-mono text-sm text-error">
              {this.state.error?.toString()}
            </p>
            <pre className="font-body-sm text-on-surface-variant text-xs font-mono whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.href = '/'} 
            className="h-[48px] px-6 bg-primary text-on-primary rounded-full font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
