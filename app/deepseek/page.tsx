'use client';

import { useState, useEffect } from 'react';

interface FormData {
  productName: string;
  fullName: string;
  review: string;
  summary: string;
}

interface FormErrors {
  productName?: string;
  fullName?: string;
  review?: string;
  summary?: string;
}

export default function ReviewPage() {
  const [formData, setFormData] = useState<FormData>({
    productName: '',
    fullName: '',
    review: '',
    summary: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.review.trim()) newErrors.review = 'Review is required';
    if (!formData.summary.trim()) newErrors.summary = 'Summary is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      // Submit logic here (e.g., API call)
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000); // Reset after 3 seconds
    } else {
      setErrors(validationErrors);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md text-center">
          <h2 className="text-xl font-bold text-green-600 mb-4">Thank you for your review!</h2>
          <p className="text-gray-600">Your submission has been received.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add a Review</h1>
          <span className="text-gray-500">{currentTime}</span>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="productName" className="mb-2 block font-medium text-gray-700">
              Product or Service name - The name goes for 2
            </label>
            <input
              id="productName"
              name="productName"
              type="text"
              value={formData.productName}
              onChange={handleChange}
              className={`w-full rounded-lg border p-3 ${
                errors.productName ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              placeholder="Enter product or service name"
            />
            {errors.productName && <p className="text-red-500 text-sm mt-1">{errors.productName}</p>}
          </div>

          <div>
            <label htmlFor="fullName" className="mb-2 block font-medium text-gray-700">
              First Last Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full rounded-lg border p-3 ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="review" className="mb-2 block font-medium text-gray-700">
              Write a detailed review
            </label>
            <textarea
              id="review"
              name="review"
              rows={4}
              value={formData.review}
              onChange={handleChange}
              className={`w-full rounded-lg border p-3 ${
                errors.review ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              placeholder="Write your review here..."
            />
            {errors.review && <p className="text-red-500 text-sm mt-1">{errors.review}</p>}
          </div>

          <div>
            <label htmlFor="summary" className="mb-2 block font-medium text-gray-700">
              Review Summary
            </label>
            <input
              id="summary"
              name="summary"
              type="text"
              value={formData.summary}
              onChange={handleChange}
              className={`w-full rounded-lg border p-3 ${
                errors.summary ? 'border-red-500' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
              placeholder="Summarize your review as Review Title"
            />
            {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit Review
          </button>
        </form>
      </div>
    </main>
  );
}