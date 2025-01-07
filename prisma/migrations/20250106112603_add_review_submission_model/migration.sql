-- CreateTable
CREATE TABLE "Review_submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userImage" TEXT,
    "userName" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "category" "Category" NOT NULL,
    "productId" TEXT NOT NULL,
    "ratings" INTEGER NOT NULL,
    "review" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_submission_pkey" PRIMARY KEY ("id")
);
