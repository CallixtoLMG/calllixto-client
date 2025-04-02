// useRouteHistory.js
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const useRouteHistory = () => {
  const pathname = usePathname();
  const historyRef = useRef([]);

  useEffect(() => {
    const current = historyRef.current;
    if (current[current.length - 1] !== pathname) {
      current.push(pathname);
    }
  }, [pathname]);

  const getLast = () => {
    const current = historyRef.current;
    if (current.length >= 2) {
      return current[current.length - 2]; // ruta anterior real
    }
    return "/";
  };

  return {
    getLast,
    history: historyRef.current,
  };
};
