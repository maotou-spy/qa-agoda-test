import { Page, Locator, expect } from '@playwright/test';
import { formatAriaDateLabel, getOffsetDay } from '../utils/dateHelper';

export class HomePage {
  page: Page;

  // Search box
  readonly searchInput: Locator;

  // Date pickers
  readonly checkInButton: Locator;
  readonly checkOutButton: Locator;

  // Occupancy
  readonly occupancyButton: Locator;
  readonly adultsIncreaseButton: Locator;
  readonly adultsDecreaseButton: Locator;
  readonly childrenIncreaseButton: Locator;
  readonly addSecondChildButton: Locator;

  // Search submit
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchInput = page.locator('[data-selenium="textInput"]');

    this.checkInButton = page.locator('[data-selenium="checkInBox"]');
    this.checkOutButton = page.locator('[data-selenium="checkOutBox"]');

    this.occupancyButton = page.locator('[data-element-name="occupancy-box"]');
    // Adults controls inside occupancy panel
    this.adultsIncreaseButton = page.getByRole('button', {
      name: 'Add Adults',
    });
    this.adultsDecreaseButton = page.getByRole('button', {
      name: 'Subtracts Adults',
    });
    this.childrenIncreaseButton = page.getByRole('button', {
      name: 'Add Children',
    });
    this.addSecondChildButton = page.getByRole('button', {
      name: 'Add Child',
    });

    this.searchButton = page.getByRole('button', { name: 'SEARCH' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    // Dismiss cookie/popup banners if present
    await this.dismissPopupsIfPresent();
  }

  private async dismissPopupsIfPresent(): Promise<void> {
    // Close sign-in modal if it appears
    const closeModal = this.page.locator(
      '[data-element-name="close-sign-in-dialog"]',
    );
    if (await closeModal.isVisible({ timeout: 4000 }).catch(() => false)) {
      await closeModal.click();
    }
  }

  async searchHotel(hotelName: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(hotelName);

    await this.page.getByRole('button', { name: 'Close' }).click();

    // Wait for autocomplete suggestion and click the matching one
    const suggestion = this.page
      .getByRole('option', { name: hotelName })
      .first();
    await suggestion.waitFor({ state: 'visible', timeout: 10_000 });
    // await suggestion.click();

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      suggestion.click(),
    ]);

    await this.page.waitForLoadState('networkidle');
  }

  async selectCheckInDate(offsetDays: number): Promise<void> {
    // After choose hotel, auto open check-in calendar, just pick the date
    // await this.checkInButton.click();
    await this.pickDayOnCalendar(offsetDays);
  }

  async selectCheckOutDate(offsetDays: number): Promise<void> {
    // After selecting check-in, the calendar may auto-advance to check-out
    await this.pickDayOnCalendar(offsetDays);
  }

  /**
   * Clicks the correct day cell in the visible calendar.
   * Navigates to next month if the target day is not visible.
   */
  private async pickDayOnCalendar(offsetDays: number): Promise<void> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + offsetDays);

    // Try to find the day cell in the current calendar view, if not found click next month and try again (up to 3 times)
    const dayCell = this.page.getByRole('gridcell', {
      name: formatAriaDateLabel(targetDate),
    });

    console.log(
      `Selecting date: ${targetDate.toDateString()} with aria-label: ${formatAriaDateLabel(targetDate)}`,
    );
    console.log(
      `Looking for day cell with name: ${formatAriaDateLabel(targetDate)}`,
    );

    const nextMonthButton = this.page.getByRole('button', {
      name: 'Next month',
    });

    for (let i = 0; i < 3; i++) {
      console.log(dayCell.isVisible());
      if (await dayCell.isVisible()) {
        await dayCell.click();
        return;
      }
      await nextMonthButton.click();
      // await this.page.waitForTimeout(400);
    }
  }

  /**
   * Sets occupancy: 1 room, 4 adults, 2 children.
   * Agoda default is 2 adults, 0 children, 1 room.
   */
  async setOccupancy(adults: number, children: number): Promise<void> {
    // Auto open occupancy after pick date
    // await this.occupancyButton.click();

    // --- Adults ---
    // Get current adults count and adjust
    const adultsCountLocator = this.page.locator(
      '[data-selenium="desktop-occ-adult-value"]',
    );
    let currentAdults = parseInt(
      (await adultsCountLocator.textContent()) ?? '2',
      10,
    );

    while (currentAdults < adults) {
      await this.adultsIncreaseButton.click();
      currentAdults++;
    }
    while (currentAdults > adults) {
      await this.adultsDecreaseButton.click();
      currentAdults--;
    }

    // --- Children ---
    const childrenCountLocator = this.page.locator(
      '[data-selenium="desktop-occ-children-value"]',
    );
    let currentChildren = parseInt(
      (await childrenCountLocator.textContent()) ?? '0',
      10,
    );

    console.log(`Current children: ${currentChildren}, target: ${children}`);

    while (currentChildren < children) {
      if (currentChildren === 1) {
        // For the 2nd child, Agoda shows a different button
        await this.addSecondChildButton.click();
        currentChildren++;
        continue;
      }

      await this.childrenIncreaseButton.click();
      currentChildren++;
    }

    // Set children ages if age selectors appear (Agoda requires ages for children)
    const ageSelectors = this.page.locator(
      '[data-element-name="occ-child-age-dropdown"]',
    );
    const ageCount = await ageSelectors.count();
    // Get 1st in list
    for (let i = 0; i < ageCount; i++) {
      // Mở dropdown của child thứ i
      await ageSelectors.nth(i).click();

      // Chọn option tuổi 5 của child thứ i
      const option = this.page.locator(
        `[data-testid="child-ages-dropdown-${i}-5"]`,
      );
      await option.waitFor({ state: 'visible' });
      await option.click();
    }
  }

  async clickSearch(): Promise<void> {
    await this.searchButton.click();
  }
}
