-- AlterEnum
ALTER TYPE "OfferType" ADD VALUE 'PACKAGE';

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "sessionsCount" INTEGER NOT NULL DEFAULT 0;
