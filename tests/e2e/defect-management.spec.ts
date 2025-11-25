import { test, expect, Page } from '@playwright/test';

// --- BDD Helpers ---

async function givenUserIsLoggedIn(page: Page) {
    const loginHeader = page.getByText('Select Account');
    const dashboardOverviewHeader = page.getByText('Overview'); // Correctly identify the Dashboard header
    
    if (await page.locator('aside').isVisible()) return; 
    if (await dashboardOverviewHeader.isVisible()) return; // If already on the Dashboard view

    if (await loginHeader.isVisible()) {
        await page.locator('button', { hasText: 'Sarah Jenkins' }).click();
        await dashboardOverviewHeader.waitFor({ state: 'visible', timeout: 30000 });
        await expect(dashboardOverviewHeader).toBeVisible({ timeout: 10000 }); 
    }
}

async function givenUserIsOnProjectsPage(page: Page) {
    await givenUserIsLoggedIn(page);
    const projectsHeader = page.getByText('All Projects');
    if (await projectsHeader.isVisible()) return;
    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    await expect(projectsHeader).toBeVisible();
}

test.describe('Defect Management', () => {
  let createdProjectName: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdProjectName) {
      const listRes = await request.get('/api/projects');
      if (listRes.ok()) {
        const projects = await listRes.json();
        const projectsToDelete = projects.filter((p: { name: string; id: string }) => p.name.startsWith(createdProjectName as string));
        for (const p of projectsToDelete) {
           await request.delete(`/api/projects?id=${p.id}`);
        }
      }
      createdProjectName = null;
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsOnProjectsPage(page);
  });

  test('should save execution with rich defect data and display it in history', async ({ page }) => {
    test.setTimeout(60000);
    const timestamp = Date.now();
    const projectName = `Defect Test Project ${timestamp}`;
    createdProjectName = projectName;
    const caseTitle = `Login Test ${timestamp}`;
    const defectId = `JIRA-${timestamp.toString().slice(-4)}`;

    // 1. Create Project & Case
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    await createProjectPromise;
    
    await page.getByRole('heading', { name: projectName }).click();
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(caseTitle);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('cell', { name: caseTitle })).toBeVisible();

    // 2. Execute Test (Fail with Defect)
    await page.getByText(caseTitle).click(); // Go to detail view
    await page.getByRole('button', { name: 'Run Test' }).click(); // Open execution modal/panel
    
    // Fill Defect Details
    await page.getByPlaceholder('Defect ID (e.g. JIRA-123)').fill(defectId);
    
    // Continue with other selections
    await page.locator('select').nth(0).selectOption('Jira'); // Tracker
    await page.locator('select').nth(1).selectOption('S0'); // Severity
    await page.locator('select').nth(2).selectOption('OPEN'); // Status
    
    const saveExecutionResponse = page.waitForResponse(resp => resp.url().includes('/api/testcases') && resp.request().method() === 'POST');
    
    await page.getByRole('button', { name: 'Fail' }).click(); // Triggers the save.
    await saveExecutionResponse;

    // 3. Verify History via Store State (More stable than UI in test env)
    await page.waitForFunction((title) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const store = (window as any)._APP_STORE_;
        if (!store) return false;
        const state = store.getState();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tc = state.testCases.find((t: any) => t.title === title);
        return tc?.history?.length > 0;
    }, caseTitle, { timeout: 30000 });

    const latestRecord = await page.evaluate((title) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const store = (window as any)._APP_STORE_;
        const state = store.getState();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tc = state.testCases.find((t: any) => t.title === title);
        return tc?.history?.[0];
    }, caseTitle);

    expect(latestRecord).not.toBeNull();
    expect(latestRecord.status).toBe('FAILED');
    expect(latestRecord.defects).toHaveLength(1);
    expect(latestRecord.defects[0].externalId).toBe(defectId);
    expect(latestRecord.defects[0].severity).toBe('S0');
    expect(latestRecord.defects[0].status).toBe('OPEN');
  });
});