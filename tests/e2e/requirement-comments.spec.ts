import { test, expect, Page } from '@playwright/test';

// --- BDD Helpers ---

async function givenUserIsLoggedIn(page: Page) {
  const loginHeader = page.getByText('Select Account');
  const dashboardOverviewHeader = page.getByRole('heading', { name: 'Overview' });

  // Check if we're already logged in (dashboard visible)
  if (await dashboardOverviewHeader.isVisible().catch(() => false)) return;

  // If we see login screen, click Sarah Jenkins
  if (await loginHeader.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /Sarah Jenkins/ }).click();
    await page.waitForLoadState('networkidle');
    await dashboardOverviewHeader.waitFor({ state: 'visible', timeout: 30000 });
  }
}

async function givenUserIsOnProjectsPage(page: Page) {
  await givenUserIsLoggedIn(page);
  const projectsHeader = page.getByText('All Projects');
  if (await projectsHeader.isVisible().catch(() => false)) return;

  const projectsLink = page.getByText('Projects', { exact: true });
  await projectsLink.waitFor({ state: 'visible', timeout: 30000 });
  await projectsLink.click();
  await page.waitForLoadState('networkidle');
  await expect(projectsHeader).toBeVisible({ timeout: 10000 });
}

test.describe('Requirement Comments', () => {
  let createdProjectName: string | null = null;

  test.afterEach(async ({ request }) => {
    if (createdProjectName) {
      const listRes = await request.get('/api/projects');
      if (listRes.ok()) {
        const projects = await listRes.json();
        const projectsToDelete = projects.filter((p: { name: string; id: string }) =>
          p.name.startsWith(createdProjectName as string)
        );
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

  test('Happy Path: Add comment to requirement and verify it displays', async ({ page }) => {
    test.setTimeout(90000);
    const timestamp = Date.now();
    const projectName = `Comment Test ${timestamp}`;
    createdProjectName = projectName;
    const requirementTitle = `Test Requirement ${timestamp}`;
    const commentText = `This is a test comment ${timestamp}`;

    // --- SETUP: Create Project via API for speed ---
    const projectRes = await page.request.post('/api/projects', {
      data: { name: projectName, description: 'Test project for comments' }
    });
    const project = await projectRes.json();

    // Get current user (Sarah Jenkins)
    const usersRes = await page.request.get('/api/users');
    const users = await usersRes.json();
    const currentUser = users.find((u: { name: string }) => u.name === 'Sarah Jenkins');

    // Create requirement via API
    await page.request.post('/api/requirements', {
      data: {
        projectId: project.id,
        title: requirementTitle,
        authorId: currentUser.id,
        status: 'DRAFT',
        priority: 'P2'
      }
    });

    // --- Navigate to requirement ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsOnProjectsPage(page);

    // Open project
    await page.getByRole('heading', { name: projectName }).click();
    await page.waitForLoadState('networkidle');

    // Navigate to Requirements Tab
    await page.getByRole('button', { name: 'Requirements' }).click();
    await expect(page.getByText('需求管理')).toBeVisible({ timeout: 10000 });

    // --- Open requirement (stays on Basic Info tab which now includes discussion) ---
    await page.getByText(requirementTitle).click();

    // Wait for requirement modal to open (use level: 3 for h3)
    const detailModal = page.locator('.fixed.inset-0').filter({
      has: page.getByRole('heading', { level: 3 })
    });
    await expect(detailModal).toBeVisible({ timeout: 10000 });

    // Discussion is now embedded in Basic Info tab - scroll to find it
    // Wait for the discussion section to load
    await expect(detailModal.getByText('需求讨论')).toBeVisible({ timeout: 5000 });

    // --- Verify empty state ---
    await expect(detailModal.getByText('No comments yet')).toBeVisible({ timeout: 5000 });

    // --- Add a comment ---
    const commentInput = detailModal.getByPlaceholder('Add a comment...');
    await commentInput.fill(commentText);

    // Click send button (the button next to the textarea with bg-zinc-900)
    const sendButton = detailModal.locator('button.bg-zinc-900').filter({ hasText: '' }).last();
    const commentPromise = page.waitForResponse(resp =>
      resp.url().includes('/comments') && resp.status() === 201
    );
    await sendButton.click();
    await commentPromise;

    // --- Verify comment is displayed ---
    await expect(detailModal.getByText(commentText)).toBeVisible({ timeout: 5000 });

    // Verify user name is shown (Sarah Jenkins)
    await expect(detailModal.getByText('Sarah Jenkins')).toBeVisible();

    // Verify comment count updated (now shows as "需求讨论 (1)")
    await expect(detailModal.getByText(/需求讨论.*\(1\)/)).toBeVisible();
  });

  test('Happy Path: Edit own comment', async ({ page }) => {
    test.setTimeout(90000);
    const timestamp = Date.now();
    const projectName = `Edit Comment ${timestamp}`;
    createdProjectName = projectName;
    const requirementTitle = `Editable Req ${timestamp}`;
    const originalComment = `Original comment ${timestamp}`;
    const editedComment = `Edited comment ${timestamp}`;

    // --- Quick Setup: Create Project and Requirement via API ---
    const projectRes = await page.request.post('/api/projects', {
      data: { name: projectName, description: 'Test project' }
    });
    const project = await projectRes.json();

    // Get current user (Sarah Jenkins)
    const usersRes = await page.request.get('/api/users');
    const users = await usersRes.json();
    const currentUser = users.find((u: { name: string }) => u.name === 'Sarah Jenkins');

    // Create requirement
    const reqRes = await page.request.post('/api/requirements', {
      data: {
        projectId: project.id,
        title: requirementTitle,
        authorId: currentUser.id,
        status: 'DRAFT',
        priority: 'P2'
      }
    });
    const requirement = await reqRes.json();

    // Add a comment with topic
    await page.request.post(`/api/requirements/${requirement.id}/comments`, {
      data: {
        content: originalComment,
        userId: currentUser.id,
        topic: 'BASIC_INFO'
      }
    });

    // --- Navigate to requirement ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsOnProjectsPage(page);

    // Open project
    await page.getByRole('heading', { name: projectName }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Requirements' }).click();
    await expect(page.getByText('需求管理')).toBeVisible({ timeout: 10000 });

    // Open requirement (Basic Info tab now has discussion embedded)
    await page.getByText(requirementTitle).click();
    const detailModal = page.locator('.fixed.inset-0').filter({
      has: page.getByRole('heading', { level: 3 })
    });
    await expect(detailModal).toBeVisible({ timeout: 10000 });

    // Discussion is now in Basic Info tab
    await expect(detailModal.getByText(originalComment)).toBeVisible({ timeout: 5000 });

    // --- Edit the comment ---
    // Click edit button (pencil icon)
    const editButton = detailModal.locator('button[title="Edit"]');
    await editButton.click();

    // Wait for edit mode to be active (textarea appears in the comment area)
    const commentArea = detailModal.locator('.p-3.bg-zinc-50');
    const editTextarea = commentArea.locator('textarea').first();
    await expect(editTextarea).toBeVisible({ timeout: 5000 });

    // Fill new content in textarea
    await editTextarea.clear();
    await editTextarea.fill(editedComment);

    // Click save button within the comment area
    const saveButton = commentArea.getByRole('button', { name: 'Save' });
    const updatePromise = page.waitForResponse(resp =>
      resp.url().includes('/comments/') && resp.request().method() === 'PUT'
    );
    await saveButton.click();
    await updatePromise;

    // Wait a moment for the UI to update
    await page.waitForTimeout(500);

    // --- Verify edited comment ---
    await expect(detailModal.getByText(editedComment)).toBeVisible({ timeout: 5000 });
    await expect(detailModal.getByText(originalComment)).toBeHidden({ timeout: 5000 });
    await expect(detailModal.getByText('(edited)')).toBeVisible();
  });

  test('Happy Path: Delete own comment', async ({ page }) => {
    test.setTimeout(90000);
    const timestamp = Date.now();
    const projectName = `Delete Comment ${timestamp}`;
    createdProjectName = projectName;
    const requirementTitle = `Deletable Req ${timestamp}`;
    const commentToDelete = `Comment to delete ${timestamp}`;

    // --- Quick Setup via API ---
    const projectRes = await page.request.post('/api/projects', {
      data: { name: projectName, description: 'Test project' }
    });
    const project = await projectRes.json();

    const usersRes = await page.request.get('/api/users');
    const users = await usersRes.json();
    const currentUser = users.find((u: { name: string }) => u.name === 'Sarah Jenkins');

    const reqRes = await page.request.post('/api/requirements', {
      data: {
        projectId: project.id,
        title: requirementTitle,
        authorId: currentUser.id,
        status: 'DRAFT',
        priority: 'P2'
      }
    });
    const requirement = await reqRes.json();

    await page.request.post(`/api/requirements/${requirement.id}/comments`, {
      data: {
        content: commentToDelete,
        userId: currentUser.id,
        topic: 'BASIC_INFO'
      }
    });

    // --- Navigate to requirement ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsOnProjectsPage(page);

    await page.getByRole('heading', { name: projectName }).click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Requirements' }).click();
    await expect(page.getByText('需求管理')).toBeVisible({ timeout: 10000 });

    await page.getByText(requirementTitle).click();
    const detailModal = page.locator('.fixed.inset-0').filter({
      has: page.getByRole('heading', { level: 3 })
    });
    await expect(detailModal).toBeVisible({ timeout: 10000 });

    // Discussion is now embedded in Basic Info tab
    await expect(detailModal.getByText(commentToDelete)).toBeVisible({ timeout: 5000 });
    await expect(detailModal.getByText(/需求讨论.*\(1\)/)).toBeVisible();

    // --- Delete the comment ---
    // Accept the confirm dialog
    page.on('dialog', dialog => dialog.accept());

    const deleteButton = detailModal.locator('button[title="Delete"]');
    const deletePromise = page.waitForResponse(resp =>
      resp.url().includes('/comments/') && resp.request().method() === 'DELETE'
    );
    await deleteButton.click();
    await deletePromise;

    // --- Verify comment is deleted ---
    await expect(detailModal.getByText(commentToDelete)).not.toBeVisible({ timeout: 5000 });
    await expect(detailModal.getByText('No comments yet')).toBeVisible();
    await expect(detailModal.getByText(/需求讨论.*\(0\)/)).toBeVisible();
  });
});
