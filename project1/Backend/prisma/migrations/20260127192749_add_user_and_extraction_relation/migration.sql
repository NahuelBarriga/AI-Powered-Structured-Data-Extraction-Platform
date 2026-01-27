/*
  Warnings:

  - Added the required column `sessionId` to the `AIExtraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `AIExtraction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AIExtraction" DROP CONSTRAINT "AIExtraction_userId_fkey";

-- AlterTable
ALTER TABLE "AIExtraction" ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ExtractionSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastExtractionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractionSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExtractionSession" ADD CONSTRAINT "ExtractionSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIExtraction" ADD CONSTRAINT "AIExtraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExtractionSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIExtraction" ADD CONSTRAINT "AIExtraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
