/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "Create_review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "Create_review_pkey" PRIMARY KEY ("id")
);
