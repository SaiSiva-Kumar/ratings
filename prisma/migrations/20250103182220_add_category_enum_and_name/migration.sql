/*
  Warnings:

  - Added the required column `name` to the `Create_review` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `Create_review` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('product', 'service');

-- AlterTable
ALTER TABLE "Create_review" ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL;
