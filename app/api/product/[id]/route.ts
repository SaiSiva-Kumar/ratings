import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('Review ID:', id);

    if (!id) {
      return NextResponse.json({ 
        error: 'Review ID is required' 
      }, { status: 400 });
    }

    // Query the review with specific fields
    const review = await prisma.create_review.findUnique({
      where: { id },
      select: {
        category: true,
        name: true,
        Description: true,
        images: true,
        url: true
      }
    });

    if (!review) {
      return NextResponse.json({ 
        error: 'Review not found' 
      }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({
      error: 'Failed to fetch review'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
