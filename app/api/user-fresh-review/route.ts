import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const userId = url.searchParams.get('userId');
    const reviewType = url.searchParams.get('reviewType') || 'signed';

    console.log('Fetching user review:', { 
      productId, 
      userId, 
      reviewType
    });

    if (!productId) {
      return NextResponse.json({ 
        error: 'Product ID is required' 
      }, { status: 400 });
    }

    // Prepare query conditions based on review type
    const queryConditions = reviewType === 'signed' 
      ? { 
          id: productId,
          userId: userId,
          // Exclude anonymous user IDs for signed reviews
          isAnonymous: false
        }
      : { 
          id: productId,
          // For anonymous reviews, userId must contain '_'
          isAnonymous: true
        };

    const userReview = await prisma.review_submission.findFirst({
      where: queryConditions,
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
        createdAt: true
      }
    });

    console.log('Fetched User Review:', userReview);

    if (!userReview) {
      return NextResponse.json({ 
        error: 'No review found for this product and user type' 
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