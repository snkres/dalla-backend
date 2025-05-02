-- CreateTable
CREATE TABLE "ProjectSubmission" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "media" TEXT[],
    "status" "SubmissionStatus" NOT NULL DEFAULT 'Pending',
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSubmission_proposalId_key" ON "ProjectSubmission"("proposalId");

-- CreateIndex
CREATE INDEX "ProjectSubmission_proposalId_idx" ON "ProjectSubmission"("proposalId");

-- AddForeignKey
ALTER TABLE "ProjectSubmission" ADD CONSTRAINT "ProjectSubmission_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
