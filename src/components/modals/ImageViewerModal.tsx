import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string;
  imageAlt?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  imageUrl,
  imageAlt = 'Image',
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="relative max-h-[90vh] max-w-[90vw] flex flex-col animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10000] bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200 cursor-pointer pointer-events-auto"
          aria-label="Close image viewer"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Image */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImageViewerModal;
