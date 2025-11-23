/*
  Warnings:

  - You are about to drop the column `history` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `steps` on the `TestCase` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TestStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "expected" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "testCaseId" TEXT NOT NULL,
    CONSTRAINT "TestStep_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExecutionRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "executedBy" TEXT NOT NULL,
    "notes" TEXT,
    "bugId" TEXT,
    "env" TEXT,
    "evidence" TEXT,
    "testCaseId" TEXT NOT NULL,
    CONSTRAINT "ExecutionRecord_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TestCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "preconditions" TEXT,
    "userStory" TEXT,
    "requirementId" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'UNTESTED',
    "priority" TEXT NOT NULL DEFAULT 'P2',
    "visualReference" TEXT,
    "authorId" TEXT,
    "assignedToId" TEXT,
    "projectId" TEXT NOT NULL,
    "suiteId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TestCase_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestCase_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TestCase" ("createdAt", "description", "id", "priority", "projectId", "status", "suiteId", "title", "updatedAt", "visualReference") SELECT "createdAt", "description", "id", "priority", "projectId", "status", "suiteId", "title", "updatedAt", "visualReference" FROM "TestCase";
DROP TABLE "TestCase";
ALTER TABLE "new_TestCase" RENAME TO "TestCase";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
