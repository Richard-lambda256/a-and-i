-- CreateEnum
CREATE TYPE "ConversationState" AS ENUM ('new', 'preCoached', 'asked');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "state" "ConversationState" NOT NULL DEFAULT 'new';
