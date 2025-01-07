/*
  Warnings:

  - You are about to drop the column `category` on the `Review_submission` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `Review_submission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review_submission" DROP COLUMN "category",
DROP COLUMN "productId";
