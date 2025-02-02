'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { auth, googleProvider } from "../firebaseconfig";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from 'next/navigation';

interface ReviewTypeSelectorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewTypeSelect?: (type: 'signed' | 'anonymous', productId: string) => void;
  productId: string;
}

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

const ReviewTypeSelector: React.FC<ReviewTypeSelectorProps> = ({ 
  isOpen, 
  onOpenChange, 
  onReviewTypeSelect,
  productId
}) => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<'signed' | 'anonymous' | null>(null);
  const [hasValidSession, setHasValidSession] = useState<boolean>(false);

  useEffect(() => {
    const isValidSession = checkSession();
    setHasValidSession(isValidSession);
  }, []);

  const handleReviewTypeSelect = (value: 'signed' | 'anonymous') => {
    setSelectedType(value);
  };

  const getButtonText = () => {
    if (!selectedType) return 'Skip sign-up and review';
    return selectedType === 'signed' ? 'Sign up & review' : 'Skip sign-up and review';
  };

  const getButtonClassName = () => {
    const baseClasses = "w-full text-white rounded-lg py-3 transition-colors duration-200";
    if (selectedType === 'signed') {
      return `${baseClasses} bg-[#01E969] hover:bg-[#00d65e]`;
    }
    return `${baseClasses} bg-[#000000] hover:bg-[#1a1a1a]`;
  };

  const handleSignUpAndReview = async () => {
    if (selectedType === 'signed' && !hasValidSession) {
      try {
        const userCredential = await signInWithPopup(auth, googleProvider);
        const user = userCredential.user;
        
        // Create new session
        const sessionData = await createSession(user);
        setHasValidSession(true);
        
        // Redirect to userReview page
        router.push(`/userReview?id=${productId}&reviewType=signed`);
        
        // Close the dialog
        onOpenChange(false);
      } catch (error) {
        console.error("Google Sign-In Error:", error);
      }
    } else {
      // Redirect to userReview page for anonymous or existing session
      router.push(`/userReview?id=${productId}&reviewType=${selectedType || 'anonymous'}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-1/2 -translate-x-1/2 bottom-0 w-full sm:max-w-md rounded-t-xl border-0 bg-white h-[490px] animate-in slide-in-from-bottom duration-300">
        <div className="p-6">
          <DialogHeader className="flex justify-center items-center">
            <DialogTitle className="text-xl font-semibold mb-6 text-center">
              Select Review Type
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <RadioGroup
              value={selectedType}
              onValueChange={handleReviewTypeSelect}
              className="space-y-3"
            >
              {/* Signed Review */}
              <div className="relative">
                <div
                  className={`bg-gray-50 rounded-lg cursor-pointer flex items-start gap-3 h-32 w-full border-2 transition-colors duration-200 ${
                    selectedType === 'signed' ? 'border-green-600' : 'border-transparent'
                  }`}
                  onClick={() => handleReviewTypeSelect('signed')}
                >
                  <div className="absolute inset-0 rounded-lg border border-gray-200 pointer-events-none"></div>
                  <div className="p-4 flex gap-3 w-full">
                    <RadioGroupItem
                      value="signed"
                      id="signed"
                      className="mt-1"
                    />
                    <div className="flex-1 overflow-hidden">
                      <label htmlFor="signed" className="font-medium block cursor-pointer">
                        Add a Signed Review
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Make your review count! Appear first, influence overall ratings, 
                        and enjoy the freedom to edit or delete anytime. Choose authenticity!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anonymous Review */}
              <div className="relative">
                <div
                  className={`bg-gray-50 rounded-lg cursor-pointer flex items-start gap-3 h-32 w-full border-2 transition-colors duration-200 ${
                    selectedType === 'anonymous' ? 'border-green-600' : 'border-transparent'
                  }`}
                  onClick={() => handleReviewTypeSelect('anonymous')}
                >
                  <div className="absolute inset-0 rounded-lg border border-gray-200 pointer-events-none"></div>
                  <div className="p-4 flex gap-3 w-full">
                    <RadioGroupItem
                      value="anonymous"
                      id="anonymous"
                      className="mt-1"
                    />
                    <div className="flex-1 overflow-hidden">
                      <label htmlFor="anonymous" className="font-medium block cursor-pointer">
                        Add an Anonymous Review
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Skip sign-up, but your review appears after Signed review. 
                        Doesn't impact overall ratings, and can't be edited.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RadioGroup>

            <Button
              onClick={handleSignUpAndReview}
              className={getButtonClassName()}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewTypeSelector;