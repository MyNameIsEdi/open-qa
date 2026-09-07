import { BasePage } from "./base.page";
import { type Locator, type Page } from '@playwright/test';

export class NavbarPage extends BasePage {

  readonly githubLink: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.githubLink = page.getByRole('link', { name: 'GitHub' });
  }

  async clickGithubLink() {
    await this.githubLink.click();
  }

}
