'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Star, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  reviewType: 'signed' | 'anonymous';
  productId: string;
  onSubmitSuccess?: () => void;
  onBack?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ 
  reviewType, 
  productId,
  onSubmitSuccess,
  onBack 
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [summary, setSummary] = useState('');
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);
  const [userInfo, setUserInfo] = useState({
    name: reviewType === 'anonymous' ? 'Anonymous user' : '',
    photoURL: null
  });
  const router = useRouter();

  useEffect(() => {
    if (reviewType === 'signed') {
      const user = localStorage.getItem('userAuth') 
        ? JSON.parse(localStorage.getItem('userAuth'))
        : null;
      
      if (user) {
        setUserInfo({
          name: user.displayName,
          photoURL: user.photoURL
        });
      }
    }
  }, [reviewType]);

  const handleStarClick = (index) => {
    setRating(prev => prev === index + 1 ? index : index + 1);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation checks
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    if (review.trim().length < 10) {
      alert('Review must be at least 10 characters long');
      return;
    }

    if (summary.trim().length < 5) {
      alert('Review summary must be at least 5 characters long');
      return;
    }

    try {
      const formData = new FormData();
      
      formData.append('id', productId);
      formData.append('ratings', rating.toString());
      formData.append('review', review);
      formData.append('summary', summary);
      formData.append('reviewType', reviewType);

      // User Authentication and ID Logic
      const userAuth = localStorage.getItem('userAuth');
      let userId, userName, userImage;

      if (userAuth) {
        // Signed-in user
        const user = JSON.parse(userAuth);
        
        if (reviewType === 'signed') {
          // Regular signed review
          userId = user.uid;
          userName = user.displayName;
          userImage = user.photoURL;
        } else {
          // Signed-in user choosing anonymous review
          // Use the same uid, but mark as anonymous
          userId = user.uid;
          console.log(userId)
          userName = 'Anonymous User';
          userImage = '/public/images/anonymous-avatar.png';
        }
      } else {
        // Completely new anonymous user
        userId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        userName = 'Anonymous User';
        userImage = '/public/images/anonymous-avatar.png';
      }

      // Append user details to form data
      formData.append('userId', userId);
      formData.append('userName', userName);
      formData.append('userImage', userImage);
      formData.append('isAnonymous', (reviewType === 'anonymous').toString());

      // Image Handling
      images.slice(0, 2).forEach((imageObj) => {
        formData.append('images', imageObj.file);
      });

      // API Submission
      const response = await fetch('/api/review-submission', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to submit review');

      alert('Review submitted successfully!');
      onSubmitSuccess?.();

    } catch (error) {
      console.error('Submission error:', error);
      alert("Failed to submit review. Please try again.");
    }
  };

  const handleImageError = () => setImageError(true);

  return (
    <div className="w-[400px] mx-auto transform -translate-x-6 p-4 space-y-6">

      {/* User Info Section */}
      <div className="flex items-center gap-3 mb-3">
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
        <span className="text-gray-800 font-medium">
          {userInfo.name}
        </span>
      </div>

      <div className="space-y-6">
        {/* Ratings Section */}
        <div>
          <h2 className="text-black font-semibold mb-1 text-[14px] font-roboto">Add Ratings</h2>
          <div className="flex gap-1 mt-[10px]">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={20}
                height={22.49}
                width={23.54}
                strokeWidth={1.5}
                stroke="black"
                className={`cursor-pointer ${
                  index < rating 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`}
                onClick={() => handleStarClick(index)}
              />
            ))}
          </div>
        </div>

        {/* Review Details */}
        <div>
          <h2 className="text-black font-semibold mb-1 text-[14px] font-roboto">Review in Detail</h2>
          <textarea
            className="w-full px-3 py-2 border-none bg-[#F0F0F0] rounded-[11px] resize-none text-sm h-40 focus:outline-none focus:ring-0 placeholder-[#ABABAB] font-roboto font-semibold text-[14px] mt-[10px]"
            placeholder="Write a detailed review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>

        {/* Review Summary */}
        <div>
          <h2 className="text-black font-semibold mb-1 text-[14px] font-roboto">Review Summary</h2>
          <input
            type="text"
            className="w-full p-2 border-none bg-[#F0F0F0] rounded-[11px] text-sm focus:outline-none focus:ring-0 placeholder-[#ABABAB] font-roboto font-semibold text-[14px] mt-[10px]"
            placeholder="Summarize your review"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={20}
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <h2 className="text-black font-semibold mb-1 text-[14px] font-roboto">Add Review Images (up to 2) (optional)</h2>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button 
            type="button"
            className="h-10 self-start px-3 py-2 text-left bg-[#f3f4f6] text-black rounded-[11px] font-semibold cursor-pointer text-sm font-roboto flex justify-center mt-[10px]"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Images
          </button>
          
          {images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {images.map((imageObj, index) => (
                <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <Image 
                    src={imageObj.preview} 
                    alt={`Preview ${index + 1}`} 
                    fill
                    className="object-cover"
                  />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-[#019141] text-sm text-white rounded-[65px] hover:bg-[#017a37] font-medium"
        >
          <span style={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 600,
            fontSize: '16px',
            color: '#FFFFFF'
          }}>
            Submit Review
          </span>
        </button>
      </div>
    </div>
  );
};

export default ReviewForm;