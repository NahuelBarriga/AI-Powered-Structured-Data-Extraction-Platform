-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('success', 'failed');

-- CreateTable
CREATE TABLE "AIExtraction" (
    "id" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "extractedData" JSONB NOT NULL,
    "confidence" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL,
    "status" "ExtractionStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIExtraction_pkey" PRIMARY KEY ("id")
);
