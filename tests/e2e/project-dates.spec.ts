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

    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    await expect(projectsHeader).toBeVisible();
}

test.describe('Project Date Fields (startDate & dueDate)', () => {

  let createdProjectId: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdProjectId) {
      console.log(`Cleaning up project: ${createdProjectId}`);
      await request.delete(`/api/projects?id=${createdProjectId}`);
      createdProjectId = null;
    }
  });

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`PAGE CONSOLE [${msg.type()}]: ${msg.text()}`));
    page.on('pageerror', error => console.error(`PAGE ERROR: ${error.message}`));

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsOnProjectsPage(page);
  });

  test('API: should create project with startDate and dueDate', async ({ request }) => {
    const timestamp = Date.now();
    const projectData = {
      name: `API Date Test ${timestamp}`,
      description: 'Testing date fields via API',
      startDate: '2025-01-01',
      dueDate: '2025-12-31',
    };

    // Create project with dates
    const createRes = await request.post('/api/projects', {
      data: projectData,
    });
    expect(createRes.status()).toBe(201);

    const created = await createRes.json();
    createdProjectId = created.id;

    // Verify dates are returned
    expect(created.startDate).toBeTruthy();
    expect(created.dueDate).toBeTruthy();

    // Verify dates match (comparing date portion only)
    const startDate = new Date(created.startDate);
    const dueDate = new Date(created.dueDate);
    expect(startDate.getFullYear()).toBe(2025);
    expect(startDate.getMonth()).toBe(0); // January
    expect(startDate.getDate()).toBe(1);
    expect(dueDate.getFullYear()).toBe(2025);
    expect(dueDate.getMonth()).toBe(11); // December
    expect(dueDate.getDate()).toBe(31);
  });

  test('API: should update project with new startDate and dueDate', async ({ request }) => {
    const timestamp = Date.now();

    // First create a project without dates
    const createRes = await request.post('/api/projects', {
      data: {
        name: `API Update Date Test ${timestamp}`,
        description: 'Testing date update via API',
      },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    createdProjectId = created.id;

    // Verify initially no dates
    expect(created.startDate).toBeNull();
    expect(created.dueDate).toBeNull();

    // Update with dates
    const updateRes = await request.put('/api/projects', {
      data: {
        id: created.id,
        name: created.name,
        startDate: '2025-06-01',
        dueDate: '2025-06-30',
      },
    });
    expect(updateRes.status()).toBe(200);

    const updated = await updateRes.json();

    // Verify dates are now set
    expect(updated.startDate).toBeTruthy();
    expect(updated.dueDate).toBeTruthy();

    const startDate = new Date(updated.startDate);
    const dueDate = new Date(updated.dueDate);
    expect(startDate.getMonth()).toBe(5); // June
    expect(dueDate.getMonth()).toBe(5); // June
  });

  test('API: should clear dates when set to null', async ({ request }) => {
    const timestamp = Date.now();

    // Create project with dates
    const createRes = await request.post('/api/projects', {
      data: {
        name: `API Clear Date Test ${timestamp}`,
        startDate: '2025-03-15',
        dueDate: '2025-09-15',
      },
    });
    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    createdProjectId = created.id;

    // Verify dates are set
    expect(created.startDate).toBeTruthy();
    expect(created.dueDate).toBeTruthy();

    // Clear dates
    const updateRes = await request.put('/api/projects', {
      data: {
        id: created.id,
        name: created.name,
        startDate: null,
        dueDate: null,
      },
    });
    expect(updateRes.status()).toBe(200);

    const updated = await updateRes.json();

    // Verify dates are cleared
    expect(updated.startDate).toBeNull();
    expect(updated.dueDate).toBeNull();
  });

  test('UI: should create project with dates via modal', async ({ page }) => {
    const timestamp = Date.now();
    const projectName = `UI Date Test ${timestamp}`;

    // Open create modal
    await page.getByRole('button', { name: 'New Project' }).click();
    await expect(page.getByText('Create New Project')).toBeVisible();

    // Fill basic fields
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);

    // Fill date fields
    const startDateInput = page.locator('input[type="date"]').first();
    const dueDateInput = page.locator('input[type="date"]').last();

    await startDateInput.fill('2025-02-01');
    await dueDateInput.fill('2025-11-30');

    // Create project and capture response
    const createResponsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/projects') && resp.status() === 201
    );
    await page.getByRole('button', { name: 'Create Project' }).click();
    const response = await createResponsePromise;
    const created = await response.json();

    // Store for cleanup
    createdProjectId = created.id;

    // Verify project card is visible
    await expect(page.getByRole('heading', { name: projectName })).toBeVisible({ timeout: 10000 });

    // Verify dates were saved via API
    const startDate = new Date(created.startDate);
    const dueDate = new Date(created.dueDate);
    expect(startDate.getFullYear()).toBe(2025);
    expect(startDate.getMonth()).toBe(1); // February
    expect(dueDate.getMonth()).toBe(10); // November
  });

  test('UI: should edit project dates via modal', async ({ page, request }) => {
    const timestamp = Date.now();
    const projectName = `UI Edit Date Test ${timestamp}`;

    // Create project via API first
    const createRes = await request.post('/api/projects', {
      data: {
        name: projectName,
        description: 'Testing date edit via UI',
      },
    });
    const created = await createRes.json();
    createdProjectId = created.id;

    // Refresh to see the new project
    await page.reload();
    await page.waitForLoadState('networkidle');
    await givenUserIsOnProjectsPage(page);

    // Find and edit the project
    const projectCard = page.locator('div.group', { hasText: projectName }).first();
    await projectCard.hover();
    await projectCard.getByRole('button', { name: 'Edit Project' }).click({ force: true });
    await expect(page.getByText('Edit Project')).toBeVisible();

    // Fill date fields
    const startDateInput = page.locator('input[type="date"]').first();
    const dueDateInput = page.locator('input[type="date"]').last();

    await startDateInput.fill('2025-04-01');
    await dueDateInput.fill('2025-08-31');

    // Save changes
    const updateResponsePromise = page.waitForResponse(
      resp => resp.url().includes('/api/projects') && resp.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Save Changes' }).click();
    const response = await updateResponsePromise;
    expect(response.status()).toBe(200);

    const updated = await response.json();

    // Verify dates were updated
    const startDate = new Date(updated.startDate);
    const dueDate = new Date(updated.dueDate);
    expect(startDate.getMonth()).toBe(3); // April
    expect(dueDate.getMonth()).toBe(7); // August
  });

  test('UI: should persist dates after edit and reload', async ({ page, request }) => {
    const timestamp = Date.now();
    const projectName = `UI Persist Date Test ${timestamp}`;

    // Create project with dates via API
    const createRes = await request.post('/api/projects', {
      data: {
        name: projectName,
        startDate: '2025-05-15',
        dueDate: '2025-10-15',
      },
    });
    const created = await createRes.json();
    createdProjectId = created.id;

    // Refresh to see the project
    await page.reload();
    await page.waitForLoadState('networkidle');
    await givenUserIsOnProjectsPage(page);

    // Wait for the project card to be visible (data loaded from API)
    const projectCard = page.locator('div.group', { hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 15000 });

    // Open edit modal
    await projectCard.hover();
    await projectCard.getByRole('button', { name: 'Edit Project' }).click({ force: true });
    await expect(page.getByText('Edit Project')).toBeVisible();

    // Wait for the modal to load with data
    await page.waitForTimeout(500);

    // Verify dates are populated in the form
    const startDateInput = page.locator('input[type="date"]').first();
    const dueDateInput = page.locator('input[type="date"]').last();

    // Check that the date inputs have the expected values
    const startValue = await startDateInput.inputValue();
    const dueValue = await dueDateInput.inputValue();

    expect(startValue).toBe('2025-05-15');
    expect(dueValue).toBe('2025-10-15');
  });
});
