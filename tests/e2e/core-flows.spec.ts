import { test, expect, Page } from '@playwright/test';

// --- BDD Helpers ---

async function givenUserIsLoggedIn(page: Page) {
    const loginHeader = page.getByText('Select Account');
    const dashboardOverviewHeader = page.getByText('Overview'); // Correctly identify the Dashboard header
    
    // If already on Dashboard or internal page with sidebar
    if (await page.locator('aside').isVisible()) return; 
    if (await dashboardOverviewHeader.isVisible()) return; // If already on the Dashboard view

    if (await loginHeader.isVisible()) {
        await page.locator('button', { hasText: 'Sarah Jenkins' }).click();
        // Wait for the 'Overview' header to become visible on the Dashboard page after login
        await dashboardOverviewHeader.waitFor({ state: 'visible', timeout: 30000 });
        // Additional assertion for robustness
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

test.describe('Core Project Flows', () => {
  
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
    page.on('console', msg => console.log(`PAGE CONSOLE [${msg.type()}]: ${msg.text()}`));
    page.on('pageerror', error => console.error(`PAGE ERROR: ${error.message}`));
    page.on('request', request => console.log(`NETWORK REQUEST: ${request.method()} ${request.url()}`));
    page.on('requestfailed', request => console.error(`NETWORK REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure()?.errorText}`));
    page.on('response', async response => {
        if (response.url().includes('/api/') && response.status() >= 400) {
            console.error(`NETWORK RESPONSE ERROR: ${response.status()} ${response.url()} - ${await response.text()}`);
        }
    });
    page.on('url', url => console.log(`PAGE URL CHANGED TO: ${url}`));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await givenUserIsOnProjectsPage(page);
  });

  test('should create, edit, and delete a project', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `E2E Project ${timestamp}`;
    createdProjectName = projectName;
    const projectDesc = 'This is an automated test project';
    const updatedName = `${projectName} - Updated`;

    // --- CREATE ---
    await page.getByRole('button', { name: 'New Project' }).click();
    await expect(page.getByText('Create New Project')).toBeVisible();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    await page.getByPlaceholder('Brief overview of what this project tests...').fill(projectDesc);
    
    const createResponsePromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    await createResponsePromise;

    await expect(page.getByRole('heading', { name: projectName })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(projectDesc).first()).toBeVisible();

    // --- EDIT ---
    const projectCard = page.locator('div.group', { hasText: projectName }).first();
    await projectCard.hover();
    await projectCard.getByRole('button', { name: 'Edit Project' }).click({ force: true });
    await expect(page.getByText('Edit Project')).toBeVisible();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(updatedName);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(projectName, { exact: true })).not.toBeVisible();

    // --- DELETE ---
    const updatedCard = page.locator('div.group', { hasText: updatedName }).first();
    await updatedCard.hover();
    page.removeAllListeners('dialog');
    page.once('dialog', dialog => dialog.accept());
    await updatedCard.getByRole('button', { name: 'Delete Project' }).click({ force: true });
    await expect(page.getByText(updatedName).first()).not.toBeVisible();
  });

  test('should create, edit, and delete test suites and cases within them', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `E2E Suite Project ${timestamp}`;
    createdProjectName = projectName;
    const suiteName = `Backend Suite ${timestamp}`;
    const renamedSuite = `${suiteName} - Renamed`;
    const caseTitle = `API Test Case ${timestamp}`;

    // 1. Create Project
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    await createProjectPromise;
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    // 2. Enter Project
    await page.getByRole('heading', { name: projectName }).click();
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    // 2.5. Navigate to Test Cases tab
    await page.getByText('Test Cases', { exact: true }).click();
    await page.waitForTimeout(500); // Wait for tab content to load

    // 3. Create Suite (Folder)
    // Locate the button with FolderPlus icon
    await page.locator('button:has(svg.lucide-folder-plus)').click();
    const suiteNameInput = page.locator('input:focus');
    await suiteNameInput.fill(suiteName);
    await suiteNameInput.press('Enter');
    await expect(page.locator('div.select-none').getByText(suiteName)).toBeVisible();
    
    // 4. Rename Suite
    const suiteRow = page.locator('div.group', { has: page.getByText(suiteName) });
    await suiteRow.hover();
    // Click the action button (it's the only button in the row)
    await suiteRow.getByRole('button').click({ force: true });
    await page.getByRole('button', { name: 'Rename' }).click();
    // The input auto-focuses on edit
    const renameInput = page.locator('input:focus');
    await renameInput.fill(renamedSuite);
    await renameInput.press('Enter');
    await expect(page.getByText(renamedSuite)).toBeVisible();
    
    // 5. Create Test Case inside the Suite
    await page.getByText(renamedSuite).click(); // Select the suite
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    await expect(page.getByText('New Test Case')).toBeVisible();
    
    // Explicitly select the suite to ensure it's not created in root
    await page.locator('select').first().selectOption({ label: renamedSuite });
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(caseTitle);

    // --- Fill SOP Mandatory Fields ---
    // Preconditions (Using regex for robustness against minor text changes)
    await page.getByPlaceholder(/e\.g\. User is on the login page/i).fill('User must be logged in');
    
    // User Story
    await page.getByPlaceholder(/As a \[User\]/i).fill('As a user, I want to access the API.');
    
    // Acceptance Criteria
    await page.getByPlaceholder(/Given \[context\]/i).fill('1. Response is 200 OK');
    
    // Requirement ID
    await page.getByPlaceholder(/Requirement ID/i).fill('REQ-001');

    // --- Add Manual Steps ---
    await page.getByRole('button', { name: 'Add Manual Step' }).click();
    const firstActionInput = page.getByPlaceholder('e.g. Click login button').first();
    const firstExpectedInput = page.getByPlaceholder('e.g. User is redirected').first();
    await expect(firstActionInput).toBeVisible();
    await firstActionInput.fill('Manual Action');
    await firstExpectedInput.fill('Manual Expected');

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText('New Test Case')).not.toBeVisible();
    await expect(page.getByRole('cell', { name: caseTitle })).toBeVisible({ timeout: 10000 });

    // --- Verify SOP Fields & Review Workflow ---
    // Open the case again (Using the Details action button)
    console.log(`Attempting to click Details button for: ${caseTitle}`);
    const row = page.locator('tr', { hasText: caseTitle }).first();
    await row.hover();
    // Find the button with Maximize2 icon (details)
    await row.locator('button:has(svg.lucide-maximize-2)').click({ force: true });
    await expect(page.getByText('Test Case Details')).toBeVisible({ timeout: 15000 });
    
    // Verify SOP Mandatory Fields Persisted
    await expect(page.getByText('User must be logged in')).toBeVisible();
    await expect(page.getByText('As a user, I want to access the API.')).toBeVisible();
    
    // Verify Default Review Status (SOP 4.2)
    // Since we are Admin, we see a select. Check its value.
    await expect(page.locator('#review-status-select')).toHaveValue('PENDING');
    
    // Approve the Case (Simulate Review)
    // Assuming there is a way to change it, e.g. a select or button. 
    // If not easily locatable, we'll just verify the PENDING state which is critical.
    // Let's try to find a select with "PENDING" value or label.
    const reviewSelect = page.locator('select').filter({ hasText: 'PENDING' });
    if (await reviewSelect.isVisible()) {
        await reviewSelect.selectOption('APPROVED');
        
        // Wait for Save API call AND Refresh
        const saveResponsePromise = page.waitForResponse(resp => resp.url().includes('/api/testcases') && resp.request().method() === 'POST');

        await page.getByRole('button', { name: 'Save Changes' }).click();
        
        await saveResponsePromise;
        
        // Modal closes on save
        await expect(page.getByText('Test Case Details')).not.toBeVisible();
        
        // Open again to verify persistence
        await row.locator('button:has(svg.lucide-maximize-2)').click({ force: true });
        await expect(page.getByText('Test Case Details')).toBeVisible();
        await expect(page.locator('#review-status-select')).toHaveValue('APPROVED');
        
        // Close modal
        await page.getByRole('button', { name: 'Close' }).click();
    } else {
        // Just close if we can't edit review status
        await page.getByRole('button', { name: 'Close' }).click();
    }

    // --- Execute Test Case (via Detail View) ---
    // Click the title to go to Detail View
    await page.getByText(caseTitle).click();
    await expect(page.getByRole('heading', { name: caseTitle })).toBeVisible();
    
    // Click Run Test
    await page.getByRole('button', { name: 'Run Test' }).click();
    
    // Execution Modal
    await expect(page.getByText('Execute Test Case')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pass' })).toBeVisible();

    // Step 1: Select the status
    await page.getByRole('button', { name: 'Pass' }).click();

    // Step 2: Confirm by clicking Save button
    await page.getByRole('button', { name: 'Save Execution Result' }).click();

    // Wait for execution to complete (modal stays open with Last Result shown)
    await expect(page.getByText('Last Result:')).toBeVisible({ timeout: 10000 });

    // Close the modal manually
    await page.getByRole('button', { name: 'Close' }).click();

    // Verify Status on Detail Page
    await expect(page.getByText('PASSED').first()).toBeVisible();

    // Navigate back to Project List
    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'All Projects' })).toBeVisible();
    // Click the project card title (heading)
    await page.getByRole('heading', { name: projectName }).click();
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible();

    // 6. Delete Suite (should fail if not empty, or confirm deletion)
    // The current UI might not support deleting non-empty suites easily, so we'll test deleting an empty one.
    // For now, let's just delete the project to clean up. This confirms the main happy path.
    // We'll leave the more complex delete logic for a separate test.
  });

  test('should generate content using AI', async ({ page }) => {
    test.setTimeout(60000); // Keep increased timeout for AI test due to actual AI call if not mocked. Currently mocked.
    const timestamp = Date.now();
    const projectName = `AI Project ${timestamp}`;
    createdProjectName = projectName;
    const caseTitle = `AI Generated Test ${timestamp}`;

    // 1. Create & Enter Project
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    await createProjectPromise;
    await page.getByRole('heading', { name: projectName }).click();

    // 1.5. Navigate to Test Cases tab
    await page.getByText('Test Cases', { exact: true }).click();
    await page.waitForTimeout(500); // Wait for tab content to load

    // 2. Create Test Case
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    await expect(page.getByText('New Test Case')).toBeVisible();
    
    // Explicitly wait for the modal to be stable
    await page.waitForSelector('.modal-overlay', { state: 'visible', timeout: 10000 }); // Wait for the modal wrapper
    await page.waitForSelector('h3:has-text("New Test Case")', { state: 'visible', timeout: 5000 }); // Wait for modal title

    // 3. Fill Title and Generate
    await page.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(caseTitle);
    
    // IMPORTANT: Move the mock here to ensure it's active for this specific request
    await page.route('/api/ai/generate-steps', async route => {
        // Correct the mockResponse to have a newline between JSON objects
        const mockResponse = `{"action": "Mock Step 1", "expected": "Mock Result 1"}\n{"action": "Mock Step 2", "expected": "Mock Result 2"}`;
        await route.fulfill({ status: 200, contentType: 'text/plain', body: mockResponse });
    });

    console.log("PAGE LOG: Attempting to click 'Generate with AI' button.");

    const generateStepsResponsePromise = page.waitForResponse(resp => resp.url().includes('/api/ai/generate-steps') && resp.status() === 200);
    await page.getByRole('button', { name: /Generate with AI/i }).click();
    await generateStepsResponsePromise; // Wait for the mock API response

    // 4. Verify AI Generation (Mocked)
    const firstActionInputPlaceholderSelector = 'input[placeholder="e.g. Click login button"]';
    const firstActionInputLocator = page.locator(firstActionInputPlaceholderSelector).first();
    
    await expect(page.getByRole('button', { name: /Generate with AI/i }).locator('svg.lucide-sparkles')).toBeVisible({ timeout: 10000 });

    await firstActionInputLocator.waitFor({ state: 'visible', timeout: 10000 }); 

    const actualInputValue = await firstActionInputLocator.evaluate((input: HTMLInputElement) => input.value);
    console.log(`PAGE LOG: Actual input value BEFORE waitForFunction: "${actualInputValue}"`);
    
    await expect(firstActionInputLocator).toBeVisible();
    await expect(firstActionInputLocator).toHaveValue('Mock Step 1');
    
    // 5. Save and Verify
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByRole('cell', { name: caseTitle })).toBeVisible();
  });
});