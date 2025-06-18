-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "savedToGlobal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "savedToProject" BOOLEAN NOT NULL DEFAULT false;
