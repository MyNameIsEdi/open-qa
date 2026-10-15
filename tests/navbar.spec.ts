import { type Page } from '@playwright/test';
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
  test('should navigate to github repository', async ({ homePage: _homePage, navbar }) => {
    let newTabPromise!: Promise<Page>;

    await test.step('wait for the new tab', async () => {
      newTabPromise = navbar.page.context().waitForEvent('page');
    });
    await test.step('click the GitHub link', async () => {
      await navbar.clickGithubLink();
    });
    const githubPage = await test.step('GitHub tab opens the repository', async () => {
      const openedPage = await newTabPromise;
      await expect(openedPage).toHaveURL(/github\.com\/MyNameIsEdi\/open-qa/);
      return openedPage;
    });
    await test.step('close the GitHub tab', async () => {
      await githubPage.close();
    });
  });
  test('GitHub link is hidden on mobile', async ({ homePage, navbar }) => {
    await test.step('set a mobile viewport', async () => {
      await homePage.page.setViewportSize({ width: 375, height: 667 });
    });
    await test.step('reload Home at the mobile viewport', async () => {
      await homePage.goto();
    });
    await test.step('GitHub link is hidden', async () => {
      await expect(navbar.githubLink).toBeHidden();
    });
  });
});
