import { Page, Locator, expect } from '@playwright/test';

export class SearchResultsPage {
  readonly page: Page;

  readonly hotelCards: Locator;
  readonly priceLocator: Locator;

  constructor(page: Page) {
    this.page = page;

    this.hotelCards = page.locator('[data-selenium="hotel-item"]');

    this.priceLocator = page.locator(
      '[data-element-name="cheapest-room-price-property-nav-bar"]',
    );
  }

  /**
   * Waits for at least one search result to appear.
   */
  async waitForResults(): Promise<void> {
    await this.hotelCards.first().waitFor({ state: 'visible', timeout: 30000 });
  }

  /**
   * Clicks the first available hotel card in the results list.
   */
  async clickFirstResult(): Promise<void> {
    await this.waitForResults();
    await this.hotelCards.first().click();
  }

  /**
   * Verifies that at least one price element is visible and contains a numeric value.
   */
  async verifyPriceIsDisplayed(): Promise<void> {
    // Wait for the price element to be visible
    // await this.page.waitForLoadState('networkidle');

    await this.priceLocator
      .first()
      .waitFor({ state: 'attached', timeout: 20000 });
    const priceText = await this.priceLocator.first().textContent();

    // Price must contain at least one digit
    expect(priceText).toMatch(/\d/);
    expect(priceText).not.toBeNull();

    console.log(`Price displayed: ${priceText?.trim()}`);
  }
}
