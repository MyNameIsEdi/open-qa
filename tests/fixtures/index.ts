import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { NavbarPage } from '../pages/navbar.page';

export const test = base.extend<{
  homePage: HomePage;
  navbar: NavbarPage;
}>({
  homePage: async ({ page }, use) => {
    await page.goto('/');
    await use(new HomePage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new NavbarPage(page));
  },
});

export { expect } from '@playwright/test';
