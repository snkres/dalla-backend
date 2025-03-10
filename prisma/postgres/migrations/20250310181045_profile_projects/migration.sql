-- CreateTable
CREATE TABLE "UserProject" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "linkInPlatform" TEXT,
    "thumbnail" TEXT,
    "link" TEXT,
    "media" TEXT[],

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
