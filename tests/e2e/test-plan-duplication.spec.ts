import { test, expect, Page } from '@playwright/test';

// --- BDD Helpers (reused from core-flows.spec.ts) ---

async function givenUserIsLoggedIn(page: Page) {
    const loginHeader = page.getByText('Select Account');
    const dashboardOverviewHeader = page.getByText('Overview'); 
    
    if (await page.locator('aside').isVisible()) return; 
    if (await dashboardOverviewHeader.isVisible()) return; 

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

async function createProjectAndNavigate(page: Page, projectName: string) {
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    await createProjectPromise;
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();
    await page.getByRole('heading', { name: projectName }).click(); // Enter project
}

test.describe('Test Plan Duplication', () => {
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

  test('should duplicate a test plan with its cases', async ({ page }) => {
    test.setTimeout(120000); // Increased timeout for potentially longer flow
    const timestamp = Date.now();
    const projectName = `Plan Dupe Project ${timestamp}`;
    createdProjectName = projectName;
    const planName = `Regression Plan ${timestamp}`;
    const caseTitle1 = `Case 1 for ${timestamp}`;
    const caseTitle2 = `Case 2 for ${timestamp}`;

    // 1. Create Project
    await createProjectAndNavigate(page, projectName);

    // 2. Create Test Cases
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(caseTitle1);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('cell', { name: caseTitle1 })).toBeVisible();

    await page.getByRole('button', { name: 'Create Case' }).first().click();
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(caseTitle2);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('cell', { name: caseTitle2 })).toBeVisible();
    
    // Get IDs of created cases
    const testCasesResponse = await page.request.get(`/api/testcases?projectId=${page.url().split('/').pop()}`);
    const testCasesData = await testCasesResponse.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caseId1 = testCasesData.find((tc: any) => tc.title === caseTitle1)?.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caseId2 = testCasesData.find((tc: any) => tc.title === caseTitle2)?.id;
    expect(caseId1).toBeDefined();
    expect(caseId2).toBeDefined();

    // 3. Go to Test Plans tab
    await page.getByRole('button', { name: 'Test Plans' }).click();
    await expect(page.getByRole('heading', { name: 'Test Plans' })).toBeVisible();

    // 4. Create a Test Plan
    await page.getByRole('button', { name: 'New Plan' }).click();
    await page.getByPlaceholder('e.g. Release 1.0 Regression').fill(planName);
    const createPlanPromise = page.waitForResponse(resp => resp.url().includes('/api/projects/') && resp.url().includes('/plans') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create' }).click();
    await createPlanPromise;
    await expect(page.getByText(planName)).toBeVisible();

    // 5. Add cases to the plan
    await page.getByText(planName).click(); // Go into plan detail
    await expect(page.getByRole('heading', { name: planName })).toBeVisible();

    await page.getByRole('button', { name: 'Add Cases' }).click(); // Open add cases modal
    await expect(page.getByText('Add Cases to Plan')).toBeVisible();

    await page.getByRole('checkbox').first().check(); // Select all cases (assuming only 2 exist)
    await page.getByRole('button', { name: /Add Selected/i }).click(); // Add selected
    await expect(page.getByText('Add Cases to Plan')).not.toBeVisible(); // Modal closes

    await expect(page.getByRole('cell', { name: caseTitle1 })).toBeVisible();
    await expect(page.getByRole('cell', { name: caseTitle2 })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'UNTESTED' }).nth(0)).toBeVisible(); // Initial status
    await expect(page.getByRole('cell', { name: 'UNTESTED' }).nth(1)).toBeVisible(); // Initial status

    // 6. Go back to Test Plans list
    await page.getByLabel('Back to plans list').click();
    await page.waitForURL(`/project/*/plans`); // Wait for URL change
    await expect(page.getByRole('heading', { name: 'Test Plans' })).toBeVisible({ timeout: 10000 });

    // 7. Duplicate the plan
    const originalPlanCard = page.locator('div.group', { hasText: planName }).first();
    const duplicateButton = originalPlanCard.getByRole('button', { name: 'Duplicate Plan' });
    await expect(duplicateButton).toBeVisible();

    // Get the original plan ID programmatically before clicking
    // URL is like /project/[id]/plans. We need the ID.
    const urlParts = page.url().split('/');
    const projectId = urlParts[urlParts.length - 2];
    const planResponse = await page.request.get(`/api/projects/${projectId}/plans`);
    const plansData = await planResponse.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalPlanId = plansData.find((p: any) => p.name === planName)?.id;
    expect(originalPlanId).toBeDefined();

    // Set up a new promise with the correct ID
    const duplicateSpecificPlanPromise = page.waitForResponse(resp => resp.url().includes(`/api/plans/${originalPlanId}/duplicate`) && resp.status() === 201);

    await duplicateButton.click();
    await duplicateSpecificPlanPromise;
    
    const duplicatedPlanName = `${planName} (Copy)`;
    await expect(page.getByText(duplicatedPlanName)).toBeVisible();

    // 8. Go into the duplicated plan and verify content
    await page.getByText(duplicatedPlanName).click();
    await expect(page.getByRole('heading', { name: duplicatedPlanName })).toBeVisible();

    await expect(page.getByRole('cell', { name: caseTitle1 })).toBeVisible();
    await expect(page.getByRole('cell', { name: caseTitle2 })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'UNTESTED' }).nth(0)).toBeVisible(); 
    await expect(page.getByRole('cell', { name: 'UNTESTED' }).nth(1)).toBeVisible();
    await expect(page.getByText('SNAPSHOT').nth(0)).toBeVisible(); // Verify snapshot is present
    await expect(page.getByText('SNAPSHOT').nth(1)).toBeVisible(); // Verify snapshot is present
  });
});