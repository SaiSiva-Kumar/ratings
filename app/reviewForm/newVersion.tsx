'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, X } from 'lucide-react';
import Image from 'next/image';

const ReviewForm = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [summary, setSummary] = useState('');
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);
  const [userInfo, setUserInfo] = useState({
    name: 'Anonymous user',
    photoURL: null
  });

  useEffect(() => {
    const user = localStorage.getItem('userAuth') 
      ? JSON.parse(localStorage.getItem('userAuth'))
      : null;
    
    if (user) {
      setUserInfo({
        name: `${user.firstName} ${user.lastName}`,
        photoURL: user.photoURL
      });
    }
  }, []);

  const handleStarClick = (index) => {
    if (rating === index + 1) {
      setRating(index);
    } else {
      setRating(index + 1);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 2) {
      alert('Maximum 2 images allowed');
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ rating, review, summary, images });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="max-w-xl mx-auto p-4 relative">
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        <X size={24} />
      </button>

      <div className="flex items-center gap-3 mb-6">
        {userInfo.photoURL && !imageError ? (
          <div className="relative w-8 h-8">
            <Image
              src={userInfo.photoURL}
              alt="User"
              width={32}
              height={32}
              className="rounded-full object-cover"
              onError={handleImageError}
              unoptimized
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200" />
        )}
        <span className="text-gray-800 font-semibold">
          {userInfo.name}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-gray-800 font-semibold mb-2">Add ratings</h2>
          <div className="flex gap-2">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={24}
                className={`cursor-pointer ${
                  index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
                onClick={() => handleStarClick(index)}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-gray-800 font-semibold mb-2">Review in detail</h2>
          <textarea
            className="w-full p-3 border rounded-md bg-gray-100 resize-none"
            rows={4}
            placeholder="Write a detailed review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        <div>
          <h2 className="text-gray-800 font-semibold mb-2">Review Summary</h2>
          <input
            type="text"
            className="w-full p-3 border rounded-md bg-gray-100"
            placeholder="Summarize your review as Review Title"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        <div>
          <h2 className="text-gray-800 font-semibold mb-2">Add Review Images (up to 2) (optional)</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button 
            className="px-4 py-2 bg-gray-100 border rounded-md font-semibold"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Images
          </button>
          
          {images.length > 0 && (
            <div className="mt-2 flex gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative w-20 h-20">
                  <Image
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                  <button
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center leading-none z-10"
                    onClick={() => removeImage(index)}
                  >
                    <span className="inline-flex items-center justify-center">×</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-semibold"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;