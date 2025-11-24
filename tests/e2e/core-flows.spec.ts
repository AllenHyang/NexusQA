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
    test.setTimeout(60000);
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

    // --- Add Manual Steps ---
    await page.getByRole('button', { name: 'Add Step' }).click();
    const stepsList = page.locator('.space-y-3 > div'); // Assuming step items container
    await expect(stepsList.first()).toBeVisible();
    
    // Fill step details (Action and Expected Result inputs)
    await page.getByPlaceholder('e.g. Click login button').first().fill('Enter valid username');
    await page.getByPlaceholder('e.g. User is redirected').first().fill('Field is populated');

    // Save
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify Creation in Table
    await expect(page.getByRole('cell', { name: caseTitle })).toBeVisible();
    await expect(page.getByText('HIGH')).toBeVisible();

    // --- EXECUTE TEST CASE (Mark as PASSED) ---
    const caseRow = page.locator('tr', { hasText: caseTitle });
    await caseRow.hover();
    // Click Execute button (Play icon), assuming it's the first button in actions or distinct
    // We use a more specific locator if possible, or index. Let's assume it has a play icon or similar tooltip
    // Based on UI analysis, it's likely near the edit button.
    // Let's use the 'Play' icon class or aria-label if available, otherwise nth.
    // Reviewing typical UI, often: Edit, Execute, Delete.
    // Let's try to find the button with the Play icon.
    const executeBtn = caseRow.locator('button').filter({ has: page.locator('svg.lucide-play') }).first();
    
    // If execute button is not found (maybe only on detail view?), let's try opening detail and executing there.
    // But list view usually has it. Let's assume list view action.
    if (await executeBtn.count() > 0) {
        await executeBtn.click();
    } else {
        // Fallback: Open edit modal and look for execute/status change there? 
        // Or maybe the UI requires clicking the status badge?
        // Let's assume we click the Edit button to open modal, then switch to Execute tab or button?
        // Re-reading codebase: Dashboard/ProjectView has 'Execute' action?
        // Let's stick to the Edit button we know exists, and check if modal has 'Execute' or status change.
        const editBtn = caseRow.locator('td').last().locator('button').first();
        await editBtn.click();
        await expect(page.getByText('Test Case Details')).toBeVisible();
        // In modal, is there an Execute button?
        await page.getByRole('button', { name: 'Execute' }).click(); // Switch to execution mode if it's a toggle/tab
        // OR directly click 'Pass' if available.
    }

    // Wait for Execution Modal/Mode
    // Verify we see status buttons (Pass, Fail, etc.)
    await expect(page.getByRole('button', { name: 'Pass' })).toBeVisible();

    // Click Pass
    await page.getByRole('button', { name: 'Pass' }).click();

    // Verify Status Update in Table
    // The modal should close or we close it? Usually executing closes it or updates UI.
    // If it closes automatically:
    await expect(page.getByRole('cell', { name: 'PASSED' })).toBeVisible();
    
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

    // Delete Project
    const projectCard = page.locator('div.group', { hasText: projectName }).first();
    await projectCard.hover();
    
    page.removeAllListeners('dialog');
    page.once('dialog', dialog => dialog.accept());
    await projectCard.getByRole('button', { name: 'Delete Project' }).click({ force: true });
    await expect(page.getByText(projectName, { exact: true })).not.toBeVisible();
  });

  test('should generate content using AI', async ({ page }) => {
    test.setTimeout(120000); // Increase timeout for AI generation
    const timestamp = Date.now();
    const projectName = `AI Project ${timestamp}`;
    createdProjectName = projectName;
    const caseTitle = `AI Generated Test ${timestamp}`;

    // 1. Create Project
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

    // 3. Create Test Case
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    await expect(page.getByText('New Test Case')).toBeVisible();

    // 4. Fill Title and Generate
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(caseTitle);
    
    console.log('Triggering AI Generation...');
    // Click Generate Steps (Magic Wand)
    // Looking for button with "Generate Steps" text or similar. 
    // Assuming the button text or aria-label is "Generate Steps"
    // If it's an icon, we might need a more specific selector.
    // Based on typical UI, it might be near the Steps section title.
    await page.getByRole('button', { name: 'Generate Steps' }).click();

    // Wait for AI Generation (It takes time)
    // We check if steps inputs appear and have value.
    // The inputs usually have placeholders like "e.g. Click login button"
    // We wait for the first input to have a non-empty value.
    const firstActionInput = page.getByPlaceholder('e.g. Click login button').first();
    
    // Wait for the input to be visible first (in case it wasn't there)
    await expect(firstActionInput).toBeVisible({ timeout: 10000 });
    
    // Wait for value to be populated
    await expect(async () => {
        const val = await firstActionInput.inputValue();
        expect(val.length).toBeGreaterThan(5);
    }).toPass({ timeout: 60000 });

    console.log('AI Generation completed.');

    // 5. Save
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // 6. Verify
    await expect(page.getByRole('cell', { name: caseTitle })).toBeVisible();

    // Cleanup
    console.log('Cleaning up AI Project...');
    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    const projectCard = page.locator('div.group', { hasText: projectName }).first();
    await projectCard.hover();
    page.removeAllListeners('dialog');
    page.once('dialog', dialog => dialog.accept());
    await projectCard.getByRole('button', { name: 'Delete Project' }).click({ force: true });
    await expect(page.getByText(projectName, { exact: true })).not.toBeVisible();
  });
});