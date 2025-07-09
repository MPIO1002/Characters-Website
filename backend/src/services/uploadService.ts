import cloudinary from '../cloudinary-config';
import { UploadApiResponse } from 'cloudinary';

export const uploadToCloudinary = (buffer: Buffer): Promise<UploadApiResponse> => {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
      if (error) reject(error);
      else if (result) resolve(result);
      else reject(new Error('Upload result is undefined'));
    }).end(buffer);
  });
};