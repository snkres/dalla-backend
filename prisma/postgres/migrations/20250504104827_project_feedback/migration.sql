-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "feedbackCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "approved" SET DEFAULT false;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "feedbackCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "skillRatings" JSONB,
ADD COLUMN     "totalRating" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CompanyToProfessionalFeedback" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "skillRatings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyToProfessionalFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalToCompanyFeedback" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalToCompanyFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyToProfessionalFeedback_projectId_idx" ON "CompanyToProfessionalFeedback"("projectId");

-- CreateIndex
CREATE INDEX "CompanyToProfessionalFeedback_companyId_idx" ON "CompanyToProfessionalFeedback"("companyId");

-- CreateIndex
CREATE INDEX "CompanyToProfessionalFeedback_userId_idx" ON "CompanyToProfessionalFeedback"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyToProfessionalFeedback_projectId_companyId_key" ON "CompanyToProfessionalFeedback"("projectId", "companyId");

-- CreateIndex
CREATE INDEX "ProfessionalToCompanyFeedback_projectId_idx" ON "ProfessionalToCompanyFeedback"("projectId");

-- CreateIndex
CREATE INDEX "ProfessionalToCompanyFeedback_companyId_idx" ON "ProfessionalToCompanyFeedback"("companyId");

-- CreateIndex
CREATE INDEX "ProfessionalToCompanyFeedback_userId_idx" ON "ProfessionalToCompanyFeedback"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalToCompanyFeedback_projectId_userId_key" ON "ProfessionalToCompanyFeedback"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "CompanyToProfessionalFeedback" ADD CONSTRAINT "CompanyToProfessionalFeedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyToProfessionalFeedback" ADD CONSTRAINT "CompanyToProfessionalFeedback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyToProfessionalFeedback" ADD CONSTRAINT "CompanyToProfessionalFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalToCompanyFeedback" ADD CONSTRAINT "ProfessionalToCompanyFeedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalToCompanyFeedback" ADD CONSTRAINT "ProfessionalToCompanyFeedback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalToCompanyFeedback" ADD CONSTRAINT "ProfessionalToCompanyFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
