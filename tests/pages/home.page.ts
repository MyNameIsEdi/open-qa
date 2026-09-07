import { BasePage } from "./base.page";
import { type Locator, type Page } from '@playwright/test';

export class HomePage extends BasePage {

  // Hero Section
  readonly heroHeading: Locator;
  readonly subTitle1: Locator;
  readonly subTitle2: Locator;

  // Features Cards
  readonly selfHealingTestsCard: Locator;
  readonly selfHealingTestsCardTitle: Locator;
  readonly selfHealingTestsCardDescription: Locator;
  readonly selfHealingTestCardIcon: Locator;
  readonly smartDataGenCard: Locator;
  readonly smartDataGenCardTitle: Locator;
  readonly smartDataGenCardDescription: Locator;
  readonly smartDataGenCardIcon: Locator;
  readonly autoBugTriageCard: Locator;
  readonly autoBugTriageCardTitle: Locator;
  readonly autoBugTriageCardDescription: Locator;
  readonly autoBugTriageCardIcon: Locator;
  readonly claudePoweredCard: Locator;
  readonly claudePoweredCardTitle: Locator;
  readonly claudePoweredCardDescription: Locator;
  readonly claudePoweredCardIcon: Locator;
  readonly dailyMissionsCard: Locator;
  readonly dailyMissionsCardTitle: Locator;
  readonly dailyMissionsCardDescription: Locator;
  readonly dailyMissionsCardIcon: Locator;


  constructor(page: Page) {

    super(page, '/');

    // Hero Section
    this.heroHeading = page.getByRole('heading', { name: 'OPEN-QA', exact: true });
    this.subTitle1 = page.getByText('The QA Toolkit AI Is Missing', { exact: true });
    this.subTitle2 = page.getByText('Ready to install, verified, and open source', { exact: true });

    // Features Cards
    this.selfHealingTestsCard = page.getByTestId('Self-Healing Tests');
    this.selfHealingTestsCardTitle = this.selfHealingTestsCard.getByRole('heading', { name: 'Self-Healing Tests', exact: true });
    this.selfHealingTestsCardDescription = this.selfHealingTestsCard.getByText('AI suggests new locators when your UI changes — no more brittle selectors.', { exact: true });
    this.selfHealingTestCardIcon = this.selfHealingTestsCard.getByTestId('BuildOutlinedIcon');

    this.smartDataGenCard = page.getByTestId('Smart Data Gen');
    this.smartDataGenCardTitle = this.smartDataGenCard.getByRole('heading', { name: 'Smart Data Gen', exact: true });
    this.smartDataGenCardDescription = this.smartDataGenCard.getByText('Generates SQLi, XSS, nulls, RTL text and boundary payloads automatically.', { exact: true });
    this.smartDataGenCardIcon = this.smartDataGenCard.getByTestId('CasinoOutlinedIcon');

    this.autoBugTriageCard = page.getByTestId('Auto Bug Triage');
    this.autoBugTriageCardTitle = this.autoBugTriageCard.getByRole('heading', { name: 'Auto Bug Triage', exact: true });
    this.autoBugTriageCardDescription = this.autoBugTriageCard.getByText('Reads error logs and writes Jira-ready bug reports with root-cause analysis.', { exact: true });
    this.autoBugTriageCardIcon = this.autoBugTriageCard.getByTestId('BugReportOutlinedIcon');

    this.claudePoweredCard = page.getByTestId('Claude-Powered');
    this.claudePoweredCardTitle = this.claudePoweredCard.getByRole('heading', { name: 'Claude-Powered', exact: true });
    this.claudePoweredCardDescription = this.claudePoweredCard.getByText('Every agent and skill is powered by Anthropic Claude. MOCK mode requires no API key.', { exact: true });
    this.claudePoweredCardIcon = this.claudePoweredCard.getByTestId('SmartToyOutlinedIcon');

    this.dailyMissionsCard = page.getByTestId('Daily Missions');
    this.dailyMissionsCardTitle = this.dailyMissionsCard.getByRole('heading', { name: 'Daily Missions', exact: true });
    this.dailyMissionsCardDescription = this.dailyMissionsCard.getByText('Gamified QA challenges that change every day. Earn XP, build streaks, sharpen your skills.', { exact: true });
    this.dailyMissionsCardIcon = this.dailyMissionsCard.getByTestId('AssignmentOutlinedIcon');

  }

}
