import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Comprehensive validation with detailed logging
    const id = formData.get('id')?.toString();
    const userId = formData.get('userId')?.toString();
    const userName = formData.get('userName')?.toString();
    const userImage = formData.get('userImage')?.toString();
    const isAnonymousStr = formData.get('isAnonymous')?.toString();
    const ratingsStr = formData.get('ratings')?.toString();
    const review = formData.get('review')?.toString();
    const summary = formData.get('summary')?.toString();
    const images = formData.getAll('images') as string[];

    // Validate required fields
    const validationErrors: string[] = [];
    if (!id) validationErrors.push('ID is required');
    if (!userId) validationErrors.push('User ID is required');
    if (!ratingsStr) validationErrors.push('Ratings are required');
    if (!review) validationErrors.push('Review text is required');
    if (!summary) validationErrors.push('Review summary is required');

    if (validationErrors.length > 0) {
      console.error('Validation Errors:', validationErrors);
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors
      }, { status: 400 });
    }

    // Safely parse ratings
    const ratings = parseInt(ratingsStr!, 10);
    if (isNaN(ratings)) {
      return NextResponse.json({
        error: 'Invalid ratings value'
      }, { status: 400 });
    }

    // Determine anonymous status
    const isAnonymous = isAnonymousStr === 'true';

    // Handle user details for anonymous vs signed reviews
    const finalUserName = isAnonymous ? 'Anonymous User' : (userName || 'User');
    const finalUserImage = isAnonymous ? '/anonymous-avatar.png' : (userImage || '/default-avatar.png');

    // No need for image upload processing, just use the provided URLs
    const imageUrls = images.filter(url => url && typeof url === 'string');

    const finalId = id as string;
    const finalUserId = userId as string;
    const finalReview = review as string;
    const finalSummary = summary as string;

    const reviewSubmission = await prisma.review_submission.create({
      data: {
        id: finalId,
        userId: finalUserId,
        userName: finalUserName,
        userImage: finalUserImage,
        isAnonymous,
        ratings,
        review: finalReview,
        summary: finalSummary,
        images: imageUrls,
        createdAt: new Date()
      }
    });

    console.log("uploaded completed");

    return NextResponse.json({ 
      message: 'Review submitted successfully',
      reviewSubmission 
    }, { status: 201 });
  
  } catch (error) {
    // Comprehensive error logging
    console.error('Full error details:', {
      errorName: error instanceof Error ? error.name : 'Unknown Error',
      errorMessage: error instanceof Error ? error.message : 'No error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });

    // Ensure we always return a valid JSON response
    return NextResponse.json({
      error: 'Failed to submit review',
      details: error instanceof Error 
        ? {
            message: error.message,
            name: error.name
          }
        : 'An unexpected error occurred'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}