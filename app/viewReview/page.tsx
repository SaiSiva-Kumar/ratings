'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import styles from './viewReview.module.css';
import { auth, googleProvider } from '../../app/firebaseconfig';
import { signInWithPopup } from "firebase/auth";
import { createClient } from '@supabase/supabase-js';

interface Review {
  id: string;
  userId: string;
  category: 'product' | 'service';
  name: string;
  Description: string;
  images: string[];
  url: string | null;
}

interface ReviewSubmission {
  id: string;
  userId: string;
  userImage: string | null;
  userName: string | null;
  ratings: number;
  review: string;
  summary: string;
  images: string[];
  createdAt: string;
}

export default function ViewReviewPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showReviewType, setShowReviewType] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showReviewInput, setShowReviewInput] = useState(false);

  const [rating, setRating] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  const [previews, setPreviews] = useState<string[]>([]); 
  
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSummary, setReviewSummary] = useState<string>('');

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/product?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch review');
        }
        const data = await response.json();
        setReview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching review');
      }
    };

    const fetchReviewList = async () => {
      if (!id) return;
    
      try {
        const response = await fetch(`/api/reviews-list?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch review list');
        }
        const data = await response.json();
        
        // Comprehensive console logging
        console.log('Signed-In Reviews:', data.reviews.map(review => ({
          id: review.id,
          userId: review.userId,
          userImage: review.userImage,
          userName: review.userName,
          ratings: review.ratings,
          review: review.review,
          summary: review.summary,
          images: review.images,
          createdAt: review.createdAt
        })));
    
        console.log('Review Statistics:', {
          signedInReviewCount: data.signedInReviewCount,
          averageRating: data.averageRating
        });
    
      } catch (err) {
        console.error('Error fetching review list:', err);
      }
    };

    fetchReview();
    fetchReviewList();
  }, [id]);

  const handleAddReviewClick = () => {
    setShowReviewType(true);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleSignedReviewSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;    
      setUser(user);
      setShowReviewInput(true);
    } catch (error) {
      console.error('Sign-in error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleStarClick = (index: number) => {
    setRating(index);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const combinedFiles = [...selectedFiles, ...Array.from(files)].slice(0, 2);
      setSelectedFiles(combinedFiles);

      const filePreviewUrls = combinedFiles.map(file => URL.createObjectURL(file));
      setPreviews(filePreviewUrls);
    }
  };

  const removePreview = (indexToRemove: number) => {
    setPreviews(previews.filter((_, index) => index !== indexToRemove));
    setSelectedFiles(selectedFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
  
    if (!id) {
      setError('No review ID found');
      return;
    }
  
    if (rating === 0) {
      setError('Please provide a rating');
      return;
    }
  
    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }
  
    if (reviewSummary.trim().length < 5) {
      setError('Review summary must be at least 5 characters long');
      return;
    }
  
    try {
      const formData = new FormData();
      
      // Log each field being added
      const fields = [
        { key: 'id', value: id },
        { key: 'userId', value: user?.uid || 'anonymous' },
        { key: 'userName', value: user?.displayName || 'Anonymous User' },
        { key: 'userImage', value: user?.photoURL || '/anonymous-avatar.png' },
        { key: 'isAnonymous', value: (selectedOption === 'anonymousReview').toString() },
        { key: 'ratings', value: rating.toString() },
        { key: 'review', value: reviewText },
        { key: 'summary', value: reviewSummary }
      ];
  
      // Add fields to FormData and log each one
      fields.forEach(field => {
        formData.append(field.key, field.value);
      });
  
      // // Log files being added
      selectedFiles.slice(0, 2).forEach((file, index) => {
        formData.append('images', file);
      });
  
      // // Log entire FormData contents
      // for (let [key, value] of formData.entries()) {
      //   console.log(`FormData Entry - ${key}:`, value);
      // }
  
      const response = await fetch('/api/review-submission', {
        method: 'POST',
        body: formData
      });
  
      // Log raw response
      console.log('Response status:', response.status);
      const responseJson = await response.json;
  
      // Try parsing as JSON
      try {
        console.log('Parsed Response:', responseJson);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
      }
  
      if (!response.ok) {
        throw new Error(responseJson || 'Failed to submit review');
      }
  
      const result = await response.json();
  
      alert('Review submitted successfully!');
      
      // Fetch and log review list after submission
      const refreshResponse = await fetch(`/api/reviews-list?id=${id}`);
      const refreshData = await refreshResponse.json();
      
      console.log('Updated Signed-In Reviews:', refreshData.reviews);
      console.log('Updated Review Statistics:', {
        signedInReviewCount: refreshData.signedInReviewCount,
        averageRating: refreshData.averageRating
      });
      
      setRating(0);
      setReviewText('');
      setReviewSummary('');
      setSelectedFiles([]);
      setPreviews([]);
      setShowReviewInput(false);
      setShowReviewType(false);
      setError(null);
    } catch (error) {
      console.error('Full submit review error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };

  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!review) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <button className={styles.backButton}>
        &larr; {review.category === 'product' ? 'Product Review' : 'Service Review'}
      </button>

      <div className={styles.imageContainer}>
        {review.images.map((image, index) => (
          <img key={index} src={image} alt={`Image ${index + 1}`} className={styles.image} />
        ))}
      </div>

      <h2 className={styles.title}>{review.name}</h2>
      <p className={styles.description}>{review.Description}</p>

      {!showReviewType && !showReviewInput && (
        <button className={styles.addReviewButton} onClick={handleAddReviewClick}>
          Add a Review
        </button>
      )}

      {showReviewType && !showReviewInput && (
        <div className={styles.reviewTypeContainer}>
          <div className={styles.reviewOption}>
            <label>
              <input
                type="radio"
                name="reviewType"
                value="signedReview"
                onChange={() => handleOptionChange('signedReview')}
              />
              <strong>Add a Signed Review</strong>
              <p>
                Make your review count! Appear first, influence overall ratings, and enjoy the
                freedom to edit or delete anytime. Choose authenticity!
              </p>
            </label>
          </div>

          <div className={styles.reviewOption}>
            <label>
              <input
                type="radio"
                name="reviewType"
                value="anonymousReview"
                onChange={() => handleOptionChange('anonymousReview')}
              />
              <strong>Add an Anonymous Review</strong>
              <p>
              Skip sign-up, but your review appears after Signed review. Doesn&apos;t impact overall
              ratings, and can&apos;t be edited.
              </p>
            </label>
          </div>

          {selectedOption === 'signedReview' && (
            <button 
              className={styles.signedReviewButton} 
              onClick={handleSignedReviewSignIn}
            >
              Sign Up & Review
            </button>
          )}
          {selectedOption === 'anonymousReview' && (
            <button 
              className={styles.anonymousReviewButton}
              onClick={() => setShowReviewInput(true)}
            >
              Skip Sign-Up & Review
            </button>
          )}
        </div>
      )}

      {showReviewInput && (
        <form onSubmit={handleSubmitReview} className={styles.reviewInputContainer}>
          {user ? (
            <div className={styles.userInfoContainer}>
              <img 
                src={user.photoURL || '/default-avatar.png'} 
                alt={user.displayName || 'User'} 
                className={styles.userAvatar}
              />
              <span className={styles.userName}>{user.displayName}</span>
            </div>
          ) : selectedOption === 'anonymousReview' && (
            <div className={styles.userInfoContainer}>
              <img 
                src="/anonymous-avatar.png" 
                alt="Anonymous User" 
                className={styles.userAvatar}
              />
              <span className={styles.userName}>Anonymous User</span>
            </div>
          )}

          <div className={styles.starRating}>
            <p>Ratings</p>
            <div className={styles.starsContainer}>
              {[...Array(5)].map((_, index) => (
                <span
                  key={index}
                  className={`${styles.star} ${index < rating ? styles.filled : ''}`}
                  onClick={() => handleStarClick(index + 1)}
                >
                  &#9733;
                </span>
              ))}
            </div>
          </div>

          <p>Review in Detail</p>
          <textarea
            placeholder="Write a detailed review"
            className={styles.detailedReview}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
          ></textarea>

          <p>Review Summary</p>
          <input
            type="text"
            placeholder="Summarize your review as Review Title"
            className={styles.reviewSummary}
            value={reviewSummary}
            onChange={(e) => setReviewSummary(e.target.value)}
            required
          />

          <div className={styles.uploadSection}>
            <label htmlFor="upload" className={styles.uploadLabel}>
              Upload Images
            </label>
            <input 
              type="file" 
              id="upload" 
              accept="image/*" 
              multiple 
              className={styles.uploadInput} 
              onChange={handleFileChange}
            />
            <label htmlFor="upload" className={styles.uploadButton}>
              Choose Files
            </label>

            {previews.length > 0 && (
              <div className={styles.imageContainer}>
                {previews.map((preview, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className={styles.image}
                    />
                    <button 
                      className={styles.removePreviewButton}
                      onClick={() => removePreview(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className={styles.submitButton}>Submit Review</button>
        </form>
      )}
    </div>
  );
}