import { useState, useEffect, ReactNode, JSX } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export enum ToastType {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info'
}

export type ToastPosition = 
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

interface ToastProps {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
}

interface ToastContainerProps {
  position?: ToastPosition;
}

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStyle {
  containerClass: string;
  iconClass: string;
  icon: ReactNode;
}

const Toast = ({ type, message, onClose, duration = 5000 }: ToastProps): JSX.Element => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getToastStyles = (): ToastStyle => {
    switch (type) {
      case ToastType.ERROR:
        return {
          containerClass: 'bg-red-50 border-red-400 text-red-800',
          iconClass: 'text-red-500',
          icon: <AlertCircle className="w-5 h-5" />
        };
      case ToastType.SUCCESS:
        return {
          containerClass: 'bg-green-50 border-green-400 text-green-800',
          iconClass: 'text-green-500',
          icon: <CheckCircle className="w-5 h-5" />
        };
      case ToastType.INFO:
      default:
        return {
          containerClass: 'bg-blue-50 border-blue-400 text-blue-800',
          iconClass: 'text-blue-500',
          icon: <Info className="w-5 h-5" />
        };
    }
  };

  const { containerClass, iconClass, icon } = getToastStyles();

  return (
    <div className={`rounded-md border p-4 max-w-md w-full flex items-start gap-3 shadow-md ${containerClass}`}>
      <div className={iconClass}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium pr-20">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-gray-600 focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastFunctions {
  addToast: (type: ToastType, message: string, duration?: number) => number;
  removeToast: (id: number) => void;
}

declare global {
  interface Window {
    toastFunctions?: ToastFunctions;
  }
}

export const ToastContainer = ({ position = 'top-right' }: ToastContainerProps): JSX.Element | null => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const positionClasses: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const addToast = (type: ToastType, message: string, duration = 5000): number => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, type, message, duration }]);
    return id;
  };

  const removeToast = (id: number): void => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.toastFunctions = {
        addToast,
        removeToast
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.toastFunctions = undefined;
      }
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2`}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export const showErrorToast = (message: string, duration?: number): number | undefined => {
  if (typeof window !== 'undefined' && window.toastFunctions) {
    return window.toastFunctions.addToast(ToastType.ERROR, message, duration);
  }
  return undefined;
};

export const showSuccessToast = (message: string, duration?: number): number | undefined => {
  if (typeof window !== 'undefined' && window.toastFunctions) {
    return window.toastFunctions.addToast(ToastType.SUCCESS, message, duration);
  }
  return undefined;
};

export const showInfoToast = (message: string, duration?: number): number | undefined => {
  if (typeof window !== 'undefined' && window.toastFunctions) {
    return window.toastFunctions.addToast(ToastType.INFO, message, duration);
  }
  return undefined;
};

import { createContext, useContext, ReactElement } from 'react';

interface ToastContextProps {
  addToast: (type: ToastType, message: string, duration?: number) => number;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
}

export const ToastProvider = ({ children, position = 'top-right' }: ToastProviderProps): ReactElement => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (type: ToastType, message: string, duration = 5000): number => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, type, message, duration }]);
    return id;
  };

  const removeToast = (id: number): void => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  const positionClasses: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {toasts.length > 0 && (
        <div className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-2`}>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const useErrorToast = (): (message: string, duration?: number) => number => {
  const { addToast } = useToast();
  return (message: string, duration?: number) => addToast(ToastType.ERROR, message, duration);
};

export const useSuccessToast = (): (message: string, duration?: number) => number => {
  const { addToast } = useToast();
  return (message: string, duration?: number) => addToast(ToastType.SUCCESS, message, duration);
};

export const useInfoToast = (): (message: string, duration?: number) => number => {
  const { addToast } = useToast();
  return (message: string, duration?: number) => addToast(ToastType.INFO, message, duration);
};

export default function ToastDemo(): JSX.Element | null {
  const [mounted, setMounted] = useState<boolean>(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleErrorClick = (): void => {
    showErrorToast('An error occurred while processing your request.');
  };

  const handleSuccessClick = (): void => {
    showSuccessToast('Your changes have been saved successfully!');
  };

  const handleInfoClick = (): void => {
    showInfoToast('This is an informational message.');
  };

  return (
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Toast Notifications Demo</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button
          onClick={handleErrorClick}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Show Error Toast
        </button>
        
        <button
          onClick={handleSuccessClick}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Show Success Toast
        </button>
        
        <button
          onClick={handleInfoClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Show Info Toast
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full">
        <h2 className="text-lg font-semibold mb-4">How to Use</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Add the <code className="bg-gray-100 px-1 rounded">ToastContainer</code> to your layout or page</li>
          <li>Call <code className="bg-gray-100 px-1 rounded">showErrorToast()</code>, <code className="bg-gray-100 px-1 rounded">showSuccessToast()</code>, or <code className="bg-gray-100 px-1 rounded">showInfoToast()</code> to display toasts</li>
          <li>Alternatively, use the Context API approach with <code className="bg-gray-100 px-1 rounded">ToastProvider</code> and hooks</li>
        </ol>
      </div>
      
      <ToastContainer position="top-right" />
    </div>
  );
}