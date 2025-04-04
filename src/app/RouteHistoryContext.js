"use client";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";

const RouteHistoryContext = createContext();

export const RouteHistoryProvider = ({ children }) => {
  const pathname = usePathname();
  const historyRef = useRef([]);

  useEffect(() => {
    const current = historyRef.current;
    if (current[current.length - 1] !== pathname) {
      current.push(pathname);
    }
  }, [pathname]);

  const goBackRoute = useCallback(() => {
    const current = historyRef.current;
    if (current.length >= 2) {
      current.pop(); 
      return current[current.length - 1];
    }
    return "/";
  }, []);

  return (
    <RouteHistoryContext.Provider value={{ goBackRoute }}>
      {children}
    </RouteHistoryContext.Provider>
  );
};

export const useRouteHistory = () => useContext(RouteHistoryContext);
