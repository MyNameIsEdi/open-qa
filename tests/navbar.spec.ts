import { test, expect } from './fixtures';
import { GITHUB_REPO_URL } from './data/navbar.data';

test.describe('Test Navbar from Home Page', () => {
  test('should display github link', async ({ homePage: _homePage, navbar }) => {
    await test.step('github link is visible', async () => {
      await expect(navbar.githubLink).toBeVisible();
    });
    await test.step('github link attributes href, target and rel', async () => {
      await expect.soft(navbar.githubLink).toHaveAttribute('href', GITHUB_REPO_URL);
      await expect.soft(navbar.githubLink).toHaveAttribute('target', '_blank');
      await expect.soft(navbar.githubLink).toHaveAttribute('rel', /noopener/);
    });
  });
  test('should navigate to github repository', async ({ homePage: _homePage, navbar, page }) => {
    const newTabPromise = page.context().waitForEvent('page');
    await navbar.clickGithubLink();
    const githubPage = await newTabPromise;
    await expect(githubPage).toHaveURL(/github\.com\/MyNameIsEdi\/open-qa/);
    await githubPage.close();
  });
  test('GitHub link is hidden on mobile', async ({ homePage, navbar, page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.goto();
    await expect(navbar.githubLink).toBeHidden();
  });
});
