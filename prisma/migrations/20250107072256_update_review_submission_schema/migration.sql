/*
  Warnings:

  - The primary key for the `Review_submission` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Review_submission" DROP CONSTRAINT "Review_submission_pkey",
ADD COLUMN     "dummyId" SERIAL NOT NULL,
ADD CONSTRAINT "Review_submission_pkey" PRIMARY KEY ("dummyId");
