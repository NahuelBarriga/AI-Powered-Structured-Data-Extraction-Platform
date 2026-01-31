-- AlterTable
ALTER TABLE "AIExtraction" ADD COLUMN     "confidenceScore" INTEGER,
ADD COLUMN     "uncertaintyData" JSONB;
