/*
  Warnings:

  - You are about to drop the column `date` on the `UsageCost` table. All the data in the column will be lost.
  - Added the required column `model` to the `UsageCost` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UsageCost_userId_date_idx";

-- AlterTable
ALTER TABLE "UsageCost" DROP COLUMN "date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "extractionId" TEXT,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "sessionId" TEXT;
