// src/user-apis/imageUpload.js
import { compressImage } from './imageCompression';
import { getApiBaseUrl } from '../../config/api_path';
const API_BASE_URL = getApiBaseUrl();
/**
 * Upload single image via Backend API
 * @param {File} file - Image file
 * @returns {Promise<string>} - Image URL from backend
 */
export const uploadImageToBackend = async (file) => {
  try {
    // Compress image first (frontend မှာပဲ compress)
    const compressedFile = await compressImage(file, {
      maxSize: 1200,
      quality: 0.8,
      outputType: 'image/jpeg'
    });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', compressedFile);
    
    // Send to Backend API
    const response = await fetch(`${API_BASE_URL}/user/upload-image`, {
      method: 'POST',
      credentials: 'include',  // for cookie auth
      body: formData,
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.imageUrl;  // Backend က ပြန်ပေးတဲ့ Supabase URL
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @returns {Promise<string[]>} - Array of image URLs
 */
export const uploadMultipleImages = async (files) => {
  const uploadPromises = files.map(file => uploadImageToBackend(file));
  const urls = await Promise.all(uploadPromises);
  return urls;
};

/**
 * Delete image (optional - can be handled by backend when post is updated/deleted)
 * @param {string} imageUrl - Image URL to delete
 */
export const deleteImageFromBackend = async (imageUrl) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/delete-image`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });
    return await response.json();
  } catch (error) {
    console.error('Delete image error:', error);
  }
};