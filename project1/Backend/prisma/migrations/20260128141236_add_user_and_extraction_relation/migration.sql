/*
  Warnings:

  - You are about to drop the column `confidence` on the `AIExtraction` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `AIExtraction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId,version]` on the table `AIExtraction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokens` to the `AIExtraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AIExtraction" DROP COLUMN "confidence",
DROP COLUMN "provider",
ADD COLUMN     "tokens" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AIExtraction_sessionId_version_key" ON "AIExtraction"("sessionId", "version");
