import { useEffect, useState } from "react";
import type { Tables } from "@/db/database.types";

export function useAccountDetails(accountId: number) {
  const [account, setAccount] = useState<Tables<"accounts"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchAccount() {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/accounts/${accountId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch account");
        }

        setAccount(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccount();
  }, [accountId]);

  return {
    account,
    isLoading,
    error,
  };
}
