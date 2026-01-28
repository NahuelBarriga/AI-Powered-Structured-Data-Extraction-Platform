/*
  Warnings:

  - You are about to drop the column `tokens` on the `AIExtraction` table. All the data in the column will be lost.
  - Added the required column `tokenOut` to the `AIExtraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokensIn` to the `AIExtraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIExtraction" DROP COLUMN "tokens",
ADD COLUMN     "tokenOut" INTEGER NOT NULL,
ADD COLUMN     "tokensIn" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "usageCounter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "window" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "usageCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageCost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tokensIn" INTEGER NOT NULL,
    "tokensOut" INTEGER NOT NULL,

    CONSTRAINT "UsageCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usageCounter_userId_window_key" ON "usageCounter"("userId", "window");

-- CreateIndex
CREATE INDEX "UsageCost_userId_date_idx" ON "UsageCost"("userId", "date");

-- AddForeignKey
ALTER TABLE "usageCounter" ADD CONSTRAINT "usageCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageCost" ADD CONSTRAINT "UsageCost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
