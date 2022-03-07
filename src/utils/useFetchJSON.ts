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
  run: () => void;
  reset: () => void;
  result: Result | undefined;
  error: Error | undefined;
} {
  const [state, setState] = useState<FetchState>("IDLE");
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<Error>();

  const run = useCallback(() => {
    setResult(undefined);
    setError(undefined);
    setState("FETCHING");
  }, []);

  const reset = useCallback(() => {
    setState("IDLE");
    setResult(undefined);
    setError(undefined);
  }, []);

  useEffect(() => {
    const performFetch = async () => {
      try {
        const response = await fetch(request, init);
        setResult((await response.json()) as Result);
        setState("SUCCESS");
      } catch (e) {
        setError(e as Error);
        setState("FAILURE");
      }
    };
    if (state === "FETCHING") {
      void performFetch();
    }
  }, [init, request, state]);

  useEffect(() => {
    if (immediate) {
      run();
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
