import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    console.log(id);

    if (!id) {
      return NextResponse.json({ 
        error: 'Review ID is required' 
      }, { status: 400 });
    }

    const review = await prisma.create_review.findUnique({
      where: { id },
      select: {
        category: true,
        name: true,
        Description: true,
        images: true,
        url: true,
        userId: true
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const reviewId = createId();
    
    if (!data || !data.userId || !data.category || !data.name) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, category, or name' 
      }, { status: 400 });
    }

    if (!['product', 'service'].includes(data.category)) {
      return NextResponse.json({ 
        error: 'Category must be either "product" or "service"' 
      }, { status: 400 });
    }

    const review = await prisma.create_review.create({
      data: {
        id: reviewId,
        userId: data.userId,
        category: data.category,
        name: data.name,
        Description: data.description,
        url: data.url || null,
        images: data.images || [],
      }
    });

    const reviewUrl = `viewReview?id=${review.id}`;
    console.log("uploaded completed");

    return NextResponse.json({ reviewUrl }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({
      error: 'Failed to create review'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}