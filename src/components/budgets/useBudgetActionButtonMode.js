import { useEffect, useState } from "react";

const MOBILE_BUDGET_ACTION_QUERY = "(max-width: 767px)";
const MOBILE_BUDGET_ACTION_TEXT_QUERY = "(min-width: 501px) and (max-width: 767px)";

export const useBudgetActionButtonMode = () => {
  const [mode, setMode] = useState({ isMobile: false, showText: false });

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_BUDGET_ACTION_QUERY);
    const textQuery = window.matchMedia(MOBILE_BUDGET_ACTION_TEXT_QUERY);
    const updateMode = () => setMode({
      isMobile: mobileQuery.matches,
      showText: textQuery.matches,
    });

    updateMode();
    mobileQuery.addEventListener("change", updateMode);
    textQuery.addEventListener("change", updateMode);

    return () => {
      mobileQuery.removeEventListener("change", updateMode);
      textQuery.removeEventListener("change", updateMode);
    };
  }, []);

  return mode;
};
