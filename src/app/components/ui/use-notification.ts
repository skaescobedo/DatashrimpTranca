import { toast } from 'sonner';

export const useNotification = () => {
  const success = (title: string, message?: string) => {
    toast.success(title, {
      description: message,
      duration: 4000,
      className: 'toaster-success',
      style: {
        backgroundColor: '#ecfdf5',
        borderColor: '#10b981',
        border: '1px solid',
      },
    });
  };

  const error = (title: string, message?: string) => {
    toast.error(title, {
      description: message,
      duration: 4000,
      className: 'toaster-error',
      style: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
        border: '1px solid',
      },
    });
  };

  const info = (title: string, message?: string) => {
    toast.info(title, {
      description: message,
      duration: 4000,
      className: 'toaster-info',
      style: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
        border: '1px solid',
      },
    });
  };

  const warning = (title: string, message?: string) => {
    toast.warning(title, {
      description: message,
      duration: 4000,
      className: 'toaster-warning',
      style: {
        backgroundColor: '#fffbeb',
        borderColor: '#f59e0b',
        border: '1px solid',
      },
    });
  };

  return { success, error, info, warning };
};
