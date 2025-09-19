import React, { useState, useCallback, useEffect } from 'react';
import { ImageFile } from './types';
import { generateProductPlacementImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import Spinner from './components/Spinner';

const loadingMessages = [
  "Warming up the digital canvas...",
  "Asking Nano Banana for inspiration...",
  "Blending pixels and possibilities...",
  "Placing the product in scene...",
  "Almost there, adding the final touches!",
];

export default function App() {
  const [characterImage, setCharacterImage] = useState<ImageFile | null>(null);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = useCallback(async () => {
    if (!characterImage || !productImage) {
      setError("Please upload both a character and a product image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const resultBase64 = await generateProductPlacementImage(characterImage, productImage);
      if (resultBase64) {
        setGeneratedImage(`data:image/png;base64,${resultBase64}`);
      } else {
        throw new Error("The model did not return an image. Please try a different prompt or images.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [characterImage, productImage]);
  
  const handleDownload = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-scene-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  const canGenerate = characterImage && productImage && !isLoading;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Nano Banana Product Placer
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Let AI place your products into character scenes seamlessly.
          </p>
        </header>

        <main className="flex flex-col items-center gap-8">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploader
              id="character-uploader"
              label="Character Image"
              onImageUpload={setCharacterImage}
            />
            <ImageUploader
              id="product-uploader"
              label="Product Image"
              onImageUpload={setProductImage}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-8 py-4 text-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-50"
          >
            ✨ Generate Scene
          </button>
          
          {error && <div className="mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">{error}</div>}

          <div className="w-full max-w-2xl mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700 min-h-[400px] flex justify-center items-center">
            {isLoading ? (
              <div className="text-center">
                <Spinner />
                <p className="mt-4 text-lg text-gray-300 animate-pulse">{loadingMessage}</p>
              </div>
            ) : generatedImage ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <img src={generatedImage} alt="Generated scene" className="rounded-lg max-w-full h-auto shadow-2xl" />
                <button
                  onClick={handleDownload}
                  className="mt-4 px-6 py-3 text-lg font-semibold text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center"
                  aria-label="Download generated image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Image
                </button