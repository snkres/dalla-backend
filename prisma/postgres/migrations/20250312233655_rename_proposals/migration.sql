/*
  Warnings:

  - You are about to drop the `ProfessionalRequests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('Pending', 'Accepted', 'Rejected');

-- DropForeignKey
ALTER TABLE "ProfessionalRequests" DROP CONSTRAINT "ProfessionalRequests_professionalId_fkey";

-- DropForeignKey
ALTER TABLE "ProfessionalRequests" DROP CONSTRAINT "ProfessionalRequests_projectId_fkey";

-- DropTable
DROP TABLE "ProfessionalRequests";

-- DropEnum
DROP TYPE "RequestStatus";

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timeline" TEXT NOT NULL,
    "media" TEXT[],
    "status" "ProposalStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProposalToUserProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProposalToUserProject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_projectId_professionalId_key" ON "Proposal"("projectId", "professionalId");

-- CreateIndex
CREATE INDEX "_ProposalToUserProject_B_index" ON "_ProposalToUserProject"("B");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProposalToUserProject" ADD CONSTRAINT "_ProposalToUserProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProposalToUserProject" ADD CONSTRAINT "_ProposalToUserProject_B_fkey" FOREIGN KEY ("B") REFERENCES "UserProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
