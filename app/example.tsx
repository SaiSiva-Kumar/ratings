return (
    <div className="min-h-screen bg-emerald-300 flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Star Logo with corrected right-bottom overlap */}
        <div className="relative w-24 h-24 mb-8">
          {/* Larger dark green star */}
          <svg viewBox="0 0 24 24" className="absolute w-16 h-16 text-emerald-800 left-0">
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
          {/* Smaller white star, positioned at right-bottom */}
          <svg viewBox="0 0 24 24" className="absolute w-14 h-14 text-white" style={{ left: '20%', top: '20%' }}>
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
        
        {/* Main Title */}
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Ratings by Swadesic</h1>
        <p className="text-sm mb-8 text-gray-700">
          Create your review page or start reviewing in less than a minutes.
        </p>
        
        {/* Business Section */}
        <div className="w-full text-left mb-6">
          <h2 className="font-semibold mb-2 text-gray-800">For Businesses:</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 text-lg">⟰</span>
              <span className="text-gray-700">Build credibility with authentic reviews.</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-700 mr-2">↗</span>
              <span className="text-gray-700">Share reviews with new customers for easy conversions.</span>
            </li>
          </ul>
        </div>
        
        {/* Consumer Section */}
        <div className="w-full text-left mb-8">
          <h2 className="font-semibold mb-2 text-gray-800">For Consumers:</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="text-yellow-500 mr-2">⭐</span>
              <span className="text-gray-700">Discover trusted reviews for smarter decisions.</span>
            </li>
            <li className="flex items-start">
              <span className="text-emerald-700 mr-2">↗</span>
              <span className="text-gray-700">Share your feedback and influence brands.</span>
            </li>
          </ul>
        </div>
        
        {/* Sign in Button */}
        <button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg mb-4 hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
        
        {/* Terms Text */}
        <p className="text-xs text-gray-600">
          By signing in you are agreeing to{' '}
          <a href="#" className="text-emerald-500">Terms & Policies</a> of{' '}
          <a href="#" className="text-emerald-500">Socially X Influencer Centric Private Limited</a>
        </p>
      </div>
    </div>
  );