import { useCallback, useEffect, useState } from "react";
import type { AccountResponseDTO } from "@/lib/schemas/account.schema";

export function useAccountDetails(accountId: number) {
  const [account, setAccount] = useState<AccountResponseDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccount = useCallback(async () => {
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
  }, [accountId]);

  // Fetch account data on mount and when accountId changes
  useEffect(() => {
    fetchAccount();
  }, [accountId, fetchAccount]);

  return {
    account,
    isLoading,
    error,
    refresh: fetchAccount,
  };
}
