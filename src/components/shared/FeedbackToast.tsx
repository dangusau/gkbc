import React, { useEffect } from 'react';

interface FeedbackToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const FeedbackToast: React.FC<FeedbackToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 px-6 py-3 rounded-lg shadow-lg animate-fade-in min-h-[36px] min-w-[200px] flex items-center justify-center ${
        type === 'success'
          ? 'bg-green-100 border border-green-300 text-green-800'
          : 'bg-red-100 border border-red-300 text-red-800'
      }`}
    >
      <span className="font-medium text-xs">{message}</span>
    </div>
  );
};