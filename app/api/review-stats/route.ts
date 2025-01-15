import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    console.log('API route hit');
    const searchParams = new URL(request.url).searchParams;
    const userId = searchParams.get('userId');
    console.log('UserId received:', userId);

    if (!userId) {
      console.log('No userId provided');
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
      // First get all review pages created by the user
      console.log('Fetching review pages for userId:', userId);
      const userCreatedReviewPages = await prisma.create_review.findMany({
        where: { userId }
      });
      console.log('Found review pages:', userCreatedReviewPages);

      // For each review page, get its statistics
      console.log('Calculating stats for each review page');
      const reviewStats = await Promise.all(
        userCreatedReviewPages.map(async (reviewPage) => {
          try {
            const submissions = await prisma.review_submission.findMany({
              where: {
                id: reviewPage.id
              }
            });
            console.log(`Found ${submissions.length} submissions for review page ${reviewPage.id}`);

            const totalReviews = submissions.length;
            const signedInReviews = submissions.filter(r => !r.isAnonymous).length;
            const averageSignedInReviews = signedInReviews > 0 
              ? submissions.filter(r => !r.isAnonymous).reduce((acc, r) => acc + r.ratings, 0) / signedInReviews 
              : 0;

            return {
              reviewPageId: reviewPage.id,
              reviewPageName: reviewPage.name,
              images: reviewPage.images,
              totalReviews,
              signedInReviews,
              averageSignedInReviews,
            };
          } catch (error) {
            console.log(reviewPage.id);
            console.error('Error processing review page:', reviewPage.id, error);
            throw error;
          }
        })
      );

      // Get reviews written by the user
      console.log('Fetching written reviews for userId:', userId);
      const userWrittenReviews = await prisma.review_submission.findMany({
        where: { 
          userId 
        },
        select: {
          ratings: true,
          review: true,
          images: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      console.log('Found written reviews:', userWrittenReviews.length);

      const response = {
        createdPages: reviewStats,
        writtenReviews: userWrittenReviews
      };
      console.log('Sending response:', response);
      return NextResponse.json(response);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}