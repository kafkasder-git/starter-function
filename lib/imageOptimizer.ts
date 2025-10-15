/**
 * @fileoverview Image Optimization Utility
 * @description WebP conversion, lazy loading ve responsive image helper
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  sizes?: string;
  alt?: string;
}

interface OptimizedImageResult {
  src: string;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  alt?: string;
  className?: string;
}

/**
 * Image optimization helper
 * WebP conversion ve lazy loading attributes
 */
export const optimizeImage = (
  src: string,
  options: ImageOptimizationOptions = {}
): OptimizedImageResult => {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    lazy = true,
    sizes = '100vw',
    alt = ''
  } = options;

  // Base URL oluştur
  const baseUrl = src.startsWith('http') ? src : `/images/${src}`;
  
  // Responsive sizes için srcSet oluştur
  const generateSrcSet = (baseSrc: string, format: string) => {
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map(size => {
        const optimizedUrl = `${baseSrc}?w=${size}&q=${quality}&f=${format}`;
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  };

  // WebP fallback için srcSet
  const webpSrcSet = generateSrcSet(baseUrl, 'webp');
  const fallbackSrcSet = generateSrcSet(baseUrl, 'jpeg');

  return {
    src: `${baseUrl}?w=${width || 800}&q=${quality}&f=${format}`,
    srcSet: `${webpSrcSet}, ${fallbackSrcSet}`,
    sizes,
    loading: lazy ? 'lazy' : 'eager',
    alt,
    className: 'optimized-image'
  };
};

/**
 * Lazy loading için intersection observer helper
 */
export const setupLazyLoading = (): void => {
  if (typeof window === 'undefined') return;

  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;
          
          if (src) {
            img.src = src;
            if (srcset) {
              img.srcset = srcset;
            }
            img.classList.remove('lazy');
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  );

  // Lazy images'ları observe et
  const lazyImages = document.querySelectorAll('img[data-src]');
  lazyImages.forEach((img) => imageObserver.observe(img));
};

/**
 * Progressive image loading
 */
export const loadProgressiveImage = async (
  lowQualitySrc: string,
  highQualitySrc: string
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${highQualitySrc}`));
    };
    
    // Önce düşük kalite yükle
    img.src = lowQualitySrc;
    
    // Sonra yüksek kalite yükle
    const highQualityImg = new Image();
    highQualityImg.onload = () => {
      img.src = highQualityImg.src;
    };
    highQualityImg.src = highQualitySrc;
  });
};

/**
 * Image compression helper
 */
export const compressImage = (
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;
      
      // Aspect ratio'yu koru
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Image compression failed'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Responsive image component props helper
 */
export const getResponsiveImageProps = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const optimized = optimizeImage(src, options);
  
  return {
    ...optimized,
    className: `responsive-image ${optimized.className || ''}`,
    style: {
      width: '100%',
      height: 'auto',
      transition: 'opacity 0.3s ease'
    }
  };
};

/**
 * WebP support detection
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Preload critical images
 */
export const preloadImages = (urls: string[]): void => {
  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Image placeholder generator
 */
export const generatePlaceholder = (
  width: number,
  height: number,
  text: string = 'Loading...'
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;
  
  if (ctx) {
    // Background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
    
    // Text
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }
  
  return canvas.toDataURL();
};

export default {
  optimizeImage,
  setupLazyLoading,
  loadProgressiveImage,
  compressImage,
  getResponsiveImageProps,
  supportsWebP,
  preloadImages,
  generatePlaceholder
};
