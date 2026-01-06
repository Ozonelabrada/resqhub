import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '../button';
import { cn } from '@/lib/utils';

export interface ImageGalleryProps {
  images: string[];
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  className = '',
  aspectRatio = "video"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return (
    <div className={cn("bg-slate-100 flex items-center justify-center text-slate-400 rounded-2xl", className)}>
      No images
    </div>
  );

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const ratioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "h-auto"
  };

  return (
    <div className={cn("relative group overflow-hidden rounded-3xl bg-slate-900", className)}>
      <div className={cn("relative w-full h-full", ratioClasses[aspectRatio])}>
        <img
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          className="w-full h-full object-contain transition-transform duration-500"
        />
      </div>
      
      {images.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft size={24} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
            >
              <ChevronRight size={24} />
            </Button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentIndex ? "bg-white w-6" : "bg-white/50"
                )}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded-full">
          {currentIndex + 1} / {images.length}
        </span>
      </div>
    </div>
  );
};

export default ImageGallery;