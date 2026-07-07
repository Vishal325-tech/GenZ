import crypto from 'crypto';

/**
 * Uploads a file buffer directly to Cloudinary using standard REST API and signatures.
 * Supports photos and videos automatically using Cloudinary's 'auto' resource type.
 * 
 * @param {Buffer} fileBuffer - The file content buffer.
 * @param {string} mimeType - The mimetype of the file.
 * @param {string} filename - The original filename.
 * @param {string} folder - The Cloudinary folder to upload into.
 * @returns {Promise<{url: string, publicId: string, resourceType: string, bytes: number}>}
 */
export const uploadToCloudinary = async (fileBuffer, mimeType, filename, folder = 'genz_royal_hampers') => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are missing in .env');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  // Cloudinary signature parameters
  const params = {
    folder,
    timestamp
  };

  // Sort and compile sorted parameters
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // Compute signature: sha1(sorted_params + api_secret)
  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');

  // Create Blob/FormData for standard fetch request
  const blob = new Blob([fileBuffer], { type: mimeType });
  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', folder);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Cloudinary API Error Details:', result);
      throw new Error(result.error?.message || 'Cloudinary upload request failed.');
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary direct upload exception:', error);
    throw error;
  }
};

/**
 * Renames/moves an asset in Cloudinary from one path/filename to another.
 * 
 * @param {string} fromPublicId - Original public ID.
 * @param {string} toPublicId - Target public ID (including target folders).
 * @param {string} resourceType - Cloudinary resource type ('image' or 'video').
 * @returns {Promise<string>} - The new secure URL of the renamed asset.
 */
export const renameCloudinaryAsset = async (fromPublicId, toPublicId, resourceType = 'image') => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are missing in .env');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  const params = {
    from_public_id: fromPublicId,
    to_public_id: toPublicId,
    timestamp
  };

  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');

  const formData = new FormData();
  formData.append('from_public_id', fromPublicId);
  formData.append('to_public_id', toPublicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/rename`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Cloudinary Rename API Error:', result);
      throw new Error(result.error?.message || 'Cloudinary rename request failed.');
    }

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary rename exception:', error);
    throw error;
  }
};

/**
 * Deletes an asset from Cloudinary using REST API.
 * 
 * @param {string} publicId - Public ID of the asset to delete.
 * @param {string} resourceType - Cloudinary resource type ('image' or 'video').
 * @returns {Promise<boolean>}
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary environment variables are missing in .env');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);

  const params = {
    public_id: publicId,
    timestamp
  };

  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const signature = crypto
    .createHash('sha1')
    .update(sortedParams + apiSecret)
    .digest('hex');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Cloudinary Destroy API Error:', result);
      throw new Error(result.error?.message || 'Cloudinary destroy request failed.');
    }

    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary destroy exception:', error);
    throw error;
  }
};

