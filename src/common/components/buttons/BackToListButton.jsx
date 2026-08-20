"use client";

import { IconedButton } from "@/common/components/buttons";
import { COLORS, CONTENT_SIZES, ICONS } from "@/common/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

const getListPathFromPathname = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) return null;

  return `/${segments[0]}`;
};

const BackToListButton = () => {
  const pathname = usePathname();
  const { isMobile, showText } = useIsMobileNavigationButton();

  const segments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const listPath = useMemo(() => getListPathFromPathname(pathname), [pathname]);

  const showButton = segments.length > 1 && !!listPath;

  if (!showButton) return null;

  return (
    <Link href={listPath}>
      <IconedButton
        icon={ICONS.LIST_ALTERNATE}
        color={COLORS.BLUE}
        text="Volver al listado"
        iconOnly={!showText}
        popupDisabled={isMobile}
        width={showText ? CONTENT_SIZES.FIT : undefined}
      />
    </Link>
  );
};

export default BackToListButton;
