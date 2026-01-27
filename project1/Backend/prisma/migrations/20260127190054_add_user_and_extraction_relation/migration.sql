-- AlterTable
ALTER TABLE "AIExtraction" ADD COLUMN     "sessionId" TEXT;

-- CreateTable
CREATE TABLE "ExtractionSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentOrder" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtractionSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExtractionSession" ADD CONSTRAINT "ExtractionSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIExtraction" ADD CONSTRAINT "AIExtraction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExtractionSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
