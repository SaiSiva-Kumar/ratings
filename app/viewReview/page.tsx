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

  // NEW: Add state for reviews and stats
  const [reviews, setReviews] = useState<ReviewSubmission[]>([]);
  const [stats, setStats] = useState({
    signedInReviewCount: 0,
    averageRating: 0
  });

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
        
        // NEW: Update reviews and stats state
        setReviews(data.reviews);
        setStats({
          signedInReviewCount: data.signedInReviewCount,
          averageRating: data.averageRating
        });
        
        // Comprehensive console logging
        console.log('Total Reviews:', data.reviews.map(review => ({
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
  
      fields.forEach(field => {
        formData.append(field.key, field.value);
      });
  
      selectedFiles.slice(0, 2).forEach((file, index) => {
        formData.append('images', file);
      });
  
      const response = await fetch('/api/review-submission', {
        method: 'POST',
        body: formData
      });
  
      console.log('Response status:', response.status);
      const responseJson = await response.json;
  
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
      
      // Fetch and update reviews after submission
      const refreshResponse = await fetch(`/api/reviews-list?id=${id}`);
      const refreshData = await refreshResponse.json();
      
      // NEW: Update reviews and stats after submission
      setReviews(refreshData.reviews);
      setStats({
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

      {/* NEW: Reviews List Section */}
      {stats.signedInReviewCount > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Overall Signed Reviews
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '700', color: '#000' }}>
              {stats.averageRating.toFixed(2)}{' '}
              <span style={{ color: '#FFD700' }}>★★★★★</span>
            </span>
          </div>

          <div>
            {reviews.map((review, idx) => (
              <div key={`review-${idx}`} style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '1.5rem' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
                    Review Summary
                  </h3>
                  <div style={{ display: 'flex', color: '#FFD700', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {[...Array(5)].map((_, starIdx) => (
                      <span
                        key={`star-${idx}-${starIdx}`}
                        style={{ color: starIdx < review.ratings ? '#FFD700' : '#D3D3D3' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Display images for this review */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {review.images && review.images.length > 0 && review.images.map((image, imageIdx) => (
                      <img
                        key={`review-image-${idx}-${imageIdx}`}
                        src={image} 
                        alt={`Review image ${imageIdx + 1}`}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                    ))}
                  </div>

                  <p style={{ color: '#1F2937', marginBottom: '1rem' }}>{review.summary}</p>
                </div>

                {/* Review description below the images */}
                <p style={{ color: '#4B5563', marginBottom: '1rem' }}>{review.review}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6B7280' }}>
                  <span key={`userName-${idx}`}>
                    {review.userName === 'Anonymous User' ? 'Anonymous' : review.userName}
                  </span>
                  <span key={`createdAt-${idx}`}>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}