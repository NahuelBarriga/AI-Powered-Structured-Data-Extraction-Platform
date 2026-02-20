-- DropForeignKey
ALTER TABLE "ExtractionSession" DROP CONSTRAINT "ExtractionSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "UsageCost" DROP CONSTRAINT "UsageCost_userId_fkey";

-- DropForeignKey
ALTER TABLE "usageCounter" DROP CONSTRAINT "usageCounter_userId_fkey";

-- AlterTable
ALTER TABLE "ExtractionSession" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UsageCost" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "usageCounter" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ExtractionSession" ADD CONSTRAINT "ExtractionSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usageCounter" ADD CONSTRAINT "usageCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageCost" ADD CONSTRAINT "UsageCost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
