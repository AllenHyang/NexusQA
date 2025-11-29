-- CreateTable
CREATE TABLE "RequirementReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "comment" TEXT,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RequirementReview_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "InternalRequirement" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RequirementReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequirementFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'FOLDER',
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RequirementFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "RequirementFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RequirementFolder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InternalRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "folderId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userStories" TEXT NOT NULL DEFAULT '[]',
    "targetUsers" TEXT NOT NULL DEFAULT '[]',
    "preconditions" TEXT,
    "businessRules" TEXT NOT NULL DEFAULT '[]',
    "designReferences" TEXT NOT NULL DEFAULT '[]',
    "targetVersion" TEXT,
    "estimatedEffort" TEXT,
    "ownerId" TEXT,
    "relatedRequirements" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "acceptanceStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'P2',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "acceptanceCriteria" TEXT NOT NULL DEFAULT '[]',
    "acceptedBy" TEXT,
    "acceptedAt" DATETIME,
    "acceptanceNotes" TEXT,
    "reviewerId" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "projectId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InternalRequirement_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "RequirementFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InternalRequirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InternalRequirement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InternalRequirement" ("acceptanceCriteria", "acceptanceNotes", "acceptanceStatus", "acceptedAt", "acceptedBy", "authorId", "createdAt", "description", "id", "priority", "projectId", "status", "tags", "title", "updatedAt") SELECT "acceptanceCriteria", "acceptanceNotes", "acceptanceStatus", "acceptedAt", "acceptedBy", "authorId", "createdAt", "description", "id", "priority", "projectId", "status", "tags", "title", "updatedAt" FROM "InternalRequirement";
DROP TABLE "InternalRequirement";
ALTER TABLE "new_InternalRequirement" RENAME TO "InternalRequirement";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
