-- AlterEnum
ALTER TYPE "OfferType" ADD VALUE 'PACKAGE';

-- AlterEnum
ALTER TYPE "SessionStatus" ADD VALUE 'PENDING_SCHEDULE';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "chatDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "includesChat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "includesPlan" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "sessionsCount" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sessionNumber" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "sessionDate" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Session_status_idx" ON "Session"("status");

-- CreateIndex
CREATE INDEX "Session_reminderSent_idx" ON "Session"("reminderSent");
