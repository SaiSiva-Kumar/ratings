'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from "../firebaseconfig";
import { signInWithPopup } from "firebase/auth";
import Head from 'next/head';

// Session management functions
const createSession = async (user: any) => {
  const userId = user.uid;
  const idToken = await user.getIdToken();
  const sessionStartTime = Date.now();
  const sessionExpiryTime = sessionStartTime + 2 * 24 * 60 * 60 * 1000;
  
  const userAuth = {
    uid: userId,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    idToken: idToken,
    sessionStartTime: sessionStartTime,
    sessionExpiryTime: sessionExpiryTime
  };

  localStorage.setItem('userAuth', JSON.stringify(userAuth));
   
  return userAuth;
};

const checkSession = () => {
  const userAuthString = localStorage.getItem('userAuth');
  if (!userAuthString) return false;

  try {
    const userAuth = JSON.parse(userAuthString);
    const currentTime = Date.now();
    const isValid = userAuth && userAuth.sessionExpiryTime && currentTime < userAuth.sessionExpiryTime;

    if (!isValid) {
      // Clear expired session
      localStorage.removeItem('userAuth');
    }

    return isValid;
  } catch (error) {
    console.error('Error parsing user auth:', error);
    return false;
  }
};

interface ReviewSelectionUIProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

const ReviewSelectionUI: React.FC<ReviewSelectionUIProps> = ({ 
  isOpen, 
  onClose,
  productId
}) => {
  const router = useRouter();
  const [selectedReviewType, setSelectedReviewType] = useState<'signed' | 'anonymous' | ''>('');
  const [buttonText, setButtonText] = useState('Skip sign-up and review');
  const [buttonBgColor, setButtonBgColor] = useState('bg-green-600');
  const [hasValidSession, setHasValidSession] = useState<boolean>(false);

  useEffect(() => {
    const isValidSession = checkSession();
    setHasValidSession(isValidSession);
  }, []);

  const handleReviewTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const reviewType = event.target.id === 'add-signed-review' ? 'signed' : 'anonymous';
    setSelectedReviewType(reviewType);

    if (reviewType === 'signed') {
      setButtonText('Sign up & review');
      setButtonBgColor('bg-black');
    } else {
      setButtonText('Skip sign-up and review');
      setButtonBgColor('bg-green-600');
    }
  };

  const handleSubmit = async () => {
    if (!selectedReviewType) return;

    if (selectedReviewType === 'signed' && !hasValidSession) {
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;
        
        // Create new session
        await createSession(user);
        setHasValidSession(true);
        
        // Redirect to userReview page
        router.push(`/userReview?id=${productId}&reviewType=signed`);
        
        // Close the dialog
        onClose();
      } catch (error) {
        console.error("Google Sign-In Error:", error);
      }
    } else {
      // Redirect to userReview page for anonymous or existing session
      router.push(`/userReview?id=${productId}&reviewType=${selectedReviewType}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center pb-4 bg-black bg-opacity-50">
        <div className="relative bg-white shadow-md rounded-lg p-8 w-[375px] h-[415px] max-w-md">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex flex-col items-center justify-center bg-white">
            <h2 
              style={{ 
                fontFamily: "'Roboto', sans-serif", 
                textAlign: 'center' 
              }} 
              className="text-2xl font-bold mb-4"
            >
              Select Review Type
            </h2>

            <div className="space-y-4 w-[340px]">
              <div className="p-2 rounded-[11px] bg-[#F0F0F0] mt-6 relative" style={{ height: '97px' }}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="add-signed-review"
                    name="review-type"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 mr-2 absolute left-4"
                    onChange={handleReviewTypeChange}
                    checked={selectedReviewType === 'signed'}
                  />
                  <div className="ml-8">
                    <label
                      htmlFor="add-signed-review"
                      className="block text-base font-semibold text-black-700 font-roboto bg-[#F0F0F0] rounded-[11px] px-0 py-0"
                    >
                      Add a Signed Review
                    </label>
                    <p className="text-[13px] text-black-500 font-roboto leading-snug">
                      Make your review count! Appear first, influence overall ratings, and enjoy the freedom to edit or delete anytime. Choose authenticity!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-[11px] bg-[#F0F0F0] mt-6 relative" style={{ height: '97px' }}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="add-anonymous-review"
                    name="review-type"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 mr-2 absolute left-4"
                    onChange={handleReviewTypeChange}
                    checked={selectedReviewType === 'anonymous'}
                  />
                  <div className="ml-8">
                    <label
                      htmlFor="add-anonymous-review"
                      className="block text-base font-semibold text-black-700 font-roboto bg-[#F0F0F0] rounded-[11px] px-0 py-0"
                    >
                      Add an Anonymous Review
                    </label>
                    <p className="text-[13px] text-black-500 font-roboto leading-snug">
                      Skip sign-up, but your review appears after Signed review. Doesn't impact overall ratings, and can't be edited.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center items-center absolute bottom-8 left-0 right-0">
            <button 
              onClick={handleSubmit}
              disabled={!selectedReviewType}
              className={`${buttonBgColor} h-[48px] w-[346px] ${selectedReviewType ? 'hover:opacity-80' : 'opacity-50 cursor-not-allowed'} text-white font-bold py-2 px-4 rounded-[65px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewSelectionUI;