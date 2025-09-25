import React, { type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-800 p-4">
          <div className="card w-96 bg-base-100 shadow-xl text-center p-6">
            <h1 className="text-3xl font-bold mb-4">
              Oops! Something went wrong.
            </h1>
            <p className="mb-4">
              We're sorry, an unexpected error occurred. Please try refreshing
              the page.
            </p>

            <details className="text-left text-sm text-red-600 bg-red-50 p-3 rounded mt-4">
              <summary>Error Details</summary>
              <pre className="whitespace-pre-wrap break-words mt-2">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>

            <button
              className="btn btn-primary mt-6"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
