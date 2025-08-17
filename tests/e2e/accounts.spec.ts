import { test, expect } from "@playwright/test";

test.describe("Accounts Management", () => {
  test('should add a new account with name "new_account" and $100 balance', async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Fill login form (using test credentials)
    await page.getByTestId("email-input").fill("test@user.pl");
    await page.getByTestId("password-input").fill("test_user_123!");
    await page.getByTestId("login-button").click();

    // Wait for login success message or redirect
    await expect(page.getByText("Logged in successfully")).toBeVisible({ timeout: 10000 });

    // Wait a bit more for redirect to complete
    await page.waitForTimeout(2000);

    // Navigate to the accounts page
    await page.goto("/accounts");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Debug: Check if we're actually on the accounts page
    await expect(page.getByText("Accounts")).toBeVisible();

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

    // Wait for the dialog to close and success message
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Verify the account was created by checking if it appears in the list
    await expect(page.getByText("new_account")).toBeVisible();
    await expect(page.getByText("$100.00")).toBeVisible();

    // Verify success toast message
    await expect(page.getByText("Account created successfully")).toBeVisible();
  });
});
