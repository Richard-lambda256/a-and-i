/*
  Warnings:

  - You are about to drop the column `content` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `Conversation` table. All the data in the column will be lost.
  - Added the required column `aiResponse` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usedQuestion` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userQuestion` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation"
ADD COLUMN "userQuestion" TEXT,
ADD COLUMN "usedQuestion" TEXT,
ADD COLUMN "aiResponse" TEXT,
ADD COLUMN "postCoachingResult" JSONB,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records
UPDATE "Conversation"
SET
  "userQuestion" = CASE WHEN "role" = 'user' THEN "content" ELSE '' END,
  "usedQuestion" = CASE WHEN "role" = 'user' THEN "content" ELSE '' END,
  "aiResponse" = CASE WHEN "role" = 'assistant' THEN "content" ELSE '' END,
  "createdAt" = "timestamp",
  "updatedAt" = "timestamp";

-- Make columns required after data migration
ALTER TABLE "Conversation"
ALTER COLUMN "userQuestion" SET NOT NULL,
ALTER COLUMN "usedQuestion" SET NOT NULL,
ALTER COLUMN "aiResponse" SET NOT NULL;

-- Drop old columns
ALTER TABLE "Conversation"
DROP COLUMN "content",
DROP COLUMN "role",
DROP COLUMN "timestamp";
