/*
  Warnings:

  - You are about to drop the column `aiResponse` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `postCoachingResult` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `preCoachingResult` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `userQuestion` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the `Memory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[key]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apiKeyId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chatroom" DROP CONSTRAINT "Chatroom_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "Memory" DROP CONSTRAINT "Memory_projectId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "aiResponse",
DROP COLUMN "createdAt",
DROP COLUMN "postCoachingResult",
DROP COLUMN "preCoachingResult",
DROP COLUMN "state",
DROP COLUMN "updatedAt",
DROP COLUMN "userQuestion",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "apiKeyId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Memory";

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatroom" ADD CONSTRAINT "Chatroom_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
