import { test, expect } from '@playwright/test';

test.describe('Kanban Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByText('Sarah Jenkins').click();
    await page.waitForLoadState('networkidle');

    // Navigate to NexusQA project - use first() to avoid strict mode violation
    await page.getByText('NexusQA 产品开发').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('should switch to kanban view and display columns', async ({ page }) => {
    // Click kanban view button
    await page.locator('button:has-text("看板")').click();
    await page.waitForTimeout(500);

    // Verify kanban view is displayed
    await expect(page.locator('text=看板视图')).toBeVisible();

    // Verify group mode buttons are visible (use exact match)
    await expect(page.getByRole('button', { name: '状态', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '负责人', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '优先级', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '验收状态', exact: true })).toBeVisible();
  });

  test('should display status columns correctly', async ({ page }) => {
    // Switch to kanban view
    await page.locator('button:has-text("看板")').click();
    await page.waitForTimeout(500);

    // Verify status columns are present (use first() to avoid strict mode)
    await expect(page.getByText('草稿').first()).toBeVisible();
    await expect(page.getByText('待评审').first()).toBeVisible();
    await expect(page.getByText('已批准').first()).toBeVisible();
    await expect(page.getByText('进行中').first()).toBeVisible();
    await expect(page.getByText('已完成').first()).toBeVisible();
  });

  test('should switch to owner grouping mode', async ({ page }) => {
    // Switch to kanban view
    await page.locator('button:has-text("看板")').click();
    await page.waitForTimeout(500);

    // Click owner group mode
    await page.getByRole('button', { name: '负责人', exact: true }).click();
    await page.waitForTimeout(500);

    // Verify owner columns are present
    await expect(page.locator('text=未分配')).toBeVisible();
    // Sarah Jenkins should be visible somewhere in the kanban
    await expect(page.getByText('Sarah Jenkins').first()).toBeVisible();
  });

  test('should drag card between status columns', async ({ page }) => {
    // Switch to kanban view
    await page.locator('button:has-text("看板")').click();
    await page.waitForTimeout(1000);

    // Scroll down to see the kanban columns
    await page.locator('text=看板视图').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Wait for kanban cards to be visible
    const cards = page.locator('[draggable="true"]');
    await cards.first().waitFor({ state: 'visible', timeout: 10000 });

    const cardCount = await cards.count();
    console.log(`Found ${cardCount} draggable cards`);

    if (cardCount === 0) {
      test.skip(true, 'No draggable cards found');
      return;
    }

    // Take screenshot before drag
    await page.screenshot({ path: '/tmp/kanban-before-drag.png' });

    // Get the first card
    const firstCard = cards.first();

    // Find the target column header "进行中" and scroll to it
    const targetColumnHeader = page.locator('text=进行中').first();
    await targetColumnHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Perform drag and drop to the column area
    const targetColumn = targetColumnHeader.locator('..').locator('..');
    await firstCard.dragTo(targetColumn, { force: true });

    await page.waitForTimeout(1000);

    // Take screenshot after drag
    await page.screenshot({ path: '/tmp/kanban-after-drag.png' });
  });

  test('should drag card between owner columns', async ({ page }) => {
    // Switch to kanban view
    await page.locator('button:has-text("看板")').click();
    await page.waitForTimeout(500);

    // Switch to owner grouping
    await page.getByRole('button', { name: '负责人', exact: true }).click();
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: '/tmp/kanban-owner-view.png' });

    // Find draggable cards
    const cards = page.locator('[draggable="true"]');
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} draggable cards in owner view`);

    if (cardCount === 0) {
      test.skip(true, 'No draggable cards found');
      return;
    }

    // Get a card from Sarah Jenkins column
    const firstCard = cards.first();

    // Try to drag to "未分配" column
    const unassignedColumn = page.locator('text=未分配').locator('..').locator('..');

    await firstCard.dragTo(unassignedColumn, { force: true });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/tmp/kanban-owner-after-drag.png' });
  });

  test('API: should update requirement status via PATCH', async ({ request }) => {
    // First, get a requirement ID
    const listResponse = await request.get('/api/requirements?projectId=cmilyp7up00005on9ky79r2hd');
    expect(listResponse.ok()).toBeTruthy();

    const requirements = await listResponse.json();
    expect(requirements.length).toBeGreaterThan(0);

    const reqId = requirements[0].id;
    const originalStatus = requirements[0].status;
    const newStatus = originalStatus === 'DRAFT' ? 'IN_PROGRESS' : 'DRAFT';

    console.log(`Testing status update for ${reqId}: ${originalStatus} -> ${newStatus}`);

    // Update status via PATCH
    const patchResponse = await request.patch(`/api/requirements/${reqId}`, {
      data: { status: newStatus }
    });

    expect(patchResponse.ok()).toBeTruthy();
    const updated = await patchResponse.json();
    expect(updated.status).toBe(newStatus);

    // Restore original status
    await request.patch(`/api/requirements/${reqId}`, {
      data: { status: originalStatus }
    });
  });

  test('API: should update requirement owner via PATCH', async ({ request }) => {
    // First, get a requirement ID and users
    const [listResponse, usersResponse] = await Promise.all([
      request.get('/api/requirements?projectId=cmilyp7up00005on9ky79r2hd'),
      request.get('/api/users')
    ]);

    expect(listResponse.ok()).toBeTruthy();
    expect(usersResponse.ok()).toBeTruthy();

    const requirements = await listResponse.json();
    const users = await usersResponse.json();

    expect(requirements.length).toBeGreaterThan(0);
    expect(users.length).toBeGreaterThan(0);

    const reqId = requirements[0].id;
    const originalOwnerId = requirements[0].ownerId;
    const newOwnerId = originalOwnerId ? null : users[0].id;

    console.log(`Testing owner update for ${reqId}: ${originalOwnerId} -> ${newOwnerId}`);

    // Update owner via PATCH
    const patchResponse = await request.patch(`/api/requirements/${reqId}`, {
      data: { ownerId: newOwnerId }
    });

    expect(patchResponse.ok()).toBeTruthy();
    const updated = await patchResponse.json();
    expect(updated.ownerId).toBe(newOwnerId);

    // Restore original owner
    await request.patch(`/api/requirements/${reqId}`, {
      data: { ownerId: originalOwnerId }
    });
  });

  test('should verify drag hint is visible', async ({ page }) => {
    // Switch to kanban view
    await page.locator('button:has-text("看板")').click();
    await page.waitForTimeout(500);

    // Check for drag hint in status mode
    await expect(page.locator('text=拖拽卡片可快速更改状态')).toBeVisible();

    // Switch to owner mode
    await page.getByRole('button', { name: '负责人', exact: true }).click();
    await page.waitForTimeout(500);

    // Check for drag hint in owner mode
    await expect(page.locator('text=拖拽卡片可快速更改负责人')).toBeVisible();

    // Switch to priority mode (no drag)
    await page.getByRole('button', { name: '优先级', exact: true }).click();
    await page.waitForTimeout(500);

    // Drag hint should NOT be visible in priority mode
    await expect(page.locator('text=拖拽卡片可快速更改')).not.toBeVisible();
  });
});
