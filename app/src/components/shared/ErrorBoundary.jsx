import { Component } from 'react';
import { RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-5xl mb-4">😵</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-dark-400 mb-6 max-w-sm">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          <button
            onClick={this.handleRetry}
            className="btn-primary"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 p-4 bg-dark-800 rounded-lg text-left text-xs text-red-400 max-w-full overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
