import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

// ─── Test Data ───────────────────────────────────────────────────────────────
const HOTEL_NAME = 'Muong Thanh Saigon Centre Hotel';
const CHECK_IN_OFFSET = 2; // current date + 2
const CHECK_OUT_OFFSET = 3; // current date + 3
const ROOMS = 1;
const ADULTS = 4;
const CHILDREN = 2;
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Hotel Price Search on Agoda', () => {
  /**
   * TC-001: Verify that hotel price is displayed after searching
   * with specific hotel name, dates, and occupancy settings.
   *
   * Steps:
   *  1. Navigate to https://www.agoda.com
   *  2. Type hotel name in the search box and select from autocomplete
   *  3. Select check-in date (today + 2)
   *  4. Select check-out date (today + 3)
   *  5. Set occupancy: 1 room, 4 adults, 2 children
   *  6. Click the Search button
   *  7. Wait for search results to load
   *  8. Click the first available hotel option
   *  9. Verify that a price is displayed on the hotel page
   *
   * Expected Result: A price is displayed on the hotel detail page,
   *      indicating that the search and selection process worked correctly.
   */
  test('TC-001: Should display hotel price for Muong Thanh Saigon Centre Hotel', async ({
    page,
    context,
  }) => {
    const homePage = new HomePage(page);

    // Step 1: Go to Agoda homepage
    await homePage.goto();

    // Step 2: Search for the hotel by name
    await homePage.searchHotel(HOTEL_NAME);

    // Step 3 & 4: Select check-in and check-out dates
    await homePage.selectCheckInDate(CHECK_IN_OFFSET);
    await homePage.selectCheckOutDate(CHECK_OUT_OFFSET);

    // Step 5: Set occupancy (1 room is default; set 4 adults, 2 children)
    await homePage.setOccupancy(ADULTS, CHILDREN);

    // Step 6: Click Search
    await homePage.clickSearch();

    // Step 7 & 8: Wait for results and click the first hotel card
    const searchResultsPage = new SearchResultsPage(homePage.page);
    await searchResultsPage.waitForResults();

    // Step 9: Verify price
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      searchResultsPage.hotelCards.first().click(),
    ]);

    await newTab.waitForLoadState('domcontentloaded');

    const detailPage = new SearchResultsPage(newTab);
    await detailPage.verifyPriceIsDisplayed();
  });
});
