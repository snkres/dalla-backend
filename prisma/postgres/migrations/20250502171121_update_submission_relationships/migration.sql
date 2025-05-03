/*
  Warnings:

  - You are about to drop the column `proposalId` on the `ProjectSubmission` table. All the data in the column will be lost.
  - Added the required column `projectId` to the `ProjectSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectSubmission" DROP CONSTRAINT "ProjectSubmission_proposalId_fkey";

-- DropIndex
DROP INDEX "MilestoneSubmission_milestoneId_key";

-- DropIndex
DROP INDEX "ProjectSubmission_proposalId_idx";

-- DropIndex
DROP INDEX "ProjectSubmission_proposalId_key";

-- AlterTable
ALTER TABLE "ProjectSubmission" DROP COLUMN "proposalId",
ADD COLUMN     "projectId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ProjectSubmission_projectId_idx" ON "ProjectSubmission"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectSubmission" ADD CONSTRAINT "ProjectSubmission_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
