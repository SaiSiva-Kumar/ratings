import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const userId = url.searchParams.get('userId');

    console.log('Fetching user review:', { productId, userId });

    if (!productId || !userId) {
      return NextResponse.json({ 
        error: 'Product ID and User ID are required' 
      }, { status: 400 });
    }

    const userReview = await prisma.review_submission.findFirst({
      where: { 
        id: productId,  // product ID
        userId: userId 
      },
      orderBy: { createdAt: 'desc' }, // Most recent first
      select: {
        id: true,
        userId: true,
        userName: true,
        userImage: true,
        ratings: true,
        review: true,
        summary: true,
        images: true,
        createdAt: true,
        isAnonymous: true
      }
    });

    console.log('Fetched User Review:', userReview);

    if (!userReview) {
      return NextResponse.json({ 
        error: 'No review found for this product and user' 
      }, { status: 404 });
    }

    return NextResponse.json(userReview);
  } catch (error) {
    console.error('Error fetching user product review:', error);
    return NextResponse.json({
      error: 'Failed to fetch user product review'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}