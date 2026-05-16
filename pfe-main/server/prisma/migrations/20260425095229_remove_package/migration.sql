/*
  Warnings:

  - The values [PACKAGE] on the enum `OfferType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OfferType_new" AS ENUM ('AI_CALORIES', 'PLAN', 'CONSULTATION');
ALTER TABLE "public"."Resume" ALTER COLUMN "offersTypes" DROP DEFAULT;
ALTER TABLE "Resume" ALTER COLUMN "offersTypes" TYPE "OfferType_new"[] USING ("offersTypes"::text::"OfferType_new"[]);
ALTER TABLE "Offer" ALTER COLUMN "type" TYPE "OfferType_new" USING ("type"::text::"OfferType_new");
ALTER TYPE "OfferType" RENAME TO "OfferType_old";
ALTER TYPE "OfferType_new" RENAME TO "OfferType";
DROP TYPE "public"."OfferType_old";
ALTER TABLE "Resume" ALTER COLUMN "offersTypes" SET DEFAULT ARRAY[]::"OfferType"[];
COMMIT;
