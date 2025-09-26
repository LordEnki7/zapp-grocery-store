import React, { useState } from 'react';
import { getSitephotoImagePath } from '../../services/productService';

interface ProductImageProps {
  productName?: string;
  imagePath?: string;
  className?: string;
  alt?: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  productName, 
  imagePath,
  className = '', 
  alt 
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use productName if provided, otherwise use alt or imagePath
  const nameToUse = productName || alt || imagePath || '';

  // Enhanced image path resolution using getSitephotoImagePath function
  const getImagePaths = (name: string, providedImagePath?: string): string[] => {
    if (!name && !providedImagePath) return ['/images/product-placeholder.svg'];
    
    const paths: string[] = [];

    // If a specific image path is provided and it's already a full path, use it first
    if (providedImagePath && (providedImagePath.startsWith('/sitephoto/') || providedImagePath.startsWith('/images/'))) {
      paths.push(providedImagePath);
    }

    // Try to get mapped path using getSitephotoImagePath function
    if (name) {
      const mappedPath = getSitephotoImagePath(name);
      if (mappedPath && !paths.includes(mappedPath)) {
        paths.push(mappedPath);
      }
    }

    // If we have a provided image path, try using it as a filename to find mapping
    if (providedImagePath && !providedImagePath.startsWith('/')) {
      const imageNameWithoutExt = providedImagePath.replace(/\.[^/.]+$/, "");
      const mappedPathByFilename = getSitephotoImagePath(imageNameWithoutExt);
      if (mappedPathByFilename && !paths.includes(mappedPathByFilename)) {
        paths.push(mappedPathByFilename);
      }
    }

    // Fallback to organized folder structure approach
    if (name) {
      const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      
      const basePaths = [
        `/images/products/gift-cards/${name}`,
        `/images/products/beverages/${name}`,
        `/images/products/health/${name}`,
        `/images/products/artisan/${name}`,
        `/images/products/fresh/${name}`,
        `/images/products/${name}`,
        `/images/products/${cleanName}`
      ];

      const extensions = ['.webp', '.jpg', '.jpeg', '.png', '.avif', '.svg'];

      basePaths.forEach(basePath => {
        extensions.forEach(ext => {
          const fullPath = `${basePath}${ext}`;
          if (!paths.includes(fullPath)) {
            paths.push(fullPath);
          }
        });
      });
    }

    // If we have a provided image path that's not a full path, try it in /images/products/
    if (providedImagePath && !providedImagePath.startsWith('/')) {
      const fallbackPath = `/images/products/${providedImagePath}`;
      if (!paths.includes(fallbackPath)) {
        paths.push(fallbackPath);
      }
    }

    // Add final fallback
    paths.push('/images/product-placeholder.svg');
    
    return paths;
  };

  const imagePaths = getImagePaths(nameToUse, imagePath);
  const currentImagePath = imagePaths[currentImageIndex] || '/images/product-placeholder.svg';

  const handleImageError = () => {
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < imagePaths.length) {
      setCurrentImageIndex(nextIndex);
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  return (
    <img
      src={currentImagePath}
      alt={alt || nameToUse}
      className={className}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading="lazy"
    />
  );
};

export default ProductImage;