import { test, expect } from '@playwright/test';

test.describe('Core Project Flows', () => {
  
  let createdProjectName: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdProjectName) {
      console.log(`Cleaning up project: ${createdProjectName}`);
      // 1. Fetch all projects to find the ID (since we only have name from test context)
      const listRes = await request.get('/api/projects');
      if (listRes.ok()) {
        const projects = await listRes.json();
        // Find all projects starting with the test name pattern (handle retry duplicates)
        const projectsToDelete = projects.filter((p: any) => p.name === createdProjectName || p.name.startsWith(createdProjectName));
        
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

    const loginHeader = page.getByText('Select Account');
    // Dashboard view has 'Overview', Projects view has 'All Projects'
    const dashboardHeader = page.getByText('Overview');
    const projectsHeader = page.getByText('All Projects');

    // 1. Already on Projects Page?
    if (await projectsHeader.isVisible()) {
        return;
    }

    // 2. On Dashboard (Home) Page?
    if (await dashboardHeader.isVisible()) {
        await page.getByRole('button', { name: 'Projects', exact: true }).click();
        await expect(projectsHeader).toBeVisible();
        return;
    }

    // 3. Need to Login?
    if (await loginHeader.isVisible()) {
        const buttons = await page.locator('button').all();
        let targetButton = null;
        for (const btn of buttons) {
             const text = await btn.innerText();
             if (text.includes('Sarah Jenkins')) {
                 targetButton = btn;
                 break;
             }
        }

        if (targetButton) {
            await targetButton.click();
        } else {
             await page.getByText('Sarah Jenkins').click();
        }
        
        // Wait for Dashboard "Overview" first
        await expect(dashboardHeader).toBeVisible({ timeout: 15000 });
        
        // Then navigate to Projects using SPA navigation
        await page.getByRole('button', { name: 'Projects', exact: true }).click();
        await expect(projectsHeader).toBeVisible();
    } else {
        // Fallback: try Sidebar navigation if we are somewhere else
         await page.getByRole('button', { name: 'Projects', exact: true }).click();
         await expect(projectsHeader).toBeVisible();
    }
  });

  test('should create, edit, and delete a project', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `E2E Project ${timestamp}`;
    createdProjectName = projectName;
    const projectDesc = 'This is an automated test project';
    const updatedName = `${projectName} - Updated`;

    // --- CREATE ---
    await page.getByRole('button', { name: 'New Project' }).click();
    
    // Wait for modal
    await expect(page.getByText('Create New Project')).toBeVisible();
    
    // Fill form
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    await page.getByPlaceholder('Brief overview of what this project tests...').fill(projectDesc);
    
    // Submit
    const createResponsePromise = page.waitForResponse(response => 
        response.url().includes('/api/projects') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Create Project' }).click();

    await createResponsePromise;

    // Verify creation
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(projectDesc).first()).toBeVisible();

    // --- EDIT ---
    // Locate the card
    const projectCard = page.locator('div.group', { hasText: projectName }).first();
    // Hover to show actions
    await projectCard.hover();

    // Click Edit
    const editBtn = projectCard.getByRole('button', { name: 'Edit Project' });
    // Force click because the button transition might strictly be 'invisible' during the start of hover
    await editBtn.click({ force: true });

    // Verify Edit Modal
    await expect(page.getByText('Edit Project')).toBeVisible();
    
    // Update Name
    await page.getByPlaceholder('e.g. Mobile App V2').fill(updatedName);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify Update
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
    await expect(page.getByText(projectName, { exact: true })).not.toBeVisible();

    // --- DELETE ---
    const updatedCard = page.locator('div.group', { hasText: updatedName }).first();
    await updatedCard.hover();

    // Setup dialog handler for confirmation
    page.removeAllListeners('dialog');
    page.once('dialog', dialog => dialog.accept());

    // Click Delete
    const deleteBtn = updatedCard.getByRole('button', { name: 'Delete Project' });
    await deleteBtn.click({ force: true });

    // Verify Deletion
    await expect(page.getByText(updatedName).first()).not.toBeVisible();
  });

  test('should create, edit, and delete test cases', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `E2E Case Project ${timestamp}`;
    createdProjectName = projectName;
    const caseTitle = `Login Test ${timestamp}`;
    const caseTitleUpdated = `${caseTitle} - Updated`;

    // 1. Create Project (Prerequisite)
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    
    const createResponsePromise = page.waitForResponse(response => 
        response.url().includes('/api/projects') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Create Project' }).click();
    await createResponsePromise;
    
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible({ timeout: 30000 });

    // 2. Enter Project
    await page.locator('div.group', { hasText: projectName }).first().click();
    // Verify we are in the project detail view
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    // 3. Create Test Case
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    
    // Verify Modal
    await expect(page.getByText('New Test Case')).toBeVisible();

    // Fill Form
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(caseTitle);
    
    // Select Priority (assuming it's the second select)
    await page.locator('select').nth(1).selectOption('HIGH');

    // Save
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify Creation in Table
    await expect(page.getByRole('cell', { name: caseTitle })).toBeVisible();
    await expect(page.getByText('HIGH')).toBeVisible();

    // 4. Edit Test Case
    const row = page.locator('tr', { hasText: caseTitle });
    await row.hover();
    // Click Details/Edit button
    const actionsCell = row.locator('td').last();
    const editBtn = actionsCell.locator('button').first();
    await editBtn.click();

    // Verify Edit Modal
    await expect(page.getByText('Test Case Details')).toBeVisible();
    
    // Update Title
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(caseTitleUpdated);
    
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify Update
    await expect(page.getByRole('cell', { name: caseTitleUpdated })).toBeVisible();
    await expect(page.getByRole('cell', { name: caseTitle, exact: true })).not.toBeVisible();

    // 5. Delete Test Case
    const updatedRow = page.locator('tr', { hasText: caseTitleUpdated });
    await updatedRow.hover();
    const deleteBtn = updatedRow.locator('td').last().locator('button').last(); // Delete is last
    
    page.removeAllListeners('dialog');
    page.once('dialog', dialog => dialog.accept());
    await deleteBtn.click();

    // Verify Deletion
    await expect(page.getByRole('cell', { name: caseTitleUpdated })).not.toBeVisible();

    // 6. Cleanup Project
    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    
    // Delete Project
    const projectCard = page.locator('div.group', { hasText: projectName }).first();
    await projectCard.hover();
    
    page.removeAllListeners('dialog');
    page.once('dialog', dialog => dialog.accept());
    await projectCard.getByRole('button', { name: 'Delete Project' }).click({ force: true });
    // Verify Deletion
    await expect(page.getByText(projectName, { exact: true }).first()).not.toBeVisible();
  });
});