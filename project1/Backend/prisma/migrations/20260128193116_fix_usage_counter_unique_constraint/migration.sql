/*
  Warnings:

  - A unique constraint covering the columns `[userId,window,type]` on the table `usageCounter` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "usageCounter_userId_window_key";

-- CreateIndex
CREATE UNIQUE INDEX "usageCounter_userId_window_type_key" ON "usageCounter"("userId", "window", "type");
