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

test.describe('Regression: Case Suite Selection', () => {
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
    // Mock AI endpoints to speed up tests
    await page.route('/api/ai/generate-steps', async route => {
        const mockResponse = `{"action": "Mock Step 1", "expected": "Mock Result 1"}\n{"action": "Mock Step 2", "expected": "Mock Result 2"}`;
        await route.fulfill({ status: 200, contentType: 'text/plain', body: mockResponse });
    });
    await page.route('**/app/actions', async route => {
        await route.continue();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await givenUserIsOnProjectsPage(page);
  });

  test('should pre-select the case suite when creating a new case', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `E2E Regression Project ${timestamp}`;
    createdProjectName = projectName; // Set for cleanup

    // 1. Create a new project
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201, { timeout: 60000 });

    await page.getByRole('button', { name: 'Create Project' }).click();
    await createProjectPromise;
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    // 2. Navigate into the project
    await page.getByRole('heading', { name: projectName }).click();
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    // 2.5 Navigate to Test Cases tab (project defaults to Requirements tab)
    await page.getByRole('button', { name: 'Test Cases' }).click();
    await page.waitForTimeout(500);

    // 3. Create a suite
    const suiteName = `Backend Suite ${timestamp}`;
    await page.locator('button:has(svg.lucide-folder-plus)').click();
    const suiteNameInput = page.locator('input:focus');
    await suiteNameInput.fill(suiteName);
    await suiteNameInput.press('Enter');
    await expect(page.locator('div.select-none').getByText(suiteName)).toBeVisible();

    // 4. Select the newly created suite
    await page.getByText(suiteName).click();

    // 5. Click "Create Case"
    await page.getByRole('table').getByRole('button', { name: 'Create Case' }).click();

    // 6. Verify the combobox (select) has the correct suite pre-selected
    // Use strict assertion: Check the text of the selected option
    const selectedOption = page.locator('select option:checked').first();
    await expect(selectedOption).toHaveText(suiteName);

    // Close the modal to clean up
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('New Test Case')).not.toBeVisible();
  });
});
