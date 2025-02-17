import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const dummyIdParam = url.searchParams.get('dummyId');

    if (!dummyIdParam) {
      return NextResponse.json({ 
        error: 'Dummy ID is required' 
      }, { status: 400 });
    }

    // Convert dummyId to integer
    const dummyId = parseInt(dummyIdParam, 10);

    if (isNaN(dummyId)) {
      return NextResponse.json({ 
        error: 'Invalid Dummy ID' 
      }, { status: 400 });
    }

    const userReview = await prisma.review_submission.findUnique({
      where: { dummyId },
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

    if (!userReview) {
      return NextResponse.json({ 
        error: 'Review not found' 
      }, { status: 404 });
    }

    return NextResponse.json(userReview);
  } catch (error) {
    console.error('Error fetching user review:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch review' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}