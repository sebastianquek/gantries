import { useCallback, useEffect, useState } from "react";

type FetchState = "IDLE" | "FETCHING" | "SUCCESS" | "FAILURE";

/**
 * Hook to fetch JSON data from a particular endpoint.
 *
 * @param request
 * @param init Optional request init
 * @param immediate If true, runs the fetch immediately
 * @returns
 *   Object that includes info about the current state of the fetch and
 *   methods that affect the lifecycle of the fetch.
 */
export function useFetchJSON<Result>(
  request: RequestInfo,
  init?: RequestInit,
  immediate = true
): {
  state: FetchState;
  run: () => Promise<void>;
  reset: () => void;
  result: Result | undefined;
  error: Error | undefined;
} {
  const [state, setState] = useState<FetchState>("IDLE");
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<Error>();

  const run = useCallback(async () => {
    setResult(undefined);
    setError(undefined);
    setState("FETCHING");
    try {
      const response = await fetch(request, init);
      setResult((await response.json()) as Result);
      setState("SUCCESS");
    } catch (e) {
      setError(e as Error);
      setState("FAILURE");
    }
  }, [init, request]);

  const reset = useCallback(() => {
    setState("IDLE");
    setResult(undefined);
    setError(undefined);
  }, []);

  useEffect(() => {
    if (immediate) {
      void run();
    }
  }, [immediate, run]);

  return {
    state,
    run,
    reset,
    result,
    error,
  };
}
