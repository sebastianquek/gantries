import { useCallback, useEffect, useState } from "react";

export const useMatchMedia = (mediaQuery: string): boolean => {
  const [isMatch, setIsMatch] = useState(false);

  const onMediaChange = useCallback((e: MediaQueryListEvent) => {
    setIsMatch(e.matches);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia(mediaQuery);
    setIsMatch(mql.matches);

    mql.addEventListener("change", onMediaChange);
    return () => mql.removeEventListener("change", onMediaChange);
  }, [mediaQuery, onMediaChange]);

  return isMatch;
};
