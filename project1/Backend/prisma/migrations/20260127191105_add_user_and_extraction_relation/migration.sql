/*
  Warnings:

  - You are about to drop the column `sessionId` on the `AIExtraction` table. All the data in the column will be lost.
  - You are about to drop the `ExtractionSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIExtraction" DROP CONSTRAINT "AIExtraction_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "ExtractionSession" DROP CONSTRAINT "ExtractionSession_userId_fkey";

-- AlterTable
ALTER TABLE "AIExtraction" DROP COLUMN "sessionId";

-- DropTable
DROP TABLE "ExtractionSession";
