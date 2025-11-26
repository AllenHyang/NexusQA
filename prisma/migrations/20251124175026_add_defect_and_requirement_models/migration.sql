-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "tracker" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "Defect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL,
    "tracker" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "summary" TEXT,
    "executionRecordId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Defect_executionRecordId_fkey" FOREIGN KEY ("executionRecordId") REFERENCES "ExecutionRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_RequirementToTestCase" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RequirementToTestCase_A_fkey" FOREIGN KEY ("A") REFERENCES "Requirement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RequirementToTestCase_B_fkey" FOREIGN KEY ("B") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_RequirementToTestCase_AB_unique" ON "_RequirementToTestCase"("A", "B");

-- CreateIndex
CREATE INDEX "_RequirementToTestCase_B_index" ON "_RequirementToTestCase"("B");
