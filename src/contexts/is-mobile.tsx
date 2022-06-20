import type { PropsWithChildren } from "react";

import { createContext, useContext } from "react";

import { useMatchMedia } from "src/hooks/use-match-media";

const IsMobileContext = createContext<boolean>(false);

export const IsMobileProvider = ({ children }: PropsWithChildren<unknown>) => {
  const isMobile = useMatchMedia("(max-width: 768px)");

  return (
    <IsMobileContext.Provider value={isMobile}>
      {children}
    </IsMobileContext.Provider>
  );
};

export const useIsMobileContext = () => useContext(IsMobileContext);
