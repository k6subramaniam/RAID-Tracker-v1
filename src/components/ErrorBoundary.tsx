import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import WebIcon from './WebIcon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You could log this to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    // For React Native, you might want to restart the app
    // or navigate to a safe screen
    this.handleReset();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error?: Error;
  onReset: () => void;
}

const DefaultErrorFallback: React.FC<FallbackProps> = ({ error, onReset }) => {
  // Note: We can't use useTheme here since this is rendered outside the theme context potentially
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <WebIcon name="alert-circle" size={64} color="#ef4444" />
        
        <Text style={styles.title}>
          Something went wrong
        </Text>
        
        <Text style={styles.message}>
          We're sorry, but something unexpected happened. Please try refreshing the app.
        </Text>
        
        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details (Development Only):</Text>
            <Text style={styles.errorText}>
              {error.name}: {error.message}
            </Text>
            {error.stack && (
              <Text style={styles.errorStack}>
                {error.stack.substring(0, 500)}...
              </Text>
            )}
          </View>
        )}
        
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={onReset}
            style={styles.button}
            icon="refresh"
          >
            Try Again
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
    backgroundColor: '#262629',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#fbbf24',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#fb923c',
  },
});

export default ErrorBoundary;