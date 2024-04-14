"use client"
import React, { useRef, useState, useEffect } from 'react';

interface CameraProps {
  shouldCapture: boolean;
  shouldRecorded: boolean;
  cameraVal: string;
  updateTrigger: boolean;
  recordClickhandler: () => void;
  onCaptureComplete: () => void;
  cameraValClickHandler: (newValue: string) => void;
}

const CameraComponent: React.FC<CameraProps> = ({ shouldCapture, onCaptureComplete, shouldRecorded, cameraVal, recordClickhandler, cameraValClickHandler, updateTrigger }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);

  useEffect(() => {
    startCamera(); // Automatically start camera when component mounts
  }, []); // Empty dependency array ensures this effect runs only once after initial render

  useEffect(() => {
    if (shouldCapture) {
      captureImage();
    }
  }, [shouldCapture]); // Capture image when shouldCapture prop changes

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play(); // Make sure to play the video
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  let capturedImageData: string | null = null; // Variable to store captured image data temporarily

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const base64Image = imageDataToBase64(imageData); // Convert ImageData to base64
        capturedImageData = base64Image || ""; // Assign empty string if base64Image is null
      }
      onCaptureComplete(); // Notify parent component that capture is complete
      recordClickhandler();
      cameraValClickHandler(capturedImageData || ""); // Pass empty string if capturedImageData is null
    }
  };

  const imageDataToBase64 = (imageData: ImageData): string => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL('image/png');
    }
    return '';
  };
  
  const sendCapturedImageToServer = () => {
    if (capturedImageData) {
      fetch('http://localhost:4000/imagetotext', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: capturedImageData })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
          return response.text();
        })
        .then(data => {
          console.log('Image uploaded successfully:', data);
          // Optionally, you can clear the captured image data after sending
          capturedImageData = null;
        })
        .catch(error => {
          console.error('Error uploading image:', error);
        });
    } else {
      console.error('No captured image data available.');
    }
  };
  

  useEffect(() => {
    // Reset imageData once the image is captured
    if (imageData !== null) {
      setImageData(null);
    }
  }, [imageData]);

  return (
    <div className="relative w-full h-full bottom-0">
      <button onClick={captureImage} className="absolute hidden top-0 left-0 z-10">Capture Image</button>
      {imageData && <img src={imageData} alt="Captured" className="absolute top-0 left-0 z-10" />}
      <video ref={videoRef} className="w-full h-full object-cover rounded-lg" style={{ maxWidth: '100%' }} />
    </div>
  );
};

export default CameraComponent;
