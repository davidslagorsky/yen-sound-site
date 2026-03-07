import { createContext, useContext, useState } from "react";

// Holds the current page's theme so the Header can adapt.
// ArtistPage writes it; Header reads it.
export const PageThemeContext = createContext({ theme: "dark", setTheme: () => {} });

export function usePageTheme() {
  return useContext(PageThemeContext);
}

export function PageThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  return (
    <PageThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </PageThemeContext.Provider>
  );
}
