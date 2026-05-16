/*
  Warnings:

  - The `certifications` column on the `Resume` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "nutritionId" UUID;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "patientId" UUID;

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "certifications",
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "needsSetup" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_nutritionId_fkey" FOREIGN KEY ("nutritionId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
