import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Query Create_review table to get user's first review
    const userCreateReview = await prisma.create_review.findFirst({
      where: { userId },
      select: {
        id: true,
        name: true,
        images: true
      }
    });

    if (!userCreateReview) {
      return NextResponse.json({ 
        error: 'No create review found for this user' 
      }, { status: 404 });
    }

    // Count total reviews for this user
    const totalReviewCount = await prisma.review_submission.count({
      where: { userId }
    });

    // Calculate average rating for signed-in reviews
    const ratingStats = await prisma.review_submission.aggregate({
      where: { 
        userId,
        isAnonymous: false // Only count signed-in reviews
      },
      _avg: {
        ratings: true
      },
      _count: {
        id: true
      }
    });

    return NextResponse.json({
      createReviewId: userCreateReview.id,
      createReviewName: userCreateReview.name,
      createReviewImage: userCreateReview.images[0] || null,
      totalReviewCount,
      signedInReviewCount: ratingStats._count.id,
      averageRating: ratingStats._avg.ratings || 0
    });
  } catch (error) {
    console.error('Error fetching user review stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user review stats' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}