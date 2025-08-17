import { test, expect } from "./fixtures";

test.describe("Accounts Management", () => {
  test('should add a new account with name "new_account" and $100 balance', async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Fill login form (using test credentials)
    await page.getByTestId("email-input").fill("test@user.pl");
    await page.getByTestId("password-input").fill("test_user_123!");
    await page.getByTestId("login-button").click();

    // Wait for redirect to dashboard after login
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Navigate to the accounts page
    await page.goto("/accounts");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Debug: Check if we're actually on the accounts page
    await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();

    // Wait for the accounts view to load and check for the button
    await expect(page.getByTestId("add-account-button")).toBeVisible({ timeout: 10000 });

    // Click the "Add Account" button
    await page.getByTestId("add-account-button").click();

    // Wait for the dialog to open
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Add New Account")).toBeVisible();

    // Fill in the account name
    await page.getByTestId("account-name-input").fill("new_account");

    // Fill in the initial balance
    await page.getByTestId("account-balance-input").fill("100");

    // Submit the form
    await page.getByTestId("submit-account-button").click();

    // Wait for any response and dialog to close
    await page.waitForTimeout(2000);

    // Try to wait for dialog to close
    try {
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    } catch {
      // If dialog doesn't close, close it manually
      await page.keyboard.press("Escape");
    }

    // Verify the account was created by checking if it appears in the list
    await expect(page.getByText("new_account")).toBeVisible();
    await expect(page.getByText("$100.00")).toBeVisible();
  });

  test("should navigate to account detail view and display correct balance", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Fill login form (using test credentials)
    await page.getByTestId("email-input").fill("test@user.pl");
    await page.getByTestId("password-input").fill("test_user_123!");
    await page.getByTestId("login-button").click();

    // Wait for redirect to dashboard after login
    await page.waitForURL("**/dashboard", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    // Navigate to the accounts page
    await page.goto("/accounts");
    await page.waitForLoadState("networkidle");

    // Verify we're on accounts page
    await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();

    // Create account for this test (database is cleaned before each test)
    await page.getByTestId("add-account-button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByTestId("account-name-input").fill("new_account");
    await page.getByTestId("account-balance-input").fill("100");
    await page.getByTestId("submit-account-button").click();

    // Wait for dialog to close
    try {
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
    } catch {
      await page.keyboard.press("Escape");
    }

    // Click on the account to navigate to detail view
    await page.getByText("new_account").click();

    // Wait for account detail page to load
    await page.waitForLoadState("networkidle");

    // Verify we're on the account detail page - look for the account name in a heading or title
    await expect(page.getByRole("heading", { name: "new_account" })).toBeVisible();

    // Verify the balance is displayed correctly - should be $100.00 (current_balance from transactions)
    await expect(page.getByText("Balance: $100.00")).toBeVisible();
  });
});
