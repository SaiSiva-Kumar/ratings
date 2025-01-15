// lib/product.ts
import { supabase } from '../supabase/supbaseclient'; // Create and configure supabaseClient.js or supabaseClient.ts
import prisma from './prismaClient'; // Import Prisma client

const uploadImage = async (file: File) => {
  const filePath = `products/${file.name}`;
  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    return null;
  }

  const publicUrl = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath).publicURL;

  return publicUrl;
};

const createProduct = async (formData, firebaseUserId) => {
  const uploadedImages = await Promise.all(
    formData.images.map(async (file) => await uploadImage(file))
  );

  const newProduct = await prisma.product.create({
    data: {
      userId: firebaseUserId,
      productName: formData.productName,
      productDescription: formData.description,
      url: formData.swadesicUrl || null,
    },
  });

  await Promise.all(
    uploadedImages.map(async (imageUrl) => {
      if (imageUrl) {
        await prisma.image.create({
          data: {
            productId: newProduct.id,
            url: imageUrl,
          },
        });
      }
    })
  );

  return newProduct;
};

export { uploadImage, createProduct };
