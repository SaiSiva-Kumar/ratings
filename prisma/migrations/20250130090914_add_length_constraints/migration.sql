/*
  Warnings:

  - You are about to alter the column `name` on the `Create_review` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `summary` on the `Review_submission` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE "Create_review" ALTER COLUMN "name" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "Review_submission" ALTER COLUMN "summary" SET DATA TYPE VARCHAR(20);
