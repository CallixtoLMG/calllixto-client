import { useRouteHistory } from "@/app/RouteHistoryContext";
import { COLORS, CONTENT_SIZES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import IconedButton from "./Iconed";

const MOBILE_NAV_BUTTON_QUERY = "(max-width: 767px)";
const MOBILE_NAV_BUTTON_TEXT_QUERY = "(min-width: 501px) and (max-width: 767px)";

const useIsMobileNavigationButton = () => {
  const [mode, setMode] = useState({ isMobile: false, showText: false });

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_NAV_BUTTON_QUERY);
    const textQuery = window.matchMedia(MOBILE_NAV_BUTTON_TEXT_QUERY);
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

const GoBackButton = () => {
  const router = useRouter();
  const { goBackRoute } = useRouteHistory();
  const { isMobile, showText } = useIsMobileNavigationButton();

  const handleClick = () => {
    const previous = goBackRoute();
    if (previous && previous !== location.pathname) {
      router.push(previous);
    } else {
      router.push(PAGES.BUDGETS.BASE);
    }
  };

  useKeyboardShortcuts(handleClick, SHORTKEYS?.BACKSPACE);

  return (
    <IconedButton
      text="Atrás"
      icon={ICONS.ARROW_LEFT}
      color={COLORS.GREY}
      onClick={handleClick}
      iconOnly={!showText}
      popupDisabled={isMobile}
      width={showText ? CONTENT_SIZES.FIT : undefined}
    />
  );
};

export default GoBackButton;
