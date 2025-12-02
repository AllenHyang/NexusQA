import { test, expect, Page } from '@playwright/test';

// Users in the system: Sarah Jenkins, John Doe
const PRIMARY_USER = 'Sarah Jenkins';
const SECONDARY_USER = 'John Doe';

// --- BDD Helpers ---

async function givenUserIsLoggedIn(page: Page, userName: string = PRIMARY_USER) {
  const loginHeader = page.getByText('Select Account');
  const dashboardOverviewHeader = page.getByRole('heading', { name: 'Overview' });

  // Check if we're already logged in (dashboard visible)
  if (await dashboardOverviewHeader.isVisible().catch(() => false)) return;

  // If we see login screen, click the user
  if (await loginHeader.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: new RegExp(userName) }).click();
    await page.waitForLoadState('networkidle');
    await dashboardOverviewHeader.waitFor({ state: 'visible', timeout: 30000 });
  }
}

async function givenUserIsOnProjectsPage(page: Page) {
  const projectsHeader = page.getByText('All Projects');
  if (await projectsHeader.isVisible().catch(() => false)) return;

  const projectsLink = page.getByText('Projects', { exact: true });
  await projectsLink.waitFor({ state: 'visible', timeout: 30000 });
  await projectsLink.click();
  await page.waitForLoadState('networkidle');
  await expect(projectsHeader).toBeVisible({ timeout: 10000 });
}

test.describe('@Mention and Notification', () => {
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

  test('Happy Path: @mention user shows popup and creates notification', async ({ page, request }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const projectName = `Mention Test ${timestamp}`;
    createdProjectName = projectName;
    const requirementTitle = `Test Requirement ${timestamp}`;

    // --- SETUP: Create Project and Requirement via API ---
    const projectRes = await request.post('/api/projects', {
      data: { name: projectName, description: 'Test project for mentions' }
    });
    const project = await projectRes.json();

    // Get users
    const usersRes = await request.get('/api/users');
    const users = await usersRes.json();
    const sarahUser = users.find((u: { name: string }) => u.name === PRIMARY_USER);
    const johnUser = users.find((u: { name: string }) => u.name === SECONDARY_USER);

    expect(sarahUser).toBeDefined();
    expect(johnUser).toBeDefined();

    // Create requirement
    const reqRes = await request.post('/api/requirements', {
      data: {
        projectId: project.id,
        title: requirementTitle,
        authorId: sarahUser.id,
        status: 'DRAFT',
        priority: 'P2'
      }
    });
    const requirement = await reqRes.json();

    // --- Test @mention popup in UI ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsLoggedIn(page, PRIMARY_USER);
    await givenUserIsOnProjectsPage(page);

    // Open project
    await page.getByRole('heading', { name: projectName }).click();
    await page.waitForLoadState('networkidle');

    // Navigate to Requirements Tab
    await page.getByRole('button', { name: 'Requirements' }).click();
    await expect(page.getByText('需求管理')).toBeVisible({ timeout: 10000 });

    // Open requirement
    await page.getByText(requirementTitle).click();
    await page.waitForTimeout(1000);

    // Find the textarea
    const commentInput = page.locator('textarea').first();
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    await commentInput.click();
    await commentInput.fill('@');

    // Wait for popup to appear
    await page.waitForTimeout(500);

    // The mention popup should appear with users
    const mentionPopup = page.locator('.absolute.z-50.bg-white.border.rounded-xl');
    await expect(mentionPopup).toBeVisible({ timeout: 5000 });

    // Should see John Doe in the list
    await expect(mentionPopup.getByText(SECONDARY_USER)).toBeVisible({ timeout: 3000 });

    // Click to select John Doe
    await mentionPopup.getByText(SECONDARY_USER).click();

    // Wait for popup to close
    await expect(mentionPopup).not.toBeVisible({ timeout: 3000 });

    // Verify the mention was inserted
    await expect(commentInput).toHaveValue(new RegExp(`@${SECONDARY_USER}`));

    // --- Create comment via API to test notification creation ---
    const commentRes = await request.post(`/api/requirements/${requirement.id}/comments`, {
      data: {
        content: `@${SECONDARY_USER} please review this requirement`,
        userId: sarahUser.id,
        topic: 'BASIC_INFO'
      }
    });
    expect(commentRes.status()).toBe(201);

    // --- Verify notification was created for John Doe ---
    const notifRes = await request.get(`/api/notifications/unread-count?userId=${johnUser.id}`);
    const notifData = await notifRes.json();
    expect(notifData.count).toBeGreaterThan(0);

    // Get notification details
    const notifListRes = await request.get(`/api/notifications?userId=${johnUser.id}&limit=5`);
    const notifListData = await notifListRes.json();
    const mentionNotif = notifListData.notifications.find((n: { type: string; requirementId: string }) =>
      n.type === 'MENTION' && n.requirementId === requirement.id
    );
    expect(mentionNotif).toBeDefined();
    expect(mentionNotif.content).toContain(PRIMARY_USER);
    expect(mentionNotif.content).toContain('提到了你');
  });

  test('Happy Path: Notification bell shows unread count and dropdown', async ({ page, request }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const projectName = `NotifBell Test ${timestamp}`;
    createdProjectName = projectName;

    // --- SETUP ---
    const projectRes = await request.post('/api/projects', {
      data: { name: projectName, description: 'Test project' }
    });
    const project = await projectRes.json();

    const usersRes = await request.get('/api/users');
    const users = await usersRes.json();
    const sarahUser = users.find((u: { name: string }) => u.name === PRIMARY_USER);
    const johnUser = users.find((u: { name: string }) => u.name === SECONDARY_USER);

    expect(sarahUser).toBeDefined();
    expect(johnUser).toBeDefined();

    const reqRes = await request.post('/api/requirements', {
      data: {
        projectId: project.id,
        title: `Notif Test Req ${timestamp}`,
        authorId: johnUser.id,
        status: 'DRAFT',
        priority: 'P2'
      }
    });
    const requirement = await reqRes.json();

    // Create a notification for Sarah (John mentions Sarah)
    await request.post(`/api/requirements/${requirement.id}/comments`, {
      data: {
        content: `@${PRIMARY_USER} can you check this?`,
        userId: johnUser.id,
        topic: 'BASIC_INFO'
      }
    });

    // --- Login as Sarah Jenkins ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsLoggedIn(page, PRIMARY_USER);

    // Wait for the notification bell to be visible in the header
    const notificationBell = page.locator('button[title="Notifications"]');
    await expect(notificationBell).toBeVisible({ timeout: 10000 });

    // Check for unread badge
    const unreadBadge = notificationBell.locator('span.bg-red-500');
    await expect(unreadBadge).toBeVisible({ timeout: 10000 });

    // Click the bell to open dropdown
    await notificationBell.click();

    // Verify dropdown is visible
    const dropdown = page.locator('.absolute.right-0.mt-2.w-80');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Verify notification header (use exact match to avoid matching "暂无通知")
    await expect(dropdown.getByRole('heading', { name: '通知' })).toBeVisible();

    // Verify the notification from John is shown (use .first() to avoid strict mode violation)
    await expect(dropdown.getByText(SECONDARY_USER).first()).toBeVisible({ timeout: 5000 });
    await expect(dropdown.getByText(/提到了你/).first()).toBeVisible();

    // Click the notification
    await dropdown.locator('button').filter({ hasText: SECONDARY_USER }).first().click();

    // Dropdown should close
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
  });

  test('Happy Path: Mark all notifications as read', async ({ page, request }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const projectName = `MarkRead Test ${timestamp}`;
    createdProjectName = projectName;

    // --- SETUP ---
    const projectRes = await request.post('/api/projects', {
      data: { name: projectName, description: 'Test project' }
    });
    const project = await projectRes.json();

    const usersRes = await request.get('/api/users');
    const users = await usersRes.json();
    const sarahUser = users.find((u: { name: string }) => u.name === PRIMARY_USER);
    const johnUser = users.find((u: { name: string }) => u.name === SECONDARY_USER);

    expect(sarahUser).toBeDefined();
    expect(johnUser).toBeDefined();

    const reqRes = await request.post('/api/requirements', {
      data: {
        projectId: project.id,
        title: `MarkRead Req ${timestamp}`,
        authorId: johnUser.id,
        status: 'DRAFT',
        priority: 'P2'
      }
    });
    const requirement = await reqRes.json();

    // Create notification for Sarah
    await request.post(`/api/requirements/${requirement.id}/comments`, {
      data: {
        content: `@${PRIMARY_USER} please review`,
        userId: johnUser.id,
        topic: 'BASIC_INFO'
      }
    });

    // --- Login as Sarah ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsLoggedIn(page, PRIMARY_USER);

    // Open notification dropdown
    const notificationBell = page.locator('button[title="Notifications"]');
    await expect(notificationBell).toBeVisible({ timeout: 10000 });
    await notificationBell.click();

    const dropdown = page.locator('.absolute.right-0.mt-2.w-80');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Click "全部已读" button
    const markAllReadBtn = dropdown.getByText('全部已读');
    if (await markAllReadBtn.isVisible()) {
      const markReadPromise = page.waitForResponse(resp =>
        resp.url().includes('/notifications/read-all') && resp.request().method() === 'PUT'
      );
      await markAllReadBtn.click();
      await markReadPromise;

      // Wait a moment for UI update
      await page.waitForTimeout(500);

      // Unread badge should disappear
      const unreadBadge = notificationBell.locator('span.bg-red-500');
      await expect(unreadBadge).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('Happy Path: @mention with keyboard navigation', async ({ page, request }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const projectName = `Keyboard Nav ${timestamp}`;
    createdProjectName = projectName;
    const requirementTitle = `Keyboard Test ${timestamp}`;

    // --- SETUP ---
    const projectRes = await request.post('/api/projects', {
      data: { name: projectName, description: 'Test project' }
    });
    const project = await projectRes.json();

    const usersRes = await request.get('/api/users');
    const users = await usersRes.json();
    const sarahUser = users.find((u: { name: string }) => u.name === PRIMARY_USER);

    await request.post('/api/requirements', {
      data: {
        projectId: project.id,
        title: requirementTitle,
        authorId: sarahUser.id,
        status: 'DRAFT',
        priority: 'P2'
      }
    });

    // --- Login and navigate ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsLoggedIn(page, PRIMARY_USER);
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

    // --- Test keyboard navigation ---
    const commentInput = detailModal.locator('textarea').first();
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    await commentInput.click();
    await commentInput.fill('@');

    // Wait for popup
    await page.waitForTimeout(500);
    const mentionPopup = page.locator('.absolute.z-50.bg-white.border.rounded-xl');
    await expect(mentionPopup).toBeVisible({ timeout: 5000 });

    // Use arrow down to navigate
    await commentInput.press('ArrowDown');
    await page.waitForTimeout(200);

    // Press Enter to select
    await commentInput.press('Enter');

    // Verify a user was selected (input should have @username)
    const inputValue = await commentInput.inputValue();
    expect(inputValue).toMatch(/@\w+/);

    // Popup should close
    await expect(mentionPopup).not.toBeVisible({ timeout: 3000 });
  });

  test('Happy Path: Filter users while typing @mention', async ({ page, request }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const projectName = `Filter Test ${timestamp}`;
    createdProjectName = projectName;
    const requirementTitle = `Filter Req ${timestamp}`;

    // --- SETUP ---
    const projectRes = await request.post('/api/projects', {
      data: { name: projectName, description: 'Test project' }
    });
    const project = await projectRes.json();

    const usersRes = await request.get('/api/users');
    const users = await usersRes.json();
    const sarahUser = users.find((u: { name: string }) => u.name === PRIMARY_USER);

    await request.post('/api/requirements', {
      data: {
        projectId: project.id,
        title: requirementTitle,
        authorId: sarahUser.id,
        status: 'DRAFT',
        priority: 'P2'
      }
    });

    // --- Login and navigate ---
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await givenUserIsLoggedIn(page, PRIMARY_USER);
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

    // --- Test filtering ---
    const commentInput = detailModal.locator('textarea').first();
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    await commentInput.click();
    await commentInput.fill('@Jo'); // Type partial name to match "John Doe"

    await page.waitForTimeout(500);
    const mentionPopup = page.locator('.absolute.z-50.bg-white.border.rounded-xl');
    await expect(mentionPopup).toBeVisible({ timeout: 5000 });

    // John Doe should be visible (matches "Jo")
    await expect(mentionPopup.getByText(SECONDARY_USER)).toBeVisible({ timeout: 3000 });

    // Sarah Jenkins should NOT be visible (doesn't match "Jo")
    await expect(mentionPopup.getByText(PRIMARY_USER)).not.toBeVisible();
  });
});
