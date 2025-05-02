-- CreateEnum
CREATE TYPE "ProposalType" AS ENUM ('AllInOne', 'MilestoneBased');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('Pending', 'Changes', 'Completed', 'Rejected');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('Pending', 'Approved', 'Rejected', 'ChangesRequested');

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "type" "ProposalType" NOT NULL DEFAULT 'AllInOne';

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timeline" TEXT NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilestoneSubmission" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "media" TEXT[],
    "status" "SubmissionStatus" NOT NULL DEFAULT 'Pending',
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MilestoneSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Milestone_proposalId_idx" ON "Milestone"("proposalId");

-- CreateIndex
CREATE INDEX "MilestoneSubmission_milestoneId_idx" ON "MilestoneSubmission"("milestoneId");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestoneSubmission" ADD CONSTRAINT "MilestoneSubmission_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
