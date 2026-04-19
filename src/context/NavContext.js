"use client";

import { createContext, useContext, useState } from "react";

const NavContext = createContext({
  navContent: null,
  setNavContent: () => {},
});

export function NavProvider({ children }) {
  const [navContent, setNavContent] = useState(null);

  return (
    <NavContext.Provider value={{ navContent, setNavContent }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavContext() {
  return useContext(NavContext);
}
