'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import styles from './createReview.module.css';
import '../styles/global.css';
import { supabase } from '../../supabase/supbaseclient';
import { useRouter, useSearchParams, notFound } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface FormData {
  category: string;
  categoryName: string;
  description: string;
  swadesicUrl: string;
  images: File[];
  isListed: boolean;
}

export default function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const origin = searchParams.get('origin');
    const userAuthString = localStorage.getItem('userAuth');
    
    if (origin !== 'userPage' || !userAuthString){
      notFound();
    }

  }, [searchParams]);
  

  const [formData, setFormData] = useState<FormData>({
    category: '',
    categoryName: '',
    description: '',
    swadesicUrl: '',
    images: [],
    isListed: false
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value
    }));
  };

  const uploadImagesToSupabase = async (files: File[], category: string) => {
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const folderName = category === 'product' ? 'product images' : 'service images';
        const fileName = `${folderName}/${uuidv4()}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) {
          console.error('Error uploading file:', error.message);
          continue;
        }

        if (data?.path) {
          const { data: fileData } = await supabase.storage
            .from('images')
            .getPublicUrl(data.path);

          if (fileData?.publicUrl) {
            uploadedUrls.push(fileData.publicUrl);
          }
        }
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Error in image upload:', error);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userId = localStorage.getItem('userAuth')
        ? JSON.parse(localStorage.getItem('userAuth')).uid
        : null;
      
      console.log('User ID:', userId);

      if (!userId) {
        throw new Error('User not authenticated');
      }
  
      // Validate required fields
      if (!formData.category || !formData.categoryName) {
        throw new Error('Category and name are required');
      }
  
      // Upload images to Supabase Storage
      let uploadedImageUrls: string[] = [];
      if (formData.images.length > 0) {
        uploadedImageUrls = await uploadImagesToSupabase(formData.images, formData.category);
      }
  
      // Send data to API including image URLs
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          category: formData.category,
          name: formData.categoryName,
          description: formData.description,
          url: formData.isListed ? formData.swadesicUrl : undefined,
          images: uploadedImageUrls
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create review');
      }
  
      const result = await response.json();
      console.log('Review created:', result);
      router.push(`${window.location.origin}/${result.reviewUrl}`)
    } catch (error) {
      console.error('Error creating review:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const updatedFiles = [...formData.images, ...newFiles].slice(0, 2);
    const updatedPreviewUrls = updatedFiles.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({ 
      ...prev, 
      images: updatedFiles 
    }));
    setImageUrls(updatedPreviewUrls);
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      URL.revokeObjectURL(imageUrls[index]);
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
    
    setImageUrls(prev => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const isProduct = formData.category === 'product';

  const previewImages = imageUrls.map((imageUrl, index) => (
    <div key={index} className="image-preview relative">
      <Image
        src={imageUrl}
        alt={`Image ${index + 1}`}
        width={100}
        height={100}
      />
      <button 
        type="button"
        onClick={() => removeImage(index)}
        className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold m-1 hover:bg-red-600 transition-colors"
      >
        ✕
      </button>
    </div>
  ));

  const handleBackClick = () => {
    router.push('/user');
  };


return (
  <div className={styles.formContainer}>
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <button 
          className={`${styles.backButton} flex items-center`} 
          onClick={handleBackClick}
        >
          <ArrowLeft className="mr-[0.8rem]" /> 
          Create Review Page
        </button>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Select Category</label>
        <select
          className={styles.formSelect}
          value={formData.category}
          onChange={handleCategoryChange}
        >
          <option value="">Category</option>
          <option value="product">Product</option>
          <option value="service">Service</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          {isProduct ? 'Product Name' : 'Service Name'}
        </label>
        <input
          type="text"
          placeholder={`Enter ${isProduct ? 'product' : 'service'} name`}
          className={styles.formInput}
          value={formData.categoryName}
          maxLength={20}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, categoryName: e.target.value }))
          }
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          {isProduct ? 'Product Images' : 'Service Images'} (up to 2) (optional)
        </label>
        <button
          type="button"
          onClick={() => document.getElementById('file-upload')?.click()}
          className={styles.uploadButton}
        >
          Upload Image
        </button>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          className={styles.hidden}
          onChange={handleImageChange}
        />
      </div>

      <div className={styles.imagePreviews}>{previewImages}</div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Description</label>
        <textarea
          placeholder="Description"
          className={styles.formTextarea}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          Did you list this {isProduct ? 'product' : 'service'} in your Swadesic Store?
        </label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              className={styles.radioInput}
              checked={formData.isListed === true}
              onChange={() => setFormData((prev) => ({ ...prev, isListed: true }))}
            />
            <span>Yes</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              className={styles.radioInput}
              checked={formData.isListed === false}
              onChange={() => setFormData((prev) => ({ ...prev, isListed: false }))}
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {formData.isListed && (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Swadesic URL of the {isProduct ? 'Product' : 'Service'}
          </label>
          <input
            type="url"
            placeholder="Enter URL"
            className={styles.formInput}
            value={formData.swadesicUrl}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, swadesicUrl: e.target.value }))
            }
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <button 
          type="submit" 
          className={`${styles.submitButton} ${(!formData.category || !formData.categoryName) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!formData.category || !formData.categoryName}
        >
          Create Review Page
        </button>
      </div>
    </form>
  </div>
);

}