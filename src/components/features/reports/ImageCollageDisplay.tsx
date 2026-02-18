import React, { useState } from 'react';
import { ImageViewerModal } from '@/components/modals/ImageViewerModal';

interface ImageCollageDisplayProps {
  images: string[] | Array<{ imageUrl: string; [key: string]: any }>;
  title: string;
  containerHeight?: string;
  onClick?: (imageUrl: string) => void;
}

/**
 * Reusable component for displaying report images in a professional collage layout
 * Supports 1-5+ images with dynamic grid positioning
 */
export const ImageCollageDisplay: React.FC<ImageCollageDisplayProps> = ({
  images,
  title,
  containerHeight = 'h-80',
  onClick
}) => {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  // Normalize images to string array (handle both string[] and object array formats)
  const normalizedImages = images.map(img => {
    if (typeof img === 'string') {
      return img;
    }
    // Handle object with imageUrl property
    const imageUrl = (img as any).imageUrl || '';
    // If not a full URL, prepend API base URL
    if (!imageUrl.startsWith('http')) {
      const baseUrl = import.meta.env.VITE_APP_API_BASE_URL || 'https://resqhub-be.onrender.com';
      return `${baseUrl}/${imageUrl}`;
    }
    return imageUrl;
  });

  if (!normalizedImages.length) {
    return null;
  }

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageViewerOpen(true);
    onClick?.(imageUrl);
  };

  return (
    <>
      <div className={`relative w-full ${containerHeight} overflow-hidden bg-gray-100 rounded-2xl`}>
        {/* Dynamic Collage Grid */}
        <div className="w-full h-full grid gap-0.5" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' }}>
          {normalizedImages.length === 1 ? (
            // 1 Image: Full container
            <img
              loading="lazy"
              src={normalizedImages[0]}
              alt={title}
              onClick={() => handleImageClick(normalizedImages[0])}
              className="w-full h-full object-cover col-span-4 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
            />
          ) : normalizedImages.length === 2 ? (
            // 2 Images: Side-by-side full height
            normalizedImages.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt=""
                onClick={() => handleImageClick(img)}
                className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
            ))
          ) : normalizedImages.length === 3 ? (
            // 3 Images: Large left (2x4) + 2 stacked right (2x2 each)
            <>
              <img
                src={normalizedImages[0]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[0])}
                className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[1]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[1])}
                className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[2]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[2])}
                className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
            </>
          ) : normalizedImages.length === 4 ? (
            // 4 Images: Large left (2x4) + top right (2x2) + 2 bottom right (2x1 each)
            <>
              <img
                src={normalizedImages[0]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[0])}
                className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[1]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[1])}
                className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[2]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[2])}
                className="w-full h-full object-cover col-span-1 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[3]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[3])}
                className="w-full h-full object-cover col-span-1 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
            </>
          ) : normalizedImages.length === 5 ? (
            // 5 Images: Large left (2x4) + top right (2x2) + 2 middle (1x1) + 1 bottom (2x1)
            <>
              <img
                src={normalizedImages[0]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[0])}
                className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[1]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[1])}
                className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[2]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[2])}
                className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[3]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[3])}
                className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[4]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[4])}
                className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
            </>
          ) : (
            // 6+ Images: Large left (2x4) + top right (2x2) + 2 middle (1x1 each) + bottom right (2x1) with count overlay
            <>
              <img
                src={normalizedImages[0]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[0])}
                className="w-full h-full object-cover col-span-2 row-span-4 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[1]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[1])}
                className="w-full h-full object-cover col-span-2 row-span-2 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[2]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[2])}
                className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <img
                src={normalizedImages[3]}
                alt=""
                onClick={() => handleImageClick(normalizedImages[3])}
                className="w-full h-full object-cover col-span-1 row-span-1 cursor-pointer hover:brightness-110 transition-all duration-300"
              />
              <div className="relative w-full h-full object-cover col-span-2 row-span-2 overflow-hidden bg-gray-200 cursor-pointer">
                <img
                  src={normalizedImages[4]}
                  alt=""
                  onClick={() => handleImageClick(normalizedImages[4])}
                  className="w-full h-full object-cover hover:brightness-110 transition-all duration-300"
                />
                {normalizedImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-all duration-300">
                    <span className="text-white font-black text-3xl">+{normalizedImages.length - 5}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      <ImageViewerModal
        isOpen={isImageViewerOpen}
        imageUrl={selectedImageUrl}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </>
  );
};

export default ImageCollageDisplay;
