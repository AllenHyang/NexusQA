import { Project, TestCase, Defect } from '../types';

export interface ProjectReportData {
  project: {
    name: string;
    description: string;
    startDate: string;
    dueDate: string;
    generatedAt: string;
  };
  summary: {
    totalTestCases: number;
    executedTestCases: number;
    passedTestCases: number;
    failedTestCases: number;
    blockedTestCases: number;
    skippedTestCases: number;
    untestedTestCases: number;
    passRate: number;
    executionRate: number;
  };
  defects: {
    total: number;
    bySeverity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    byStatus: {
      open: number;
      inProgress: number;
      resolved: number;
      closed: number;
    };
    defectDensity: number;
  };
  timeline: {
    daysTotal: number;
    daysElapsed: number;
    daysRemaining: number;
    progressPercent: number;
  };
  activity: {
    last7Days: Array<{
      date: string;
      executionsCount: number;
    }>;
  };
}

export function generateReportData(
  project: Project,
  testCases: TestCase[],
  defects: Defect[]
): ProjectReportData {
  // Test Case Statistics
  const passed = testCases.filter(tc => tc.status === 'PASSED').length;
  const failed = testCases.filter(tc => tc.status === 'FAILED').length;
  const blocked = testCases.filter(tc => tc.status === 'BLOCKED').length;
  const skipped = testCases.filter(tc => tc.status === 'SKIPPED').length;
  const untested = testCases.filter(tc => tc.status === 'UNTESTED' || tc.status === 'DRAFT').length;
  const executed = passed + failed + blocked + skipped;

  // Defect Statistics
  const defectsBySeverity = {
    critical: defects.filter(d => d.severity === 'CRITICAL').length,
    high: defects.filter(d => d.severity === 'HIGH').length,
    medium: defects.filter(d => d.severity === 'MEDIUM').length,
    low: defects.filter(d => d.severity === 'LOW').length,
  };

  const defectsByStatus = {
    open: defects.filter(d => d.status === 'OPEN').length,
    inProgress: defects.filter(d => d.status === 'IN_PROGRESS').length,
    resolved: defects.filter(d => d.status === 'RESOLVED').length,
    closed: defects.filter(d => d.status === 'CLOSED').length,
  };

  // Timeline
  const getValidDate = (dateStr?: string, fallback: Date = new Date()) => {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? fallback : d;
  };

  const start = getValidDate(project.startDate);
  const end = getValidDate(project.dueDate, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const today = new Date();
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = today.getTime() - start.getTime();
  const daysTotal = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil(elapsed / (1000 * 60 * 60 * 24));

  // 7-Day Activity
  const last7Days: Array<{ date: string; executionsCount: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = testCases.reduce((acc, tc) => {
      const executedOnDay = tc.history?.some(h => h.date.startsWith(dateStr));
      return acc + (executedOnDay ? 1 : 0);
    }, 0);
    last7Days.push({ date: dateStr, executionsCount: count });
  }

  return {
    project: {
      name: project.name,
      description: project.description || '',
      startDate: project.startDate || start.toISOString(),
      dueDate: project.dueDate || end.toISOString(),
      generatedAt: new Date().toISOString(),
    },
    summary: {
      totalTestCases: testCases.length,
      executedTestCases: executed,
      passedTestCases: passed,
      failedTestCases: failed,
      blockedTestCases: blocked,
      skippedTestCases: skipped,
      untestedTestCases: untested,
      passRate: executed > 0 ? Math.round((passed / executed) * 100) : 0,
      executionRate: testCases.length > 0 ? Math.round((executed / testCases.length) * 100) : 0,
    },
    defects: {
      total: defects.length,
      bySeverity: defectsBySeverity,
      byStatus: defectsByStatus,
      defectDensity: executed > 0 ? Math.round((failed / executed) * 100) : 0,
    },
    timeline: {
      daysTotal,
      daysElapsed: Math.max(0, daysElapsed),
      daysRemaining: Math.max(0, daysTotal - daysElapsed),
      progressPercent: Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100))),
    },
    activity: {
      last7Days,
    },
  };
}

export function exportReportAsJSON(data: ProjectReportData): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${data.project.name}_report.json`, 'application/json');
}

export function exportReportAsCSV(data: ProjectReportData): void {
  const rows: string[] = [];

  // Header Section
  rows.push('Project Test Report');
  rows.push(`Project Name,${escapeCSV(data.project.name)}`);
  rows.push(`Generated At,${data.project.generatedAt}`);
  rows.push(`Period,${data.project.startDate} to ${data.project.dueDate}`);
  rows.push('');

  // Summary Section
  rows.push('Test Execution Summary');
  rows.push('Metric,Value');
  rows.push(`Total Test Cases,${data.summary.totalTestCases}`);
  rows.push(`Executed,${data.summary.executedTestCases}`);
  rows.push(`Passed,${data.summary.passedTestCases}`);
  rows.push(`Failed,${data.summary.failedTestCases}`);
  rows.push(`Blocked,${data.summary.blockedTestCases}`);
  rows.push(`Skipped,${data.summary.skippedTestCases}`);
  rows.push(`Untested,${data.summary.untestedTestCases}`);
  rows.push(`Pass Rate,${data.summary.passRate}%`);
  rows.push(`Execution Rate,${data.summary.executionRate}%`);
  rows.push('');

  // Defects Section
  rows.push('Defect Summary');
  rows.push(`Total Defects,${data.defects.total}`);
  rows.push(`Defect Density,${data.defects.defectDensity}%`);
  rows.push('');
  rows.push('Defects by Severity');
  rows.push(`Critical,${data.defects.bySeverity.critical}`);
  rows.push(`High,${data.defects.bySeverity.high}`);
  rows.push(`Medium,${data.defects.bySeverity.medium}`);
  rows.push(`Low,${data.defects.bySeverity.low}`);
  rows.push('');
  rows.push('Defects by Status');
  rows.push(`Open,${data.defects.byStatus.open}`);
  rows.push(`In Progress,${data.defects.byStatus.inProgress}`);
  rows.push(`Resolved,${data.defects.byStatus.resolved}`);
  rows.push(`Closed,${data.defects.byStatus.closed}`);
  rows.push('');

  // Timeline Section
  rows.push('Timeline');
  rows.push(`Total Days,${data.timeline.daysTotal}`);
  rows.push(`Days Elapsed,${data.timeline.daysElapsed}`);
  rows.push(`Days Remaining,${data.timeline.daysRemaining}`);
  rows.push(`Progress,${data.timeline.progressPercent}%`);
  rows.push('');

  // Activity Section
  rows.push('7-Day Activity');
  rows.push('Date,Executions');
  data.activity.last7Days.forEach(day => {
    rows.push(`${day.date},${day.executionsCount}`);
  });

  const csv = rows.join('\n');
  downloadFile(csv, `${data.project.name}_report.csv`, 'text/csv');
}

export function exportReportAsHTML(data: ProjectReportData): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(data.project.name)} - Test Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; color: #333; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #18181b; }
    h2 { font-size: 18px; margin: 32px 0 16px; color: #3f3f46; border-bottom: 2px solid #e4e4e7; padding-bottom: 8px; }
    .meta { color: #71717a; font-size: 14px; margin-bottom: 32px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 20px; }
    .card-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; margin-bottom: 8px; }
    .card-value { font-size: 32px; font-weight: 700; color: #18181b; }
    .card-subtitle { font-size: 12px; color: #a1a1aa; }
    .passed { color: #16a34a; }
    .failed { color: #dc2626; }
    .blocked { color: #f59e0b; }
    .progress-bar { height: 12px; background: #e4e4e7; border-radius: 6px; overflow: hidden; margin: 12px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #fbbf24, #f59e0b); border-radius: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e4e4e7; }
    th { background: #fafafa; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; }
    .severity-critical { color: #dc2626; font-weight: 600; }
    .severity-high { color: #ea580c; font-weight: 600; }
    .severity-medium { color: #ca8a04; font-weight: 600; }
    .severity-low { color: #2563eb; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7; color: #71717a; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <h1>${escapeHTML(data.project.name)}</h1>
  <p class="meta">Test Report generated on ${new Date(data.project.generatedAt).toLocaleString()}</p>

  <h2>Test Execution Summary</h2>
  <div class="grid">
    <div class="card">
      <div class="card-title">Total Test Cases</div>
      <div class="card-value">${data.summary.totalTestCases}</div>
    </div>
    <div class="card">
      <div class="card-title">Execution Rate</div>
      <div class="card-value">${data.summary.executionRate}%</div>
      <div class="card-subtitle">${data.summary.executedTestCases} of ${data.summary.totalTestCases} executed</div>
    </div>
    <div class="card">
      <div class="card-title">Pass Rate</div>
      <div class="card-value passed">${data.summary.passRate}%</div>
      <div class="card-subtitle">${data.summary.passedTestCases} passed</div>
    </div>
    <div class="card">
      <div class="card-title">Failed</div>
      <div class="card-value failed">${data.summary.failedTestCases}</div>
    </div>
  </div>

  <table>
    <tr><th>Status</th><th>Count</th></tr>
    <tr><td class="passed">Passed</td><td>${data.summary.passedTestCases}</td></tr>
    <tr><td class="failed">Failed</td><td>${data.summary.failedTestCases}</td></tr>
    <tr><td class="blocked">Blocked</td><td>${data.summary.blockedTestCases}</td></tr>
    <tr><td>Skipped</td><td>${data.summary.skippedTestCases}</td></tr>
    <tr><td>Untested</td><td>${data.summary.untestedTestCases}</td></tr>
  </table>

  <h2>Defect Summary</h2>
  <div class="grid">
    <div class="card">
      <div class="card-title">Total Defects</div>
      <div class="card-value failed">${data.defects.total}</div>
    </div>
    <div class="card">
      <div class="card-title">Defect Density</div>
      <div class="card-value">${data.defects.defectDensity}%</div>
    </div>
    <div class="card">
      <div class="card-title">Open Defects</div>
      <div class="card-value">${data.defects.byStatus.open}</div>
    </div>
  </div>

  <table>
    <tr><th>Severity</th><th>Count</th></tr>
    <tr><td class="severity-critical">Critical</td><td>${data.defects.bySeverity.critical}</td></tr>
    <tr><td class="severity-high">High</td><td>${data.defects.bySeverity.high}</td></tr>
    <tr><td class="severity-medium">Medium</td><td>${data.defects.bySeverity.medium}</td></tr>
    <tr><td class="severity-low">Low</td><td>${data.defects.bySeverity.low}</td></tr>
  </table>

  <h2>Project Timeline</h2>
  <div class="card">
    <div class="card-title">Schedule Progress</div>
    <div class="progress-bar"><div class="progress-fill" style="width: ${data.timeline.progressPercent}%"></div></div>
    <p><strong>${data.timeline.daysRemaining}</strong> days remaining of ${data.timeline.daysTotal} total days (${data.timeline.progressPercent}% elapsed)</p>
  </div>

  <h2>7-Day Activity</h2>
  <table>
    <tr><th>Date</th><th>Executions</th></tr>
    ${data.activity.last7Days.map(day => `<tr><td>${day.date}</td><td>${day.executionsCount}</td></tr>`).join('')}
  </table>

  <div class="footer">
    Generated by NexusQA Test Management System
  </div>
</body>
</html>`;

  downloadFile(html, `${data.project.name}_report.html`, 'text/html');
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
