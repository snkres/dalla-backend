/*
  Warnings:

  - A unique constraint covering the columns `[projectId,professionalId]` on the table `ProfessionalRequests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "status" SET DEFAULT 'Open';

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalRequests_projectId_professionalId_key" ON "ProfessionalRequests"("projectId", "professionalId");
