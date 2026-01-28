/*
  Warnings:

  - Added the required column `type` to the `usageCounter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usageCounter" ADD COLUMN     "type" TEXT NOT NULL;
