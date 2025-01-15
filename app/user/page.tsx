'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './user.module.css';

interface Review {
  ratings: number;
  review: string;
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
}

export default function Home() {
  const [reviewPages, setReviewPages] = useState<ReviewPage[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (userId) {
      setIsLoading(true);
      fetch(`/api/review-stats?userId=${userId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('API Response:', data);
          if (data.error) {
            throw new Error(data.error);
          }
          setReviewPages(data.createdPages || []);
          setUserReviews(data.writtenReviews || []);
        })
        .catch(error => {
          console.error('Error fetching review stats:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userId]);

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>★</div>
        <h1 className={styles.title}>Ratings by Swadesic</h1>
      </header>

      <section>
        <h2 className={styles.sectionTitle}>Your Review Pages</h2>
        <Link href="/createReview" style={{ textDecoration: 'none', display: 'block' }}>
          <button className={styles.createButton}>
            Create Review Page
          </button>
        </Link>

        {reviewPages?.map((page) => (
          <div key={page?.reviewPageId} className={styles.reviewCard}>
            <div className={styles.cardLeft}>
              <img 
                src={page?.images?.[0] || '/placeholder.png'} 
                alt={page?.reviewPageName || 'Review page'}
                className={styles.productImage}
              />
              <div className={styles.reviewInfo}>
                <h3 className={styles.productName}>{page?.reviewPageName}</h3>
                <div className={styles.stats}>
                  <span className={styles.rating}>{page?.averageSignedInReviews?.toFixed(1)} ★</span>
                  <span className={styles.reviewCount}>
                    • {page?.totalReviews} reviews & {page?.signedInReviews} signed reviews
                  </span>
                </div>
                <span className={styles.date}>24/12/2024</span>
              </div>
            </div>
            <button className={styles.shareButton}>share</button>
          </div>
        ))}
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Your reviews</h2>
        {userReviews?.map((review, index) => (
          <div key={index} className={styles.reviewCard}>
            <div className={styles.cardLeft}>
              <img 
                src={review?.images?.[0] || '/placeholder.png'}
                alt="Review"
                className={styles.productImage}
              />
              <div className={styles.reviewInfo}>
                <h3 className={styles.productName}>Review</h3>
                <div className={styles.stats}>
                  <span className={styles.rating}>{review?.ratings?.toFixed(1)} ★</span>
                  <span className={styles.reviewCount}> • {review?.images?.length || 0} 📷 • {review?.review}</span>
                </div>
                <span className={styles.date}>
                  {new Date(review?.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}