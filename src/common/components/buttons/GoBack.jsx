import { useRouteHistory } from "@/app/RouteHistoryContext";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks";
import { useRouter } from "next/navigation";
import IconedButton from "./Iconed";

const GoBackButton = () => {
  const router = useRouter();
  const { goBackRoute } = useRouteHistory();

  const handleClick = () => {
    const previous = goBackRoute();
    if (previous && previous !== location.pathname) {
      router.push(previous);
    } else {
      router.push(PAGES.BASE);
    }
  };

  useKeyboardShortcuts(handleClick, SHORTKEYS?.BACKSPACE);

  return (
    <IconedButton
      text="Atrás"
      icon={ICONS.ARROW_LEFT}
      color={COLORS.GREY}
      onClick={handleClick}
    />
  );
};

export default GoBackButton;
