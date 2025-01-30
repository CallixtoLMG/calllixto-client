import { COLORS, ICONS, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from 'next/navigation';
import IconedButton from "./Iconed";

const GoBack = () => {
  const { back } = useRouter();
  const handleClick = () => {
    back();
  };

  useKeyboardShortcuts(handleClick, SHORTKEYS?.BACKSPACE)

  return (
    <IconedButton
      text="Atrás"
      icon={ICONS.ARROW_LEFT}
      color={COLORS.GREY}
      onClick={handleClick}
    />
  );
};

export default GoBack;
