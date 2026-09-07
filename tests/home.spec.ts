import { test, expect } from './fixtures';

test.describe('Home Page', () => {

  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test.describe('Hero section', () => {

    test('should display the title', async ({ homePage }) => {
      await expect(homePage.heroHeading).toBeVisible();
    });

    test('should display the sub title', async ({ homePage }) => {
      await expect(homePage.subTitle1).toBeVisible();
    });

    test('should display the sub title 2', async ({ homePage }) => {
      await expect(homePage.subTitle2).toBeVisible();
    });

  });

  test.describe('Features Cards', () => {

    test('should display Self-Healing Tests Cards', async ({ homePage }) => {
      await expect(homePage.selfHealingTestsCard).toBeVisible();
      await expect(homePage.selfHealingTestsCardTitle).toBeVisible();
      await expect(homePage.selfHealingTestsCardDescription).toBeVisible();
      await expect(homePage.selfHealingTestCardIcon).toBeVisible();
    });

    test('should display Smart Data Gen Card', async ({ homePage }) => {
      await expect(homePage.smartDataGenCard).toBeVisible();
      await expect(homePage.smartDataGenCardTitle).toBeVisible();
      await expect(homePage.smartDataGenCardDescription).toBeVisible();
      await expect(homePage.smartDataGenCardIcon).toBeVisible();
    });

    test('should display Auto Bug Triage Card', async ({ homePage }) => {
      await expect(homePage.autoBugTriageCard).toBeVisible();
      await expect(homePage.autoBugTriageCardTitle).toBeVisible();
      await expect(homePage.autoBugTriageCardDescription).toBeVisible();
      await expect(homePage.autoBugTriageCardIcon).toBeVisible();
    });

    test('should display Claude Powered Card', async ({ homePage }) => {
      await expect(homePage.claudePoweredCard).toBeVisible();
      await expect(homePage.claudePoweredCardTitle).toBeVisible();
      await expect(homePage.claudePoweredCardDescription).toBeVisible();
      await expect(homePage.claudePoweredCardIcon).toBeVisible();
    });

    test('should display Daily Missions Card', async ({ homePage }) => {
      await expect(homePage.dailyMissionsCard).toBeVisible();
      await expect(homePage.dailyMissionsCardTitle).toBeVisible();
      await expect(homePage.dailyMissionsCardDescription).toBeVisible();
    });

  });

});
