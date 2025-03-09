/*
  Warnings:

  - The `areas` column on the `CompanyProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `goals` column on the `CompanyProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `targetIndustries` column on the `CompanyProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CompanyProfile" DROP COLUMN "areas",
ADD COLUMN     "areas" JSONB[],
DROP COLUMN "goals",
ADD COLUMN     "goals" JSONB[],
DROP COLUMN "targetIndustries",
ADD COLUMN     "targetIndustries" JSONB[];
