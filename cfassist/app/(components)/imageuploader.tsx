import React, { useState, useRef } from 'react';

interface DropProps {
    shouldRecorded: boolean;
    cameraVal: string;
    updateTrigger: boolean;
    recordClickhandler: () => void;
    cameraValClickHandler: (newValue: string) => void;
}

const ImageUploader: React.FC<DropProps> = ({ shouldRecorded, cameraVal, updateTrigger, recordClickhandler, cameraValClickHandler }) => {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageDrop = (droppedImage: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setImage(result);
        recordClickhandler();
        cameraValClickHandler(result);
      }
    };
    reader.readAsDataURL(droppedImage);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length === 1) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageDrop(file);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageDrop(file);
    }
  };

  return (
    <div
      className="max-w-[400px] w-full h-[calc(55vh)] flex items-center justify-center border-2 border-dashed border-gray-500 rounded-lg"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleImageUpload}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
      {image ? (
        <img src={image} alt="Uploaded" className="max-w-full max-h-full" />
      ) : (
        <p className="text-center text-white">Drop your image here or click to upload</p>
      )}
    </div>
  );
};

export default ImageUploader;
