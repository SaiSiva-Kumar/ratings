"use client";

import { auth, googleProvider } from "./firebaseconfig";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const userId = userCredential.user.uid;  
      localStorage.setItem('userId', userId); 
    
      
      router.push('/user');
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  return (
    <div className="container">
      <main className="card">
        <div className="icon">
          <div className="star"></div>
        </div>
        <h1>Ratings by Swadesic</h1>
        <p className="subtitle">
          Create your review page or start reviewing in less than a minute.
        </p>
        <div className="section">
          <h3>For Businesses:</h3>
          <ul>
            <li>📈 Build credibility with authentic reviews.</li>
            <li>🔗 Share reviews with new customers for easy conversions.</li>
          </ul>
          <h3>For Consumers:</h3>
          <ul>
            <li>⭐ Discover trusted reviews for smarter decisions.</li>
            <li>💬 Share your feedback and influence brands.</li>
          </ul>
        </div>
        <button 
          className="google-btn" 
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </button>
        <p className="terms">
          By signing in you are agreeing to <a href="#">Terms & Policies</a> of Socially X Influencer Centric Private Limited.
        </p>
      </main>
    </div>
  );
}