/*
  Warnings:

  - A unique constraint covering the columns `[milestoneId]` on the table `MilestoneSubmission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MilestoneSubmission_milestoneId_key" ON "MilestoneSubmission"("milestoneId");
