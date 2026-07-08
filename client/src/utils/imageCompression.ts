export const compressImage = async (
  file: File,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.7
): Promise<File> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // Skip compression for GIFs to preserve animation
    if (file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => resolve(file); // fallback to original on error
    };
    reader.onerror = (err) => resolve(file);
  });
};
