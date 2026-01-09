import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: Array<{ imageUrl: string; description: string | null }>;
  title: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-72 md:h-96 w-full bg-slate-100 flex items-center justify-center text-slate-400">
        No images available
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];
  // Build full URL if needed (following useNewsFeed logic)
  const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com';
  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBase}${cleanUrl}`;
  };

  return (
    <div className="relative h-72 md:h-96 w-full bg-slate-50 overflow-hidden group">
      <img
        src={getFullImageUrl(currentImage.imageUrl)}
        alt={currentImage.description || title}
        className="h-full w-full object-contain"
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6 text-slate-700" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6 text-slate-700" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  idx === currentIndex ? "bg-teal-600 w-4" : "bg-slate-300"
                )}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/80 hover:bg-white h-8 w-8 p-0 rounded-full"
          onClick={() => window.open(getFullImageUrl(currentImage.imageUrl), '_blank')}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ImageCarousel;
