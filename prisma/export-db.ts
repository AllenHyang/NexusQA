/**
 * Database Export Script
 * 将当前数据库导出为 TypeScript 格式的 seed-data
 *
 * 用法: npx tsx prisma/export-db.ts [--table=users,projects] [--output=./exported]
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Helper: 格式化为 TypeScript 对象字符串
function toTsObject(obj: unknown, indent = 2): string {
  return JSON.stringify(obj, null, indent)
    .replace(/"([^"]+)":/g, '$1:') // 移除 key 的引号
    .replace(/null/g, 'null');
}

// Helper: 生成 TypeScript 文件内容
function generateTsFile(varName: string, data: unknown[], typeHint?: string): string {
  const typeComment = typeHint ? `// Type: ${typeHint}\n` : '';
  const items = data.map(item => toTsObject(item, 2)).join(',\n  ');
  return `${typeComment}export const ${varName} = [\n  ${items}\n];\n`;
}

// 导出配置
interface ExportConfig {
  name: string;
  varName: string;
  fetch: () => Promise<unknown[]>;
  transform?: (item: unknown) => unknown;
}

const EXPORT_CONFIGS: ExportConfig[] = [
  {
    name: 'users',
    varName: 'USERS',
    fetch: async () => prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      }
    }),
  },
  {
    name: 'projects',
    varName: 'PROJECTS',
    fetch: async () => prisma.project.findMany({
      select: {
        name: true,
        description: true,
        repositoryUrl: true,
      }
    }),
  },
  {
    name: 'test-suites',
    varName: 'TEST_SUITES',
    fetch: async () => prisma.testSuite.findMany({
      select: {
        id: true,
        name: true,
        projectId: true,
        parentId: true,
      }
    }),
  },
  {
    name: 'test-cases',
    varName: 'TEST_CASES',
    fetch: async () => prisma.testCase.findMany({
      include: {
        steps: {
          orderBy: { order: 'asc' }
        },
        project: { select: { name: true } },
        suite: { select: { name: true } },
      }
    }),
    transform: (tc) => {
      const item = tc as {
        id: string;
        title: string;
        description: string | null;
        preconditions: string | null;
        priority: string;
        status: string;
        tags: string;
        project: { name: string };
        suite: { name: string } | null;
        steps: { action: string; expected: string; order: number }[];
      };
      return {
        title: item.title,
        description: item.description,
        preconditions: item.preconditions,
        priority: item.priority,
        status: item.status,
        tags: JSON.parse(item.tags || '[]'),
        projectName: item.project.name,
        suiteName: item.suite?.name || null,
        steps: item.steps.map(s => ({
          action: s.action,
          expected: s.expected,
          order: s.order,
        })),
      };
    },
  },
  {
    name: 'requirement-folders',
    varName: 'REQUIREMENT_FOLDERS',
    fetch: async () => prisma.requirementFolder.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    }),
    transform: (folder) => {
      const f = folder as {
        name: string;
        type: string;
        description: string | null;
        order: number;
        children: {
          name: string;
          type: string;
          description: string | null;
          order: number;
          children: unknown[];
        }[];
      };
      return {
        name: f.name,
        type: f.type,
        description: f.description,
        order: f.order,
        children: f.children.map(child => ({
          name: child.name,
          type: child.type,
          description: child.description,
          order: child.order,
        })),
      };
    },
  },
  {
    name: 'requirements',
    varName: 'REQUIREMENTS',
    fetch: async () => prisma.internalRequirement.findMany({
      include: {
        project: { select: { name: true } },
        folder: { select: { name: true } },
      },
      orderBy: { order: 'asc' },
    }),
    transform: (req) => {
      const r = req as {
        title: string;
        description: string | null;
        priority: string;
        status: string;
        acceptanceStatus: string;
        tags: string;
        acceptanceCriteria: string;
        userStories: string;
        targetUsers: string;
        preconditions: string | null;
        businessRules: string;
        designReferences: string;
        targetVersion: string | null;
        estimatedEffort: string | null;
        project: { name: string };
        folder: { name: string } | null;
      };
      return {
        title: r.title,
        description: r.description,
        priority: r.priority,
        status: r.status,
        acceptanceStatus: r.acceptanceStatus,
        tags: JSON.parse(r.tags || '[]'),
        acceptanceCriteria: JSON.parse(r.acceptanceCriteria || '[]'),
        userStories: JSON.parse(r.userStories || '[]'),
        targetUsers: JSON.parse(r.targetUsers || '[]'),
        preconditions: r.preconditions,
        businessRules: JSON.parse(r.businessRules || '[]'),
        designReferences: JSON.parse(r.designReferences || '[]'),
        targetVersion: r.targetVersion,
        estimatedEffort: r.estimatedEffort,
        projectName: r.project.name,
        folderName: r.folder?.name || null,
      };
    },
  },
  {
    name: 'defects',
    varName: 'DEFECTS',
    fetch: async () => prisma.defect.findMany({
      include: {
        project: { select: { name: true } },
        author: { select: { name: true } },
        assignee: { select: { name: true } },
      }
    }),
    transform: (def) => {
      const d = def as {
        title: string;
        description: string | null;
        status: string;
        severity: string;
        project: { name: string };
        author: { name: string };
        assignee: { name: string } | null;
      };
      return {
        title: d.title,
        description: d.description,
        status: d.status,
        severity: d.severity,
        projectName: d.project.name,
        authorName: d.author.name,
        assigneeName: d.assignee?.name || null,
      };
    },
  },
];

async function exportTable(config: ExportConfig, outputDir: string): Promise<void> {
  console.log(`📦 Exporting ${config.name}...`);

  const data = await config.fetch();
  const transformed = config.transform
    ? data.map(config.transform)
    : data;

  const content = generateTsFile(config.varName, transformed);
  const filePath = path.join(outputDir, `${config.name}.ts`);

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`   ✅ Exported ${transformed.length} records to ${filePath}`);
}

async function main() {
  const args = process.argv.slice(2);

  // 解析参数
  let tables: string[] | null = null;
  let outputDir = './prisma/exported';

  for (const arg of args) {
    if (arg.startsWith('--table=')) {
      tables = arg.replace('--table=', '').split(',');
    } else if (arg.startsWith('--output=')) {
      outputDir = arg.replace('--output=', '');
    }
  }

  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('\n🚀 Database Export Tool\n');
  console.log(`   Output: ${outputDir}`);
  console.log(`   Tables: ${tables ? tables.join(', ') : 'all'}\n`);

  // 导出指定或全部表
  const configs = tables
    ? EXPORT_CONFIGS.filter(c => tables!.includes(c.name))
    : EXPORT_CONFIGS;

  for (const config of configs) {
    await exportTable(config, outputDir);
  }

  // 生成 index.ts
  const indexContent = configs
    .map(c => `export { ${c.varName} } from './${c.name}';`)
    .join('\n') + '\n';

  fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent, 'utf-8');
  console.log(`\n📝 Generated index.ts`);

  console.log('\n✨ Export complete!\n');
  console.log('To use exported data:');
  console.log('  1. Review the files in', outputDir);
  console.log('  2. Copy/merge needed data to prisma/seed-data/');
  console.log('  3. Update prisma/seed-data/index.ts if needed\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
