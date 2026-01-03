/**
 * Resize image to ensure minimum dimensions while maintaining aspect ratio
 * @param file - Original image file
 * @param minDimension - Minimum width or height in pixels (default: 700)
 * @param quality - JPEG quality 0-1 (default: 0.95 for high quality)
 * @returns Promise<File> - Resized image file
 */
export async function resizeImageToMinimum(
  file: File,
  minDimension: number = 700,
  quality: number = 0.95
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        let { width, height } = img;
        const originalWidth = width;
        const originalHeight = height;

        // Check if image already meets minimum dimension
        const minCurrentDimension = Math.min(width, height);
        if (minCurrentDimension >= minDimension) {
          // Image is already large enough, return original
          resolve(file);
          return;
        }

        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = width / height;
        
        if (width < height) {
          // Portrait or square - scale based on width
          width = minDimension;
          height = width / aspectRatio;
        } else {
          // Landscape - scale based on height
          height = minDimension;
          width = height * aspectRatio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and resize image with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with high quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }

            // Create new File with original name
            const resizedFile = new File(
              [blob],
              file.name,
              {
                type: file.type,
                lastModified: Date.now()
              }
            );

            console.log(`Image resized: ${originalWidth}x${originalHeight} → ${Math.round(width)}x${Math.round(height)}`);
            resolve(resizedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions without loading full image
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

