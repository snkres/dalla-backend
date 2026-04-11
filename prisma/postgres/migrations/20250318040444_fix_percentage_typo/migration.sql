/*
  Warnings:

  - You are about to drop the column `precentage` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "precentage",
ADD COLUMN     "percentage" DOUBLE PRECISION DEFAULT 20;

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");
