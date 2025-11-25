/*
  Warnings:

  - You are about to drop the column `executionRecordId` on the `Defect` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Defect` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Defect` table. All the data in the column will be lost.
  - You are about to drop the column `tracker` on the `Defect` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Defect` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Defect` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `Defect` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Defect` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "_DefectToExecutionRecord" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DefectToExecutionRecord_A_fkey" FOREIGN KEY ("A") REFERENCES "Defect" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DefectToExecutionRecord_B_fkey" FOREIGN KEY ("B") REFERENCES "ExecutionRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Defect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "projectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "externalIssueId" TEXT,
    "externalUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Defect_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Defect" ("createdAt", "id", "severity", "status", "updatedAt") SELECT "createdAt", "id", "severity", "status", "updatedAt" FROM "Defect";
DROP TABLE "Defect";
ALTER TABLE "new_Defect" RENAME TO "Defect";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_DefectToExecutionRecord_AB_unique" ON "_DefectToExecutionRecord"("A", "B");

-- CreateIndex
CREATE INDEX "_DefectToExecutionRecord_B_index" ON "_DefectToExecutionRecord"("B");
