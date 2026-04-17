"use client";

import { IconedButton } from "@/common/components/buttons";
import { COLORS, ICONS } from "@/common/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const getListPathFromPathname = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) return null;

  return `/${segments[0]}`;
};

const BackToListButton = () => {
  const pathname = usePathname();

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
        iconOnly
      />
    </Link>
  );
};

export default BackToListButton; 