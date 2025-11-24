import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Project Import Flow', () => {
  const importFilePath = path.join(__dirname, 'temp_import_project.json');
  const importedProjectName = 'E2E Imported Project ' + Date.now();

  test.beforeAll(() => {
    // Create a valid JSON file for import
    const projectData = {
      name: importedProjectName,
      description: 'Imported via E2E Test',
      repositoryUrl: 'https://github.com/test/imported',
      suites: [
        {
          name: 'Frontend Suite',
          description: 'UI tests',
          testCases: [
            {
              title: 'Login Page Load',
              priority: 'P1',
              status: 'PASSED',
              steps: [
                { action: 'Open URL', expected: 'Page loads' }
              ]
            }
          ]
        }
      ],
      testCases: [
        {
          title: 'Root Test Case',
          priority: 'P2',
          status: 'UNTESTED'
        }
      ]
    };
    fs.writeFileSync(importFilePath, JSON.stringify(projectData, null, 2));
  });

  test.afterAll(() => {
    // Cleanup file
    if (fs.existsSync(importFilePath)) {
      fs.unlinkSync(importFilePath);
    }
  });

  test.afterEach(async ({ request }) => {
    // Cleanup project from DB
    const listRes = await request.get('/api/projects');
    if (listRes.ok()) {
      const projects = await listRes.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const project = projects.find((p: any) => p.name === importedProjectName);
      if (project) {
        await request.delete(`/api/projects?id=${project.id}`);
      }
    }
  });

  test('should import a project successfully from JSON', async ({ page }) => {
    await page.goto('/projects');
    
    // Handle Login if redirected
    const loginHeader = page.getByText('Select Account');
    if (await loginHeader.isVisible()) {
        // Robust login: find the button containing 'Sarah Jenkins'
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
            // Fallback
            await page.getByText('Sarah Jenkins').click();
        }

        // Since we visited /projects, we expect to see the Projects list after login
        await expect(page.getByText('All Projects')).toBeVisible({ timeout: 15000 });
    }

    // 1. Click Import Button
    // The button is "Import" with an Upload icon.
    // Since it's conditionally rendered for ADMIN/QA_LEAD, ensure we are logged in as one (Sarah is Admin usually).
    await expect(page.getByRole('button', { name: 'Import' })).toBeVisible();
    await page.getByRole('button', { name: 'Import' }).click();

    // 2. Verify Modal
    await expect(page.getByText('Import Project from JSON')).toBeVisible();

    // 3. Upload File
    // The input is hidden, so we use setInputFiles on the input element
    await page.setInputFiles('input[type="file"]', importFilePath);

    // 4. Check Preview
    await expect(page.getByText('Preview')).toBeVisible();
    await expect(page.getByText(importedProjectName)).toBeVisible();
    await expect(page.getByText('Suites: 1')).toBeVisible();

    // 5. Confirm Import
    const importResponsePromise = page.waitForResponse(response => 
        response.url().includes('/api/projects/import') && response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Import Project' }).click();
    
    const response = await importResponsePromise;
    if (!response.ok()) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown error, could not parse JSON' }));
        console.error('Import API Failed:', response.status(), errorBody);
    }
    expect(response.ok()).toBeTruthy();

    // 6. Verify Success Toast and Modal Close
    // Use a looser text match or wait for any toast to appear first for debugging if needed
    await expect(page.getByText(`Project "${importedProjectName}" imported successfully.`)).toBeVisible();
    await expect(page.getByText('Import Project from JSON')).not.toBeVisible();

    // 7. Verify Project in List
    await expect(page.getByRole('heading', { name: importedProjectName })).toBeVisible();

    // 8. Verify Details (Optional: Click into project)
    await page.locator('div.group', { hasText: importedProjectName }).first().click();
    await expect(page.getByRole('heading', { name: importedProjectName })).toBeVisible();
    // Check for Suite
    await expect(page.getByText('Frontend Suite')).toBeVisible();
    // Check for Root Case (might need to look at the list)
    await expect(page.getByText('Root Test Case')).toBeVisible();
  });
});
