'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ReviewForm from '../reviewForm/page';
import UploadCard from '../uploading/page';
import styles from './userReview.module.css';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  images: string[];
  category: 'product' | 'service';
  description: string;
}

interface UserReview {
  id: string;
  userId: string;
  userImage: string | null;
  userName: string | null;
  ratings: number;
  review: string;
  summary: string;
  images: string[];
  createdAt: string;
  category?: 'product' | 'service';
}

export default function UserReviewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const reviewId = searchParams.get('reviewId');
  const reviewType = searchParams.get('reviewType') as 'signed' | 'anonymous' | null;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [showReviewTypeSelector, setShowReviewTypeSelector] = useState(false);
  const [selectedReviewType, setSelectedReviewType] = useState<'signed' | 'anonymous' | null>(reviewType);
  const [showReviewForm, setShowReviewForm] = useState(reviewType ? true : false);
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const response = await fetch(`/api/product?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        console.log('Full Product Data:', JSON.stringify(data, null, 2));
        console.log('Product Description:', data.Description);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchUserReview = async () => {
      if (!reviewId) return;

      try {
        const response = await fetch(`/api/user-fresh-review?dummyId=${reviewId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch review');
        }
        
        const reviewData = await response.json();
        const dataId = reviewData.id;

        if(id !== dataId) return router.push('/404')

        setUserReview(reviewData);
        setShowReviewForm(false);
      } catch (error) {
        console.error('Error fetching user review:', error);
      }
    };

    fetchUserReview();
  }, [reviewId]);

  const handleReviewTypeSelect = (type: 'signed' | 'anonymous') => {
    setSelectedReviewType(type);
    setShowReviewTypeSelector(false);
    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
    setSelectedReviewType(null);
  };

  const handleReviewSubmitSuccess = async (dummyId: number) => {
    try {
      setIsUploading(true);

      if (!dummyId) {
        console.error('No dummyId provided');
        setIsUploading(false);
        return;
      }

      const response = await fetch(`/api/user-fresh-review?dummyId=${dummyId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch review');
      }
      
      const reviewData = await response.json();
      setUserReview(reviewData);
      setShowReviewForm(false);
      
      setIsUploading(false);
    } catch (error) {
      console.error('Error fetching user review:', error);
      alert('Could not retrieve your review. Please try again.');
      setIsUploading(false);
    }
  };

  const handleBackClick = () => {
    window.history.back();
  };

  const handleImageClick = (imageUrl: string, category: 'product' | 'service') => {
    // Implement image click logic if required
    console.log('Image clicked:', imageUrl, category);
  };

  const truncateDescription = (text: string, wordLimit: number = 15) => {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <button 
        onClick={handleBackClick} 
        className={styles.backButton}
      >
        <ArrowLeft size={24} /> Add a Review
      </button>

      {product && (
        <div className={styles.imageContainer}>
          {product.images.slice(0, 2).map((image, index) => (
            <Image 
              key={index}
              src={image} 
              alt={`${product.name} image ${index + 1}`} 
              width={120} 
              height={120} 
              className={styles.image}
              style={{ objectFit: 'cover' }}
            />
          ))}
        </div>
      )}

      {product && (
        <h1 className={styles.title}>{product.name}</h1>
      )}

      {/* Product Description or Summary */}
      {product && (
        <div className={styles.descriptionContainer}>
          <p className={styles.description}>
            {(() => {
              if (userReview) {
                return isDescriptionExpanded 
                  ? product.Description 
                  : truncateDescription(product.Description);
              }
              return null;
            })()}
            {userReview && product.Description && product.Description.split(/\s+/).length > 15 && (
              <button 
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className={styles.viewMoreButton}
              >
                {isDescriptionExpanded ? 'View Less' : 'View More'}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Show review form only if no review exists and no reviewId is present */}
      {!userReview && !reviewId && showReviewForm && selectedReviewType && id && (
        <ReviewForm 
          productId={id} 
          reviewType={selectedReviewType} 
          onClose={handleCloseReviewForm}
          onSubmitSuccess={handleReviewSubmitSuccess}
        />
      )}

      {/* Newly Added User Review Display */}
      {userReview && (
        <div style={{ paddingBottom: '1.5rem' }}>
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
                  {userReview.summary}
                </h3>
                
                {/* Stars moved below summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem' }}>
                  {[...Array(userReview.ratings)].map((_, starIdx) => (
                    <Image 
                      key={`filled-star-${starIdx}`} 
                      src="/images/Vector.png" 
                      alt="Filled Star" 
                      width={22.83} 
                      height={21.8} 
                    />
                  ))}
                  {[...Array(5 - userReview.ratings)].map((_, starIdx) => (
                    <Image 
                      key={`empty-star-${starIdx}`} 
                      src="/images/Vector_2.png" 
                      alt="Unfilled Star" 
                      width={22.83} 
                      height={21.8} 
                    />
                  ))}
                </div>

              {/* Display images for this review */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                {userReview.images && userReview.images.length > 0 && userReview.images.map((imageUrl, imageIdx) => (
                  <Image
                    key={`review-image-${userReview.id}-${imageIdx}`}
                    src={imageUrl}
                    alt={`Review image ${imageIdx + 1}`}
                    width={90}
                    height={90}
                    className={styles.image}
                    onClick={() => handleImageClick(imageUrl, userReview.category || 'product')}
                  />
                ))}
              </div>
            </div>
            <p style={{ color: '#000000', marginBottom: '1rem', fontFamily: 'Roboto, sans-serif' }}>{userReview.review}</p>

              {/* Display username and created date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#000000',fontWeight: '600' , fontFamily: 'Roboto, sans-serif' }}>
                  <span key={`userName-${userReview.id}`}>
                    {userReview.userName === 'Anonymous User' ? 'Anonymous' : userReview.userName}
                  </span>
                  <span key={`createdAt-${userReview.id}`}>{new Date(userReview.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
          </div>
        </div>
      )}

      {(userReview || reviewId) && (
        <div className={`${styles.shareReviewImageContainer} absolute top-4 right-4`}>
          <Image
            src="/images/share_review_page.png"
            alt="Share Review"
            width={13.5}
            height={15}
            className={styles.shareReviewImage}
          />
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <UploadCard />
        </div>
      )}
    </div>
  );
}