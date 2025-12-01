import { test, expect, Page } from '@playwright/test';

// --- BDD Helpers ---

async function givenUserIsLoggedIn(page: Page) {
    const loginHeader = page.getByText('Select Account');
    const dashboardOverviewHeader = page.getByRole('heading', { name: 'Overview' });

    if (await dashboardOverviewHeader.isVisible().catch(() => false)) return;

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

test.describe('AI Duplicate Check for Test Case Suggestions', () => {
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

  test('AI Duplicate Check: Should detect duplicate test case suggestions', async ({ page, request }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const projectName = `AI Duplicate Check Suite ${timestamp}`;
    createdProjectName = projectName;

    // --- SETUP: Create Project ---
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    const projectResponse = await createProjectPromise;
    const project = await projectResponse.json();
    const projectId = project.id;

    // Navigate to project
    await page.getByRole('heading', { name: projectName }).click();

    // --- SETUP: Create existing test cases that will be "duplicates" ---
    const existingTestCases = [
      { title: '用户登录成功测试', description: '验证用户使用正确的邮箱和密码可以成功登录系统' },
      { title: '用户登录失败测试', description: '验证用户输入错误密码时显示正确的错误提示信息' },
      { title: '用户注册功能测试', description: '验证新用户可以使用邮箱注册账号' },
    ];

    for (const tc of existingTestCases) {
      await request.post('/api/testcases', {
        data: {
          projectId,
          title: tc.title,
          description: tc.description,
          status: 'UNTESTED',
          priority: 'MEDIUM',
          authorId: 'user-sarah'
        }
      });
    }

    // Refresh to load test cases
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate back to project
    await page.getByRole('heading', { name: projectName }).click();
    await page.waitForLoadState('networkidle');

    // Navigate to Requirements tab
    await page.getByRole('button', { name: 'Requirements' }).click();
    await expect(page.getByText('需求管理')).toBeVisible({ timeout: 10000 });

    // --- SETUP: Create requirement with content that will generate similar test case suggestions ---
    const reqTitle = `用户登录功能需求 ${timestamp}`;
    await page.getByRole('button', { name: '新建需求' }).click();
    const createModal = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: '新建需求' }) });
    await createModal.getByPlaceholder('输入需求标题...').fill(reqTitle);
    await createModal.getByPlaceholder('详细描述需求背景').fill('用户可以使用邮箱和密码登录系统，支持登录成功和登录失败的场景');

    // Add acceptance criteria
    await createModal.getByRole('button', { name: '验收标准' }).click();
    await createModal.getByRole('button', { name: '添加' }).click();
    await createModal.locator('textarea').last().fill('用户输入正确邮箱和密码后成功登录');
    await createModal.getByRole('button', { name: '添加' }).click();
    await createModal.locator('textarea').last().fill('用户输入错误密码时显示错误提示');

    await createModal.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText(reqTitle)).toBeVisible({ timeout: 10000 });

    // --- TEST: Open requirement and generate AI suggestions ---
    await page.getByText(reqTitle).click();
    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: '需求详情' }) });
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Navigate to 关联用例 tab
    await modal.getByRole('button', { name: '关联用例' }).click();

    // Mock AI API response for test case suggestions (these should be similar to existing ones)
    await page.route('**/api/ai/requirement', async (route) => {
      const postData = route.request().postDataJSON();

      if (postData?.fieldType === 'testCaseSuggestions') {
        // Return suggestions that are intentionally similar to existing test cases
        const mockResponse = JSON.stringify([
          { title: '登录成功测试', description: '验证用户使用正确的邮箱和密码可以成功登录', priority: 'HIGH' },
          { title: '登录失败错误提示测试', description: '验证用户输入错误密码时显示正确的错误提示', priority: 'HIGH' },
          { title: '空密码登录测试', description: '验证用户未输入密码时无法提交登录', priority: 'MEDIUM' }
        ]);
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: mockResponse
        });
      } else if (postData?.fieldType === 'checkDuplicate') {
        // Parse context to get existing test cases
        let context;
        try {
          context = JSON.parse(postData.context);
        } catch {
          context = { availableTestCases: [] };
        }

        const existingCases = context.availableTestCases || [];
        const suggestionTitle = postData.title?.toLowerCase() || '';
        const suggestionDesc = postData.description?.toLowerCase() || '';

        // Check for duplicates by comparing titles and descriptions
        let isDuplicate = false;
        let duplicateId = '';
        let duplicateTitle = '';
        let similarity = 0;

        for (const tc of existingCases) {
          const tcTitle = tc.title?.toLowerCase() || '';
          const tcDesc = tc.description?.toLowerCase() || '';

          // Simple similarity check - in real implementation this would be AI-based
          const titleMatch = suggestionTitle.includes('登录') && tcTitle.includes('登录');
          const descMatch = suggestionDesc.includes('密码') && tcDesc.includes('密码');

          if (titleMatch && descMatch) {
            // Check if they're about the same scenario (success vs failure)
            const suggestionIsSuccess = suggestionTitle.includes('成功') || suggestionDesc.includes('成功');
            const tcIsSuccess = tcTitle.includes('成功') || tcDesc.includes('成功');
            const suggestionIsFailure = suggestionTitle.includes('失败') || suggestionTitle.includes('错误') || suggestionDesc.includes('失败') || suggestionDesc.includes('错误');
            const tcIsFailure = tcTitle.includes('失败') || tcTitle.includes('错误') || tcDesc.includes('失败') || tcDesc.includes('错误');

            if ((suggestionIsSuccess && tcIsSuccess) || (suggestionIsFailure && tcIsFailure)) {
              isDuplicate = true;
              duplicateId = tc.id;
              duplicateTitle = tc.title;
              similarity = 85;
              break;
            }
          }
        }

        const mockResponse = JSON.stringify({
          isDuplicate,
          similarity,
          duplicateId,
          duplicateTitle,
          reason: isDuplicate ? '测试用例功能点与已有用例高度相似' : '未发现重复用例'
        });

        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: mockResponse
        });
      } else {
        await route.continue();
      }
    });

    // Expand AI Test Assistant panel
    const aiAssistantHeader = modal.getByText('智能测试助手');
    await expect(aiAssistantHeader).toBeVisible();
    await aiAssistantHeader.click();

    // Click 生成建议 button
    const aiSuggestBtn = modal.getByRole('button', { name: '生成建议' });
    await expect(aiSuggestBtn).toBeVisible();
    await aiSuggestBtn.click();

    // Wait for suggestions to appear
    await expect(modal.locator('.bg-blue-50').getByText('AI 推荐用例')).toBeVisible({ timeout: 30000 });
    await expect(modal.getByText('登录成功测试')).toBeVisible();
    await expect(modal.getByText('登录失败错误提示测试')).toBeVisible();

    // --- TEST: Click "检查重复" button on first suggestion ---
    // Find the first suggestion card and click its duplicate check button
    const firstSuggestionCard = modal.locator('.bg-white.border-blue-100').filter({ hasText: '登录成功测试' });
    await expect(firstSuggestionCard).toBeVisible();

    // Find and click the duplicate check button (RefreshCw icon)
    const checkDuplicateBtn = firstSuggestionCard.locator('button[title="检查重复"]');
    await expect(checkDuplicateBtn).toBeVisible();
    await checkDuplicateBtn.click();

    // --- VERIFY: Duplicate warning should appear ---
    // After checking, the suggestion should show duplicate warning with amber background
    await expect(modal.locator('.bg-amber-50').filter({ hasText: '登录成功测试' })).toBeVisible({ timeout: 10000 });

    // Verify duplicate info is shown
    await expect(modal.getByText(/发现相似用例/)).toBeVisible();
    await expect(modal.getByText(/用户登录成功测试/)).toBeVisible(); // Should show the duplicate title
    await expect(modal.getByText(/相似度.*%/)).toBeVisible(); // Should show similarity percentage

    // Verify "仍然创建" button appears for duplicate items
    await expect(modal.getByRole('button', { name: '仍然创建' })).toBeVisible();

    // --- TEST: Check a non-duplicate suggestion ---
    const thirdSuggestionCard = modal.locator('.bg-white.border-blue-100').filter({ hasText: '空密码登录测试' });
    if (await thirdSuggestionCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      const checkDuplicateBtn3 = thirdSuggestionCard.locator('button[title="检查重复"]');
      if (await checkDuplicateBtn3.isVisible({ timeout: 2000 }).catch(() => false)) {
        await checkDuplicateBtn3.click();
        // This one should NOT be marked as duplicate (stays white/pending)
        await page.waitForTimeout(2000);
        // Verify it's still in pending state (not amber)
        await expect(thirdSuggestionCard).not.toHaveClass(/bg-amber/);
      }
    }

    // Close modal
    await modal.locator('button').filter({ has: page.locator('svg.w-6.h-6') }).first().click();

    // Clean up
    page.on('dialog', dialog => dialog.accept());
    const headerCheckbox = page.locator('input[type="checkbox"]').first();
    await headerCheckbox.check();
    await page.getByText('删除').first().click();
  });

  test('AI Duplicate Check: Should allow creating duplicate anyway', async ({ page, request }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const projectName = `AI Duplicate Create Suite ${timestamp}`;
    createdProjectName = projectName;

    // --- SETUP: Create Project ---
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByPlaceholder('e.g. Mobile App V2').fill(projectName);
    const createProjectPromise = page.waitForResponse(resp => resp.url().includes('/api/projects') && resp.status() === 201);
    await page.getByRole('button', { name: 'Create Project' }).click();
    const projectResponse = await createProjectPromise;
    const project = await projectResponse.json();
    const projectId = project.id;

    await page.getByRole('heading', { name: projectName }).click();

    // Create existing test case
    await request.post('/api/testcases', {
      data: {
        projectId,
        title: '登录功能测试',
        description: '验证登录功能正常工作',
        status: 'UNTESTED',
        priority: 'MEDIUM',
        authorId: 'user-sarah'
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: projectName }).click();
    await page.getByRole('button', { name: 'Requirements' }).click();
    await expect(page.getByText('需求管理')).toBeVisible({ timeout: 10000 });

    // Create requirement
    await page.getByRole('button', { name: '新建需求' }).click();
    const createModal = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: '新建需求' }) });
    await createModal.getByPlaceholder('输入需求标题...').fill(`测试需求 ${timestamp}`);
    await createModal.getByRole('button', { name: '保存' }).click();
    await expect(page.getByText(`测试需求 ${timestamp}`)).toBeVisible({ timeout: 10000 });

    // Open requirement
    await page.getByText(`测试需求 ${timestamp}`).click();
    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByRole('heading', { name: '需求详情' }) });
    await expect(modal).toBeVisible();

    await modal.getByRole('button', { name: '关联用例' }).click();

    // Mock AI responses
    await page.route('**/api/ai/requirement', async (route) => {
      const postData = route.request().postDataJSON();

      if (postData?.fieldType === 'testCaseSuggestions') {
        const mockResponse = JSON.stringify([
          { title: '登录功能验证', description: '验证登录功能', priority: 'HIGH' }
        ]);
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: mockResponse
        });
      } else if (postData?.fieldType === 'checkDuplicate') {
        let context;
        try {
          context = JSON.parse(postData.context);
        } catch {
          context = { availableTestCases: [] };
        }
        const existingCases = context.availableTestCases || [];
        const duplicateCase = existingCases.find((tc: {title: string}) => tc.title.includes('登录'));

        const mockResponse = JSON.stringify({
          isDuplicate: !!duplicateCase,
          similarity: duplicateCase ? 80 : 0,
          duplicateId: duplicateCase?.id || '',
          duplicateTitle: duplicateCase?.title || '',
          reason: duplicateCase ? '功能点相似' : '未发现重复'
        });

        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: mockResponse
        });
      } else {
        await route.continue();
      }
    });

    // Mock test case creation
    await page.route('**/api/testcases', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: `tc-new-${Date.now()}`,
            ...body,
            createdAt: new Date().toISOString()
          })
        });
      } else {
        await route.continue();
      }
    });

    // Expand AI assistant and generate suggestions
    const aiAssistantHeader = modal.getByText('智能测试助手');
    await aiAssistantHeader.click();
    await modal.getByRole('button', { name: '生成建议' }).click();

    // Wait for suggestions
    await expect(modal.locator('.bg-blue-50').getByText('AI 推荐用例')).toBeVisible({ timeout: 30000 });
    await expect(modal.getByText('登录功能验证')).toBeVisible();

    // Check duplicate
    const suggestionCard = modal.locator('.bg-white.border-blue-100').filter({ hasText: '登录功能验证' });
    const checkBtn = suggestionCard.locator('button[title="检查重复"]');
    await checkBtn.click();

    // Wait for duplicate detection
    await expect(modal.locator('.bg-amber-50').filter({ hasText: '登录功能验证' })).toBeVisible({ timeout: 10000 });
    await expect(modal.getByText(/发现相似用例/)).toBeVisible();

    // Click "仍然创建" to create anyway
    const createAnywayBtn = modal.getByRole('button', { name: '仍然创建' });
    await expect(createAnywayBtn).toBeVisible();
    await createAnywayBtn.click();

    // Verify the suggestion is now marked as created
    await expect(modal.getByText('已创建')).toBeVisible({ timeout: 10000 });

    // Clean up
    await modal.locator('button').filter({ has: page.locator('svg.w-6.h-6') }).first().click();
    page.on('dialog', dialog => dialog.accept());
    const headerCheckbox = page.locator('input[type="checkbox"]').first();
    await headerCheckbox.check();
    await page.getByText('删除').first().click();
  });
});
