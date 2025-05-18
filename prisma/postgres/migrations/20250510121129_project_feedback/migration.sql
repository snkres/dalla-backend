-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('USER', 'COMPANY');

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
CREATE TABLE "ProjectFeedback" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "receiverType" "UserType" NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectFeedback_projectId_idx" ON "ProjectFeedback"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectFeedback" ADD CONSTRAINT "ProjectFeedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
