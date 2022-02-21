import { parse } from "papaparse";
import { useCallback, useEffect, useState } from "react";

type FetchState = "IDLE" | "FETCHING" | "SUCCESS" | "FAILURE";

/**
 * Hook to fetch data from a particular endpoint.
 *
 * @param request
 * @param init Optional request init
 * @param immediate If true, runs the fetch immediately
 * @returns
 *   Object that includes info about the current state of the fetch and
 *   methods that affect the lifecycle of the fetch.
 */
export function useFetch<Result>(
  request: RequestInfo,
  responseFormat: "csv",
  init?: RequestInit,
  immediate?: boolean
): {
  state: FetchState;
  run: () => void;
  reset: () => void;
  result: Result[] | undefined;
  error: Error | undefined;
};
export function useFetch<Result>(
  request: RequestInfo,
  responseFormat: "json",
  init?: RequestInit,
  immediate?: boolean
): {
  state: FetchState;
  run: () => void;
  reset: () => void;
  result: Result | undefined;
  error: Error | undefined;
};
export function useFetch<Result>(
  request: RequestInfo,
  responseFormat: "csv" | "json" = "csv",
  init?: RequestInit,
  immediate = true
): {
  state: FetchState;
  run: () => void;
  reset: () => void;
  result: Result | Result[] | undefined;
  error: Error | undefined;
} {
  const [state, setState] = useState<FetchState>("IDLE");
  const [result, setResult] = useState<Result | Result[]>();
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
        switch (responseFormat) {
          case "csv": {
            const text = await response.text();
            const { data } = parse<Result>(text, { header: true });
            setResult(data);
            break;
          }
          case "json":
            setResult((await response.json()) as Result);
            break;
        }
        setState("SUCCESS");
      } catch (e) {
        setError(e as Error);
        setState("FAILURE");
      }
    };
    if (state === "FETCHING") {
      void performFetch();
    }
  }, [init, request, responseFormat, state]);

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
