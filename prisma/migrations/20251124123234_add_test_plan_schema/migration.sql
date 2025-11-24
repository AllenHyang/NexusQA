-- CreateTable
CREATE TABLE "TestPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'UNTESTED',
    "executedBy" TEXT,
    "notes" TEXT,
    "executedAt" DATETIME,
    "testPlanId" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestRun_testPlanId_fkey" FOREIGN KEY ("testPlanId") REFERENCES "TestPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestRun_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TestRun_testPlanId_testCaseId_key" ON "TestRun"("testPlanId", "testCaseId");
