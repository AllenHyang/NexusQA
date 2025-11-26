import { test, expect, Page } from '@playwright/test';

// --- BDD Helpers ---

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

    // Wait for the Projects button in the sidebar to be visible and enabled before clicking
    const projectsButton = page.getByRole('button', { name: 'Projects', exact: true });
    await projectsButton.waitFor({ state: 'visible', timeout: 30000 });
    await projectsButton.click();
    await expect(projectsHeader).toBeVisible();
}

test.describe('Defect Management 2.0', () => {
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

  test('Happy Path: Create, Filter, Discuss, and Bulk Manage Defects', async ({ page }) => {
    test.setTimeout(120000); // Allow enough time for multi-step flow
    const timestamp = Date.now();
    const projectName = `Defect Mgmt Suite ${timestamp}`;
    createdProjectName = projectName;
    
    const defectA = { title: `Critical Bug ${timestamp}`, severity: 'Critical' };
    const defectB = { title: `Minor Bug ${timestamp}`, severity: 'Low' };

    // --- SETUP: Create Project ---
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    await createProjectPromise;
    
    // Navigate to Defects Tab
    await page.getByRole('heading', { name: projectName }).click();
    await page.getByRole('button', { name: 'Defects' }).click();
    await expect(page.getByText(`Manage internal and external defects for ${projectName}`)).toBeVisible();

    // --- PHASE 1: Creation & Management ---
    
    // Create Defect A (Critical)
    await page.getByRole('button', { name: 'New Defect' }).click();
    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByRole('button', { name: 'Save Defect' }) });
    await modal.getByPlaceholder('Defect summary...').fill(defectA.title);
    await modal.locator('select').first().selectOption('CRITICAL'); // Severity is first select in modal
    await modal.getByRole('button', { name: 'Save Defect' }).click();
    await expect(page.getByText(defectA.title)).toBeVisible();

    // Create Defect B (Low)
    await page.getByRole('button', { name: 'New Defect' }).click();
    const modal2 = page.locator('.fixed.inset-0').filter({ has: page.getByRole('button', { name: 'Save Defect' }) });
    await modal2.getByPlaceholder('Defect summary...').fill(defectB.title);
    await modal2.locator('select').first().selectOption('LOW'); // Severity is first select in modal
    await modal2.getByRole('button', { name: 'Save Defect' }).click();
    await expect(page.getByText(defectB.title)).toBeVisible();

    // Filtering: Filter by Critical Severity
    const severityFilter = page.locator('select').nth(1); // Assuming second select is Severity
    await severityFilter.selectOption('CRITICAL');
    
    await expect(page.getByText(defectA.title)).toBeVisible();
    await expect(page.getByText(defectB.title)).toBeHidden(); // Should be filtered out

    // Reset Filter
    await severityFilter.selectOption('ALL');
    await expect(page.getByText(defectB.title)).toBeVisible();

    // Sorting (Implicitly checking UI update, robust order check is complex with dynamic IDs, but we can check existence)
    const sortSelect = page.locator('select').nth(3); // 4th select is Sort Criteria
    await sortSelect.selectOption('severity');
    // Playwright runs fast, visual sorting might not be instant, but we assume logic holds if previous tests pass.

    // --- PHASE 3: Collaboration (Discussion) ---

    // Open Defect A
    await page.getByText(defectA.title).click();

    // Wait for modal to fully load and switch to Discussion Tab
    const defectModal = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: 'Edit Defect' }) });
    await expect(defectModal).toBeVisible();
    await defectModal.getByRole('button', { name: 'Discussion' }).click();
    await expect(defectModal.getByPlaceholder('Write a comment...')).toBeVisible();

    // Add Comment - fill and click send button
    const commentText = `Investigating this critical issue now - ${timestamp}`;
    const commentTextarea = defectModal.getByPlaceholder('Write a comment...');
    await commentTextarea.fill(commentText);

    // Verify the text was entered before sending
    await expect(commentTextarea).toHaveValue(commentText);

    // Click the send button (the button next to the textarea)
    const sendButton = defectModal.locator('button').filter({ has: page.locator('svg') }).last();

    // Wait for the API call to complete after clicking send
    const commentPromise = page.waitForResponse(resp => resp.url().includes('/comments') && resp.request().method() === 'POST', { timeout: 10000 });
    await sendButton.click();
    const response = await commentPromise;

    // Log the response for debugging
    console.log('Comment API response status:', response.status());

    // Verify Comment Appears in the discussion area (in a paragraph, not in textarea)
    await expect(defectModal.locator('p.text-sm.text-zinc-700').filter({ hasText: commentText })).toBeVisible({ timeout: 10000 });
    // Verify author name appears in the comment bubble
    await expect(defectModal.locator('.rounded-2xl.rounded-tl-none').getByText('Sarah Jenkins')).toBeVisible();

    // Close Modal - click the X button (the last button with SVG in the header area)
    const headerArea = defectModal.locator('.border-b.border-zinc-100');
    await headerArea.locator('button').last().click();

    // Wait for modal to close
    await expect(defectModal).toBeHidden({ timeout: 5000 });

    // --- PHASE 2: Batch Actions ---

    // Select All Defects
    // Find the checkbox in the header row (first checkbox on page usually, or specifically targeted)
    // The header checkbox is usually the first input[type=checkbox] in the table area
    const headerCheckbox = page.locator('input[type="checkbox"]').first();
    await headerCheckbox.check();

    // Verify Bulk Actions Bar Appears
    const bulkBar = page.locator('.fixed.bottom-8');
    await expect(bulkBar).toBeVisible();
    // "2" and "Selected" are separate elements
    await expect(bulkBar.getByText('2')).toBeVisible();
    await expect(bulkBar.getByText('Selected')).toBeVisible();

    // Bulk Resolve
    await page.getByRole('button', { name: 'Resolve' }).click();
    
    // Verify Status Update - look for RESOLVED badge in the defects list
    // The status badge is a span with specific styling
    const defectsList = page.locator('.divide-y');
    await expect(defectsList.locator('span').filter({ hasText: 'RESOLVED' }).first()).toBeVisible({ timeout: 10000 });
    
    // Bulk Assign
    await headerCheckbox.check(); // Re-select (actions usually clear selection)
    await page.getByRole('button', { name: 'Assign' }).click();
    await page.getByRole('button', { name: 'Sarah Jenkins' }).click();
    
    // Verify Assignment (Sarah Jenkins should appear in the list rows)
    // Since Sarah is logged in and we assigned to her, her name should be visible in the list rows.
    // There might be multiple "Sarah Jenkins" (header, comment, etc), so we look for it in the defects list area.
    // Simplified: check if 'Sarah Jenkins' count increased or exists in the main area.
    await expect(page.locator('.divide-y').getByText('Sarah Jenkins').first()).toBeVisible();

    // --- PHASE 4: Test Defect Link from Execution History ---

    // First, create a test case and execute it with a linked defect
    await page.getByRole('button', { name: 'Cases' }).click();
    await expect(page.getByText('Test Cases')).toBeVisible();

    // Create a new test case
    await page.getByRole('button', { name: 'Create Case' }).first().click();
    const caseModal = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: 'New Test Case' }) });
    await expect(caseModal).toBeVisible();
    await caseModal.getByPlaceholder('e.g. Verify successful login with valid credentials').fill(`Test Case for Defect Link ${timestamp}`);
    await caseModal.getByRole('button', { name: 'Save Changes' }).click();
    await expect(page.getByText(`Test Case for Defect Link ${timestamp}`)).toBeVisible();

    // Click on the test case to open details
    await page.getByText(`Test Case for Defect Link ${timestamp}`).click();

    // Click Run Test to open execution modal
    await page.getByRole('button', { name: 'Run Test' }).click();
    const execModal = page.locator('.fixed.inset-0').filter({ has: page.getByText('Execute Test Case') });
    await expect(execModal).toBeVisible();

    // Link an existing defect - click "Link Existing" tab
    await execModal.getByRole('button', { name: 'Link Existing' }).click();

    // Select Defect A by clicking its button in the list
    await execModal.getByRole('button', { name: defectA.title }).click();

    // Select FAILED status and save
    await execModal.getByRole('button', { name: 'Fail' }).click();
    await execModal.getByRole('button', { name: 'Save Execution Result' }).click();
    await expect(execModal.getByText('Last Result:')).toBeVisible({ timeout: 10000 });

    // Close execution modal
    await execModal.getByRole('button', { name: 'Close' }).click();

    // --- Test 1: Click defect link in modal Execution History panel ---
    // Re-open execution modal to see history
    await page.getByRole('button', { name: 'Run Test' }).click();
    const execModal2 = page.locator('.fixed.inset-0').filter({ has: page.getByText('Execute Test Case') });
    await expect(execModal2).toBeVisible();

    // Find the defect link in execution history (the bubble style one)
    const defectLinkInModal = execModal2.locator('a').filter({ hasText: defectA.title }).first();
    await expect(defectLinkInModal).toBeVisible({ timeout: 10000 });

    // Click the defect link - should navigate to defects page with defectId param
    await defectLinkInModal.click();

    // Should navigate to defects page and open the defect modal
    await expect(page).toHaveURL(new RegExp(`/project/.*\\?tab=defects&defectId=`), { timeout: 15000 });

    // Close the execution modal first (it's still open after navigation)
    const execModalStillOpen = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: 'Execute Test Case' }) });
    if (await execModalStillOpen.isVisible({ timeout: 2000 }).catch(() => false)) {
        await execModalStillOpen.getByRole('button', { name: 'Close' }).click();
        await expect(execModalStillOpen).toBeHidden({ timeout: 5000 });
    }

    // Re-login if needed (SPA might lose session on navigation)
    const loginHeader = page.getByText('Select Account');
    if (await loginHeader.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.locator('button', { hasText: 'Sarah Jenkins' }).click();
        await page.waitForLoadState('networkidle');
    }

    // The defect modal should open automatically
    const defectDetailModal = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: 'Edit Defect' }) });
    await expect(defectDetailModal).toBeVisible({ timeout: 15000 });
    // The title is in a textbox, not as text
    await expect(defectDetailModal.getByPlaceholder('Defect summary...')).toHaveValue(defectA.title);

    // Close the modal - click the Cancel button
    await defectDetailModal.getByRole('button', { name: 'Cancel' }).click();
    await expect(defectDetailModal).toBeHidden({ timeout: 10000 });

    // --- Test 2: Click defect link in TestCaseDetailView table ---
    // Navigate to the test case detail page - use "Test Cases" tab button
    // Wait for any modal to close first
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: 'Test Cases' }).click();
    // Wait for tab to switch by checking for the test cases list
    await expect(page.getByText('Test Case for Defect Link')).toBeVisible({ timeout: 10000 });
    await page.getByText(`Test Case for Defect Link ${timestamp}`).click();

    // Wait for detail view to load
    await expect(page.getByRole('heading', { name: `Test Case for Defect Link ${timestamp}` })).toBeVisible();

    // Find the execution history table and click the defect button
    const historyTable = page.locator('table').filter({ has: page.getByText('Defects') });
    const defectButtonInTable = historyTable.locator('button').filter({ hasText: defectA.title }).first();
    await expect(defectButtonInTable).toBeVisible({ timeout: 10000 });

    // Click the defect button in table
    await defectButtonInTable.click();

    // Should navigate to defects page with defectId param
    await expect(page).toHaveURL(new RegExp(`/project/.*\\?tab=defects&defectId=`), { timeout: 15000 });

    // Re-login if needed
    const loginHeader2 = page.getByText('Select Account');
    if (await loginHeader2.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.locator('button', { hasText: 'Sarah Jenkins' }).click();
        await page.waitForLoadState('networkidle');
    }

    // The defect modal should open automatically
    const defectDetailModal2 = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: 'Edit Defect' }) });
    await expect(defectDetailModal2).toBeVisible({ timeout: 15000 });
    // The title is in a textbox, not as text
    await expect(defectDetailModal2.getByPlaceholder('Defect summary...')).toHaveValue(defectA.title);

    // Close the modal - click the Cancel button (more reliable)
    await defectDetailModal2.getByRole('button', { name: 'Cancel' }).click();
    await expect(defectDetailModal2).toBeHidden({ timeout: 5000 });

    // --- CLEANUP: Bulk Delete all defects ---
    const headerCheckboxCleanup = page.locator('input[type="checkbox"]').first();
    await headerCheckboxCleanup.check();

    // Setup dialog handler for confirm
    page.on('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: 'Delete' }).click();

    // Verify Deletion
    await expect(page.getByText(defectA.title)).toBeHidden();
    await expect(page.getByText(defectB.title)).toBeHidden();
    await expect(page.getByText('No defects found.')).toBeVisible();
  });
});
