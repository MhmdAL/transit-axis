// Error handling utilities for API integration

export class ApiError extends Error {
  public statusCode: number;
  public timestamp: string;
  public path?: string;

  constructor(message: string, statusCode: number = 500, path?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends Error {
  public field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Error handler utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  if (error instanceof TimeoutError) {
    return 'Request timed out. Please try again.';
  }
  
  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Toast notification helper (can be integrated with a toast library)
export const showErrorToast = (error: unknown) => {
  const message = handleApiError(error);
  console.error('API Error:', error);
  
  // In a real app, you would integrate with a toast library like react-hot-toast
  // For now, we'll use a simple alert (replace with proper toast implementation)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error);
  }
  
  // You can replace this with your preferred toast library
  // toast.error(message);
  return message;
};

// Success toast helper
export const showSuccessToast = (message: string) => {
  // toast.success(message);
  console.log('Success:', message);
  return message;
};

// Loading state manager
export class LoadingManager {
  private loadingStates: Map<string, boolean> = new Map();
  private listeners: Set<(states: Record<string, boolean>) => void> = new Set();

  setLoading(key: string, loading: boolean) {
    this.loadingStates.set(key, loading);
    this.notifyListeners();
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  subscribe(listener: (states: Record<string, boolean>) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const states = Object.fromEntries(this.loadingStates);
    this.listeners.forEach(listener => listener(states));
  }

  clear() {
    this.loadingStates.clear();
    this.notifyListeners();
  }
}

// Global loading manager instance
export const loadingManager = new LoadingManager();

// Retry utility
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
};


