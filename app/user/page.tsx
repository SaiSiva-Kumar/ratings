'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './user.module.css';
import '../styles/global.css';

interface Review {
  id: string;
  ratings: number;
  review: string;
  summary?: string;
  createdAt: string;
  images: string[];
}

interface ReviewPage {
  reviewPageId: string;
  reviewPageName: string;
  images: string[];
  totalReviews: number;
  signedInReviews: number;
  averageSignedInReviews: number;
  pageURL: string;
  date: string;
}

export default function Home() {
  const router = useRouter();
  const [reviewPages, setReviewPages] = useState<ReviewPage[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add a utility function for logging session times
  const logSessionTimes = (currentTime: number, sessionExpiryTime: number) => {
    // Format current time in IST
    const currentTimeIST = new Date(currentTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    // Format expiry time in IST
    const expiryTimeIST = new Date(sessionExpiryTime).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    console.log('Current Time (IST):', currentTimeIST);
    console.log('Session Expiry Time (IST):', expiryTimeIST);
  };

  useEffect(() => {
    const userAuthString = localStorage.getItem('userAuth');
    if (userAuthString) {
      try {
        const userAuth = JSON.parse(userAuthString);
        
        // Session expiry check
        const currentTime = Date.now();
        const sessionExpiryTime = userAuth.sessionExpiryTime;

        // Log session times
        logSessionTimes(currentTime, sessionExpiryTime);

        if (currentTime > sessionExpiryTime) {
          // Session has expired
          console.warn('Session expired. Redirecting to login.');
          localStorage.removeItem('userAuth');
          router.push('/');  
          return;
        }

        const extractedUid = userAuth.uid || userAuth.user?.uid || null;
        setUserId(extractedUid);
        
      } catch (error) {
        console.error("Error parsing user auth from localStorage:", error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      console.log(userId)
      setIsLoading(true);
      fetch(`/api/review-stats?userId=${userId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log('API Response:', data);
          if (data.error) {
            throw new Error(data.error);
          }
          setReviewPages(data.createdPages || []);
          setUserReviews(data.writtenReviews || []);
        })
        .catch((error) => {
          console.error('Error fetching review stats:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userId]);

  const handleShareClick = (reviewPageId: string) => {
    if (!reviewPageId) return;

    const pageURL = `/viewReview?id=${reviewPageId}`;
    const fullURL = `${window.location.origin}${pageURL}`;
    
    // Check if clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullURL)
        .then(() => {
          setCopiedId(reviewPageId);
          setTimeout(() => setCopiedId(null), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy URL:', err);
          fallbackCopyToClipboard(fullURL);
        });
    } else {
      fallbackCopyToClipboard(fullURL);
    }
  };

  // Fallback method for copying to clipboard
  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopiedId(reviewPageId);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        console.error('Fallback copy failed');
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
    }

    document.body.removeChild(textArea);
  };

  const handleReviewClick = (id: string) => {
    const url = `/viewReview?id=${id}`;
    window.open(url, '_blank');
  };

  const truncateText = (text: string, length: number) => {
    return text.length > length ? `${text.slice(0, length)}...` : text;
  };

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image src="/images/solar_stars-bold-duotone.png" alt="Logo" width={50} height={50} />
        </div>
        <h1 className={styles.title}>Ratings by Swadesic</h1>
      </header>
  
      <section>
        <h2 className={reviewPages?.length === 0 ? styles.sectionTitleNoData : styles.sectionTitle}>Your Review Pages</h2>
  
        {reviewPages?.length === 0 && (
          <div className={styles.noData}>No review page yet, create one..</div>
        )}
  
        <button 
          className={reviewPages?.length === 0 ? styles.createButtonNoData : styles.createButton} 
          onClick={() => {
            router.push('/createReview?origin=userPage');
          }}
        >
          Create Review Page
        </button>
  
        {reviewPages?.map((page) => (
          <div key={page?.reviewPageId} className={styles.reviewCard}>
            <div className={styles.cardLeft}>
              <Image
                src={page?.images?.[0] || '/images/no_product.png'}
                alt={page?.reviewPageName || 'Review page'}
                width={100}
                height={100}
                className={styles.productImage}
              />
              <div className={styles.reviewInfo}>
                <h3 className={styles.productName}>{page?.reviewPageName}</h3>
                <div className={styles.stats}>
                  <span className={styles.rating}>
                    <span>{page?.averageSignedInReviews?.toFixed(1)}</span> ★
                  </span>
                  <span className={styles.reviewCount}>
                    • {page?.totalReviews} reviews & {page?.signedInReviews} signed reviews
                  </span>
                </div>
                <span className={styles.date}>
                  {new Date(page?.date).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
            <div className={styles.shareButtonWrapper}>
              {copiedId === page.reviewPageId && (
                <span className={styles.copiedMessage}>Copied!</span>
              )}
              <button
                className={styles.shareButton}
                onClick={() => handleShareClick(page.reviewPageId)}
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </section>
  
      <section>
        <h2 className={userReviews?.length === 0 ? styles.sectionTitleNoData : styles.sectionTitle}>Your Reviews</h2>
  
        {userReviews?.length === 0 && (
          <div className={styles.noData}>No reviews yet..</div>
        )}
  
        {userReviews?.map((review, index) => (
          <div key={index} className={styles.reviewCard}>
            <div className={styles.cardLeft}>
              <Image
                src={review?.images?.[0] || '/images/no_product.png'}
                alt="Review"
                width={100}
                height={100}
                className={styles.productImage}
              />
              <div className={styles.reviewInfo}>
                <h3 className={styles.productName}>{review?.summary || 'Review'}</h3>
                <div className={styles.stats}>
                  <span className={styles.rating}>
                    <span style={{ color: 'black' }}>{review?.ratings?.toFixed(1)}</span> ★
                  </span>
                  <span className={styles.reviewCount}>
                    • {review?.images?.length || 0} • {truncateText(review?.review, 25)}
                  </span>
                </div>
                <span className={styles.date}>
                  {new Date(review?.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
            <div
              className={styles.reviewButtonWrapper}
              onClick={() => handleReviewClick(review.id)}
            >
              Review
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
