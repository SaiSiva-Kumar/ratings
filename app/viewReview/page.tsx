'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, FormEvent } from 'react';
import styles from './viewReview.module.css';
import '../styles/global.css';
// import '../styles/reviewglobal.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth, googleProvider } from '../../app/firebaseconfig';
import { signInWithPopup } from "firebase/auth";
import ReviewTypeSelector from '../button/page';
import ReviewForm from '../reviewForm/page';
import ReviewSelectionUI from '../example/page';
import { ArrowLeft } from 'lucide-react';

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

export default function ViewReviewPage({ 
  initialId, 
  onAddReviewClick, 
  onReviewTypeSelect 
}: { 
  initialId?: string | null, 
  onAddReviewClick?: () => void, 
  onReviewTypeSelect?: (type: 'signed' | 'anonymous') => void 
} = {}) {
  const searchParams = useSearchParams();
  const id = initialId || searchParams.get('id');
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showReviewInput, setShowReviewInput] = useState(false);
  const [user, setUser] = useState<unknown>(null);

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

  const [showReviewTypePopup, setShowReviewTypePopup] = useState(false);
  const [selectedReviewType, setSelectedReviewType] = useState<'signed' | 'anonymous' | null>(null);

  const [selectedImage, setSelectedImage] = useState<{ url: string, type: Review['category'] } | null>(null);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleReviewTypeSelect = (type: 'signed' | 'anonymous') => {
    if (onReviewTypeSelect) {
      onReviewTypeSelect(type);
    } else {
      setSelectedReviewType(type);
      setShowReviewTypePopup(false);
    }
  };

  const handleAddReviewClick = () => {
    if (onAddReviewClick) {
      onAddReviewClick();
    } else {
      setShowReviewTypePopup(true);
    }
  };

  const handleCloseReviewForm = () => {
    setShowReviewInput(false);
    setSelectedReviewType(null);
  };

  const fetchReviewList = async () => {
    if (!id) return;
  
    try {
      const response = await fetch(`/api/reviews-list?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch review list');
      }
      const data = await response.json();
      
      // Update reviews and stats state
      setReviews(data.reviews);
      setStats({
        signedInReviewCount: data.signedInReviewCount,
        averageRating: data.averageRating
      });
  
    } catch (err) {
      console.error('Error fetching review list:', err);
    }
  };

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

    fetchReview();
    fetchReviewList();
  }, [id]);

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
        { key: 'isAnonymous', value: (user === null).toString() },
        { key: 'ratings', value: rating.toString() },
        { key: 'review', value: reviewText },
        { key: 'summary', value: reviewSummary }
      ];
  
      fields.forEach(field => {
        formData.append(field.key, field.value);
      });
  
      selectedFiles.slice(0, 2).forEach((file) => {
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
  
      alert('Review submitted successfully!');
      
      // Fetch and update reviews after submission
      const refreshResponse = await fetch(`/api/reviews-list?id=${id}`);
      const refreshData = await refreshResponse.json();
      
      // Update reviews and stats after submission
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
      setError(null);
    } catch (error) {
      console.error('Full submit review error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };

  const handleImageClick = (imageUrl: string, category: Review['category']) => {
    setSelectedImage({ url: imageUrl, type: category });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const router = useRouter();
  const handleBackClick = () => {
    const userAuth = localStorage.getItem('userAuth');
    
    if (!userAuth) {
      router.push('/user');
    } else {
      router.push('/');
    }
    
  };

  // Helper function to render dynamic stars based on average rating
  const renderDynamicStars = (averageRating: number) => {
    const fullStars = Math.floor(averageRating);
    const emptyStars = 5 - fullStars;
    
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        {[...Array(fullStars)].map((_, index) => (
          <Image 
            key={`full-star-${index}`} 
            src="/images/Vector.png" 
            alt="Filled Star" 
            width={22.83} 
            height={21.8} 
          />
        ))}
        
        {[...Array(emptyStars)].map((_, index) => (
          <Image 
            key={`empty-star-${index}`} 
            src="/images/Vector_2.png" 
            alt="Unfilled Star" 
            width={22.83} 
            height={21.8} 
          />
        ))}
      </div>
    );
  };

  // Modify star rendering for interactive star selection
  const renderInteractiveStars = () => {
    return (
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((starValue) => (
          <Image 
            key={starValue}
            src={starValue <= rating ? "/images/Vector.png" : "/images/Vector_2.png"}
            alt={starValue <= rating ? "Filled Star" : "Unfilled Star"}
            width={22.83}
            height={21.8}
            onClick={() => handleStarClick(starValue)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    );
  };

  // Helper function to truncate description to 15 words
  const truncateDescription = (text: string, wordLimit: number = 15) => {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Render description with view more functionality
  const renderDescription = () => {
    const description = review.Description;
    
    if (description.split(/\s+/).length <= 15) {
      return <p className={styles.description}>{description}</p>;
    }

    return (
      <p className={styles.description}>
        {isDescriptionExpanded ? description : truncateDescription(description)}
        {!isDescriptionExpanded && (
          <button 
            onClick={() => setIsDescriptionExpanded(true)}
            className={styles.viewMoreButton}
          >
            view more
          </button>
        )}
        {isDescriptionExpanded && (
          <button 
            onClick={() => setIsDescriptionExpanded(false)}
            className={styles.viewMoreButton}
          >
            view less
          </button>
        )}
      </p>
    );
  };

  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!review) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <button 
        className={`${styles.backButton} flex items-center`} 
        onClick={handleBackClick}
      >
        <ArrowLeft className="mr-[0.8rem]" /> 
        {review.category === 'product' ? 'Product Review' : 'Service Review'}
      </button>

      <div className={`${styles.imageContainer} mt-4`}>
        {review.images.map((imageUrl, index) => (
            <div key={index} className={styles.imagePreview}>
              <Image
                src={imageUrl}
                alt={`${review.category} Image ${index + 1}`}
                className={styles.clickableImage}
                width={100} // Adjust width based on your design
                height={100} // Adjust height based on your design
                objectFit="cover" // Optional: adjust how the image should be fitted
                onClick={() => handleImageClick(imageUrl, review.category)}
              />
          </div>
        ))}
      </div>

      <h2 className={styles.title}>{review.name}</h2>
      {renderDescription()}

      {!showReviewInput && (
        <button 
          className={styles.addReviewButton} 
          onClick={handleAddReviewClick}
        >
          Add a Review
        </button>
      )}

      {/* Review Type Selector Popup */}
      <ReviewSelectionUI 
        isOpen={showReviewTypePopup}
        onClose={() => setShowReviewTypePopup(false)}
        productId={id || ''}
      />

      {/* Review Form - Conditionally Rendered */}
      {selectedReviewType && id && (
        <ReviewForm 
          onClose={handleCloseReviewForm}
          reviewType={selectedReviewType}
          productId={id}
          onSubmitSuccess={() => {
            // Optional: Refresh reviews or perform post-submission actions
            fetchReviewList();
          }}
        />
      )}

      {/* Existing review list and details */}
      {stats.signedInReviewCount > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', fontFamily: 'Roboto, sans-serif' }}>
            Overall Signed Reviews
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: '700', color: '#000', fontFamily: 'Roboto, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{stats.averageRating.toFixed(1)}</span>
                {renderDynamicStars(stats.averageRating)}
              </div>
            </span>
          </div>

          <div>
            {reviews.map((review) => (
              <div key={review.id} style={{ paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: '#1F2937', 
                        margin: 0,
                        marginBottom: '0.5rem',
                        fontFamily: 'Roboto, sans-serif',
                        marginTop:'20px'
                      }}>
                        {review.summary}
                      </h3>
                      
                      {/* Stars moved below summary */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem' }}>
                        {[...Array(review.ratings)].map((_, starIdx) => (
                          <Image 
                            key={`filled-star-${starIdx}`} 
                            src="/images/Vector.png" 
                            alt="Filled Star" 
                            width={22.83} 
                            height={21.8} 
                          />
                        ))}
                        {[...Array(5 - review.ratings)].map((_, starIdx) => (
                          <Image 
                            key={`empty-star-${starIdx}`} 
                            src="/images/Vector_2.png" 
                            alt="Unfilled Star" 
                            width={22.83} 
                            height={21.8} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Display images for this review */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      {review.images && review.images.length > 0 && review.images.map((imageUrl, imageIdx) => (
                        <Image
                          key={`review-image-${review.id}-${imageIdx}`}
                          src={imageUrl}
                          alt={`Review image ${imageIdx + 1}`}
                          width={50}
                          height={50}
                          style={{ borderRadius: '4px' }}
                          objectFit="cover"
                          onClick={() => handleImageClick(imageUrl, review.category)}
                          className={styles.clickableImage}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Single review text */}
                <p style={{ color: '#000000', marginBottom: '1rem', fontFamily: 'Roboto, sans-serif' }}>{review.review}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#000000',fontWeight: '600' , fontFamily: 'Roboto, sans-serif' }}>
                  <span key={`userName-${review.id}`}>
                    {review.userName === 'Anonymous User' ? 'Anonymous' : review.userName}
                  </span>
                  <span key={`createdAt-${review.id}`}>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedImage && (
        <div className={styles.imageModal} onClick={closeImageModal}>
          <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.closeModal} onClick={closeImageModal}>&times;</span>
            <Image 
              src={selectedImage.url} 
              alt={`${selectedImage.type} image`} 
              layout="responsive" 
              width={1000} 
              height={1000} 
              className={styles.modalImage}
            />
          </div>
        </div>
      )}
    </div>
  );
}