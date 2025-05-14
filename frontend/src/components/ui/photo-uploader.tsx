"use client"

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CloudUpload } from 'lucide-react';
import { uploadImage } from '@/services/api/images';
import { useAuth } from '@/contexts/AuthContext';
import { SpinnerLoader } from './spinner-loader';
import { Progress } from './progress';

type UploadStatus = 'idle' | 'uploading' | 'error';

interface PhotoUploaderProps {
  onUploadComplete?: (imageData: any) => void;
}

export function PhotoUploader({ onUploadComplete }: PhotoUploaderProps) {
  const { firebaseIdToken } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [dragging, setDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      uploadImages();
    } else {
      setUploadStatus('idle');
    }
  }, [selectedFiles]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadImages = async (): Promise<void> => {
    if (selectedFiles.length === 0) {
      alert('Please select files first.');
      return;
    }

    setUploadStatus('uploading');

    try {
      const formData = new FormData();
      // selectedFiles.forEach((file) => {
      // });
      formData.append('image', selectedFiles[0]);
      const imageData = await uploadImage(formData, firebaseIdToken!, {
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1; // Avoid division by zero
          const currentProgress = Math.round((progressEvent.loaded * 100) / total);
          console.log('Upload progress:', currentProgress);
          console.log('progressevent.loaded:', progressEvent.loaded);
          console.log('progressevent.total:', total);
          setUploadProgress(currentProgress);
        }
      });
      onUploadComplete && onUploadComplete(imageData);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      return;
    }
  };

  const handleOnDargEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleOnDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleOnDropCapture = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const renderContent = (): React.ReactNode => {
    switch (uploadStatus) {
      case 'idle':
        return (
          <div
            onClick={handleButtonClick}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              setSelectedFiles(files);
              setUploadStatus('idle');
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleOnDargEnter}
            onDragLeave={handleOnDragLeave}
            onDropCapture={handleOnDropCapture}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${dragging ? 'border-blue-500' : 'border-gray-300'} rounded-lg text-gray-500 cursor-pointer md:w-full`}
          >
            <CloudUpload className="h-12 w-12 mb-4" />
            <p className="mb-4 text-center">Drag and drop image or click here</p>
          </div>
        );
      case 'uploading':
        return (
          <div className="mt-8">
            <div className="flex flex-col items-center">
              <SpinnerLoader text={(<span className='italic'>Your photo is being analyzed<br />by our AI assistant...</span>)} />
              <div className="flex flex-wrap justify-center mt-6">
                {selectedFiles.map((file, i) => (
                  <div className="flex flex-col items-center p-4 border-1 border-gray-300 rounded-lg shadow-md" key={i}>
                    <div className="relative h-24 w-24">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt="Logo"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                ))}
                <Progress value={uploadProgress} className="w-full h-1 rounder-lg" />
              </div>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4 text-red-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-lg font-semibold">Upload Failed!</p>
            <button
              onClick={() => {
                setSelectedFiles([]);
                setUploadStatus('idle');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition duration-200 ease-in-out"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      {renderContent()}
    </div>
  );
};
