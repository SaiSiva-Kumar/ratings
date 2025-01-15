import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // Fetch all reviews (both signed-in and anonymous) for the specific review
    const reviews = await prisma.review_submission.findMany({
      where: { 
        id,
      },
      orderBy: { 
        createdAt: 'desc' // Most recent first
      },
      select: {
        id: true,
        userId: true,
        userImage: true,
        userName: true,
        ratings: true,
        review: true,
        summary: true,
        images: true,
        createdAt: true
      }
    });

    // Count only signed-in reviews (non-anonymous)
    const signedInReviewCount = await prisma.review_submission.count({
      where: { 
        id,
        isAnonymous: false 
      }
    });

    // Calculate average ratings for signed-in reviews
    const ratingStats = await prisma.review_submission.aggregate({
      where: { 
        id,
        isAnonymous: false 
      },
      _avg: {
        ratings: true
      }
    });

    return NextResponse.json({
      reviews,
      signedInReviewCount,
      averageRating: ratingStats._avg.ratings || 0
    });
  } catch (error) {
    console.error('Error fetching review list:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch review list' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
