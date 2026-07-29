import { test, expect } from "@playwright/test";

test.describe("Invoice Management Flows", () => {
  test("Dashboard loads and displays initial invoices", async ({ page }) => {
    // Navigate to the root URL
    await page.goto("/");

    // Verify the page header
    await expect(
      page.getByRole("heading", { name: "Invoices", exact: true }),
    ).toBeVisible();

    // The mock API has a delay, so we should see the loading state first
    // Then wait for the mock data (e.g., Acme Corp) to appear in the table
    await expect(page.getByText("Acme Corp")).toBeVisible();
    await expect(page.getByText("Globex Inc")).toBeVisible();
  });

  test("Search functionality filters the invoice list", async ({ page }) => {
    await page.goto("/");

    // Wait for the table to populate
    await expect(page.getByText("Acme Corp")).toBeVisible();

    // Locate the search bar and type a query
    const searchInput = page.getByPlaceholder(
      "Search by invoice or customer...",
    );
    await searchInput.fill("Acme");

    // Verify "Acme Corp" is still visible
    await expect(page.getByText("Acme Corp")).toBeVisible();

    // Verify "Globex Inc" has been filtered out
    await expect(page.getByText("Globex Inc")).not.toBeVisible();
  });

  test("User can create a new invoice and see it on the dashboard", async ({
    page,
  }) => {
    await page.goto("/");

    // Navigate to Create Invoice page
    await page.getByRole("link", { name: "Create Invoice" }).click();

    // Verify we are on the form page
    await expect(
      page.getByRole("heading", { name: "Create New Invoice" }),
    ).toBeVisible();

    // Fill out the base invoice details
    const uniqueCustomer = `Test Customer ${Date.now()}`;
    await page.locator('input[name="customerName"]').fill(uniqueCustomer);

    // The dates are pre-filled by our form's defaultValues, but let's change the currency
    await page.locator('select[name="currency"]').selectOption("EUR");

    // Fill out the dynamic line item
    // Since we didn't use <label htmlFor="..."> for the mobile view inputs, we can use placeholders
    await page.getByPlaceholder("Item description").fill("E2E Test Services");

    // Fill quantity and price (getting inputs by their associated labels for desktop view)
    // The previous code mapped labels generically, so we can also select them by their value or position
    const qtyInput = page.locator('input[type="number"]').first();
    const priceInput = page.locator('input[type="number"]').nth(1);

    await qtyInput.fill("5");
    await priceInput.fill("100"); // 5 * 100 = 500

    // Verify the live calculation works
    await expect(
      page.getByText("Grand Total").locator("..").getByText("€500.00"),
    ).toBeVisible();

    // Submit the form
    await page.getByRole("button", { name: "Save Invoice" }).click();

    // Verify button goes into loading state
    await expect(page.getByRole("button", { name: "Saving..." })).toBeVisible();

    // Verify we are redirected back to the dashboard automatically
    await expect(
      page.getByRole("heading", { name: "Invoices", exact: true }),
    ).toBeVisible();

    // Verify the newly created invoice is now at the top of the table
    await expect(page.getByText(uniqueCustomer)).toBeVisible();
    await expect(page.getByRole("cell", { name: "€500.00" })).toBeVisible();
  });
});
