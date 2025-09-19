import React, { useState, useCallback, useRef } from 'react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (file: ImageFile | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setImagePreview(base64Url);
        onImageUpload({ file, base64Url });
      };
      reader.readAsDataURL(file);
    } else {
        setImagePreview(null);
        onImageUpload(null);
    }
  }, [onImageUpload]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setImagePreview(null);
    onImageUpload(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-lg font-medium text-gray-300 mb-2 text-center">{label}</label>
      <div
        onClick={handleClick}
        className="relative w-full aspect-square bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center text-gray-500 cursor-pointer hover:border-purple-500 hover:text-purple-400 transition-colors duration-300"
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {imagePreview ? (
          <>
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg p-2" />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 z-10"
              aria-label="Remove image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
