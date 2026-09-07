import { test, expect } from './fixtures';

test.describe('Home Page', () => {
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
      await test.step('should display Self-Healing Tests Cards', async () => {
        await expect(homePage.selfHealingTestsCard).toBeVisible();
      });
      await test.step('should display Self-Healing Tests Cards Title, description and icon', async () => {
        await expect.soft(homePage.selfHealingTestsCardTitle).toBeVisible();
        await expect.soft(homePage.selfHealingTestsCardDescription).toBeVisible();
        await expect.soft(homePage.selfHealingTestCardIcon).toBeVisible();
      });
    });
    test('should display Smart Data Gen Card', async ({ homePage }) => {
      await test.step('should display Smart Data Gen Card', async () => {
        await expect(homePage.smartDataGenCard).toBeVisible();
      });
      await test.step('should display Smart Data Gen Card Title, description and icon', async () => {
        await expect.soft(homePage.smartDataGenCardTitle).toBeVisible();
        await expect.soft(homePage.smartDataGenCardDescription).toBeVisible();
        await expect.soft(homePage.smartDataGenCardIcon).toBeVisible();
      });
    });
    test('should display Auto Bug Triage Card', async ({ homePage }) => {
      await test.step('should display Auto Bug Triage Card', async () => {
        await expect(homePage.autoBugTriageCard).toBeVisible();
      });
      await test.step('should display Auto Bug Triage Card Title, description and icon', async () => {
        await expect.soft(homePage.autoBugTriageCardTitle).toBeVisible();
        await expect.soft(homePage.autoBugTriageCardDescription).toBeVisible();
        await expect.soft(homePage.autoBugTriageCardIcon).toBeVisible();
      });
    });
    test('should display Claude Powered Card', async ({ homePage }) => {
      await test.step('should display Claude Powered Card', async () => {
        await expect(homePage.claudePoweredCard).toBeVisible();
      });
      await test.step('should display Claude Powered Card Title, description and icon', async () => {
        await expect.soft(homePage.claudePoweredCardTitle).toBeVisible();
        await expect.soft(homePage.claudePoweredCardDescription).toBeVisible();
        await expect.soft(homePage.claudePoweredCardIcon).toBeVisible();
      });
    });
    test('should display Daily Missions Card', async ({ homePage }) => {
      await test.step('should display Daily Missions Card', async () => {
        await expect(homePage.dailyMissionsCard).toBeVisible();
      });
      await test.step('should display Daily Missions Card Title, description and icon', async () => {
        await expect.soft(homePage.dailyMissionsCardTitle).toBeVisible();
        await expect.soft(homePage.dailyMissionsCardDescription).toBeVisible();
        await expect.soft(homePage.dailyMissionsCardIcon).toBeVisible();
      });
    });
  });
});
