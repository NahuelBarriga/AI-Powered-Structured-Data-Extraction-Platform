/*
  Warnings:

  - A unique constraint covering the columns `[sessionId,version,attempts]` on the table `AIExtraction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AIExtraction_sessionId_version_key";

-- CreateIndex
CREATE UNIQUE INDEX "AIExtraction_sessionId_version_attempts_key" ON "AIExtraction"("sessionId", "version", "attempts");
