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

    // Fetch reviews for the specific user
    const reviews = await prisma.review_submission.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        userId: true,
        userImage: true,
        userName: true,
        isAnonymous: true,
        ratings: true,
        review: true,
        summary: true,
        images: true,
        createdAt: true
      }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}