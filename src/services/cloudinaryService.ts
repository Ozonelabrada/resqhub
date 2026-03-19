export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Validate environment variables
  if (!cloudName || !uploadPreset) {
    console.error('Cloudinary configuration is missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.');
    throw new Error('Cloudinary configuration is not available. Please contact support.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'resqhub_reports'); // Optional: keeps your Cloudinary organized

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    
    if (!data.public_id) {
      throw new Error('No public ID returned from Cloudinary');
    }
    
    // Return only the public_id (short identifier) instead of full URL for efficient database storage
    // The public_id can be used to reconstruct the URL as needed: https://res.cloudinary.com/{cloudName}/image/upload/{public_id}
    return data.public_id;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

/**
 * Converts Cloudinary public_id back to secure URL
 * @param publicId The Cloudinary public_id (short identifier)
 * @returns The full secure URL for the image
 */
export const getCloudinarySecureUrl = (publicId: string): string => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) {
    console.warn('Missing cloudName or publicId for Cloudinary URL reconstruction');
    return '';
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};

/**
 * Uploads multiple images to Cloudinary concurrently
 * @param files - Array of image files to upload
 * @returns Promise with array of public IDs (short identifiers)
 */
export const uploadMultipleImagesToCloudinary = async (files: File[]): Promise<string[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  try {
    // Upload all images concurrently using Promise.all
    const uploadPromises = files.map(file => uploadImageToCloudinary(file));
    const publicIds = await Promise.all(uploadPromises);
    return publicIds;
  } catch (error: any) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};