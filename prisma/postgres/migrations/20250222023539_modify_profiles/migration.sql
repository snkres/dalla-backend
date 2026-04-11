/*
  Warnings:

  - You are about to drop the column `industry` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `UserExperience` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "industry",
DROP COLUMN "size";

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "meta" JSONB;

-- AlterTable
ALTER TABLE "UserExperience" DROP COLUMN "description",
ADD COLUMN     "meta" JSONB;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "meta" JSONB;
