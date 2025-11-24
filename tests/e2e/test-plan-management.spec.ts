import { test, expect, Page } from '@playwright/test';

// --- BDD Helpers ---

async function givenUserIsLoggedIn(page: Page) {
    const loginHeader = page.getByText('Select Account');
    const dashboardHeader = page.getByText('Overview');
    
    // If already on dashboard or an internal page with sidebar, we are logged in
    if (await page.locator('aside').isVisible()) return;

    if (await dashboardHeader.isVisible()) return;

    if (await loginHeader.isVisible()) {
        // Default to Admin
        await page.locator('button', { hasText: 'Sarah Jenkins' }).click();
        await expect(dashboardHeader).toBeVisible({ timeout: 15000 });
    }
}

async function givenUserIsOnProjectsPage(page: Page) {
    await givenUserIsLoggedIn(page);
    
    const projectsHeader = page.getByText('All Projects');
    if (await projectsHeader.isVisible()) return;

    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    await expect(projectsHeader).toBeVisible();
}

test.describe('Test Plan Management', () => {
  
  let createdProjectName: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdProjectName) {
      console.log(`Cleaning up project: ${createdProjectName}`);
      const listRes = await request.get('/api/projects');
      if (listRes.ok()) {
        const projects = await listRes.json();
        const projectsToDelete = projects.filter((p: { name: string; id: string }) => p.name.startsWith(createdProjectName as string));
        
        for (const p of projectsToDelete) {
           console.log(`Deleting project via API: ${p.name} (${p.id})`);
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

  test('should create a test plan, add cases, and execute runs', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `Test Plan Project ${timestamp}`;
    createdProjectName = projectName;
    const planName = `Release 1.0 ${timestamp}`;
    const case1Title = `Case A ${timestamp}`;
    const case2Title = `Case B ${timestamp}`;

    // 1. Create Project
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    await createProjectPromise;
    
    // 2. Enter Project
    await page.getByRole('heading', { name: projectName }).click();
    
    // 3. Create Two Test Cases
    // Case 1
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(case1Title);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('cell', { name: case1Title })).toBeVisible();

    // Case 2
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(case2Title);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('cell', { name: case2Title })).toBeVisible();

    // 4. Create Test Plan
    // Navigate to Plans tab
    await page.getByRole('button', { name: 'Test Plans' }).click();
    
    // Click New Plan
    await page.getByRole('button', { name: 'New Plan' }).click();
    
    // Fill Plan Name
    const nameInput = page.getByPlaceholder('e.g. Release 1.0 Regression');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(planName);
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    
    // Verify Plan Created
    await expect(page.getByText(planName)).toBeVisible();
    
    // 5. Add Cases to Plan
    // Go back to Test Cases (List) View to select cases
    await page.getByRole('button', { name: 'Test Cases' }).click();
    
    // Select both cases
    // Using the row click or checkbox. The row click opens details, checkbox selects.
    // Select both cases using Select All
    await expect(page.getByText(case1Title)).toBeVisible();
    await expect(page.getByText(case2Title)).toBeVisible();
    
    // Select cases using Select All
    const headerCheckbox = page.locator('table thead input[type="checkbox"]');
    await headerCheckbox.check();
    await expect(headerCheckbox).toBeChecked();
    
    // Verify selection bar appears
    await expect(page.getByRole('button', { name: 'Add to Plan' })).toBeVisible();
    await expect(page.getByText('Selected')).toBeVisible();
    
    // Click "Add to Plan"
    await page.getByRole('button', { name: 'Add to Plan' }).click();
    
    // Select the plan in modal
    await page.getByRole('button', { name: planName }).click();
    
    // Confirm Add
    // The button name is "Add" inside the modal
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    
    // Verify success (modal closes, selection clears)
    await expect(page.getByText('Add to Plan')).not.toBeVisible();
    await expect(page.getByText('2 Selected')).not.toBeVisible();
    
    // 6. Execute Test Run
    // Go to Plans tab
    await page.getByRole('button', { name: 'Test Plans' }).click();
    
    // Click the Plan
    await page.getByText(planName).click();
    
    // Verify we are on Plan Detail Page
    await expect(page.getByRole('heading', { name: planName })).toBeVisible();
    
    // Verify Cases are listed
    await expect(page.getByText(case1Title)).toBeVisible();
    await expect(page.getByText(case2Title)).toBeVisible();
    
    // Mark Case 1 as PASSED
    const runRow1 = page.locator('tr', { hasText: case1Title });
    await runRow1.getByTitle('Mark as Passed').click();
    
    // Verify status update
    // The StatusBadge for passed usually has green text or "PASSED" text
    await expect(runRow1.getByText('PASSED')).toBeVisible();
    
    // Mark Case 2 as FAILED
    const runRow2 = page.locator('tr', { hasText: case2Title });
    await runRow2.getByTitle('Mark as Failed').click();
    await expect(runRow2.getByText('FAILED')).toBeVisible();
    
    // Verify Overall Progress
    // 50% progress
    await expect(page.getByText('50% (1/2)')).toBeVisible();
    
    // Verify Stats Headers
    await expect(page.locator('.glass-panel', { hasText: '1 Pass' })).toBeVisible();
    await expect(page.locator('.glass-panel', { hasText: '1 Fail' })).toBeVisible();
  });

});
