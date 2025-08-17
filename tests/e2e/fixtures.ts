import { test as base } from "@playwright/test";
import { cleanupUserData, verifyCleanDatabase } from "./utils/database";

interface TestFixtures {
  cleanDatabase: never;
}

interface WorkerFixtures {
  databaseCleanup: never;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped fixture: cleanup after all tests in the worker
  databaseCleanup: [
    async (_, use) => {
      // Setup: Could initialize test data here if needed

      await use();

      // Teardown: Clean up after all tests in this worker complete
      const testUserId = process.env.E2E_USERNAME_ID;
      if (testUserId) {
        await cleanupUserData(testUserId);
        await verifyCleanDatabase(testUserId);
      }
    },
    { scope: "worker", auto: true },
  ],

  // Test-scoped fixture: cleanup before each test
  cleanDatabase: [
    async (_, use) => {
      // Setup: Clean database before each test
      const testUserId = process.env.E2E_USERNAME_ID;
      if (testUserId) {
        await cleanupUserData(testUserId);
      }

      await use();

      // Optional: Could also clean after each test
      // if (testUserId) await cleanupUserData(testUserId);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
