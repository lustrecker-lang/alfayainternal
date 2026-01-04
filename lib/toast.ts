import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Provides consistent toast notifications across the app
 */

export const showToast = {
    success: (message: string) => {
        toast.success(message, {
            duration: 3000,
            position: 'bottom-right',
        });
    },

    error: (message: string) => {
        toast.error(message, {
            duration: 4000,
            position: 'bottom-right',
        });
    },

    loading: (message: string) => {
        return toast.loading(message, {
            position: 'bottom-right',
        });
    },

    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string;
            error: string;
        }
    ) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading,
                success: messages.success,
                error: messages.error,
            },
            {
                position: 'bottom-right',
            }
        );
    },

    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    },
};

// Export default toast for advanced usage
export { toast };
