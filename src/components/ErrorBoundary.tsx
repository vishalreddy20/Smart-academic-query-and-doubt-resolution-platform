import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log the error for debugging (can be sent to an error reporting service)
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-2xl text-center bg-white rounded-lg shadow-lg p-6 ring-1 ring-red-100">
            <h2 className="text-xl font-semibold text-red-700">Something went wrong</h2>
            <p className="mt-2 text-sm text-gray-600">An unexpected error occurred while rendering the page.</p>
            {this.state.error && (
              <details open className="mt-4 text-left text-xs text-gray-500 whitespace-pre-wrap">
                <summary className="sr-only">Error details</summary>
                <pre className="whitespace-pre-wrap text-xs text-gray-500 mt-1">{this.state.error.stack}</pre>
              </details>
            )}
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
