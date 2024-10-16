import { COLORS, ICONS, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from 'next/navigation';
import { IconnedButton } from ".";

const GoBack = () => {
  const { back } = useRouter();
  const handleClick = () => {
    back();
  };

  useKeyboardShortcuts(handleClick, SHORTKEYS.BACKSPACE)

  return (
    <IconnedButton
      text="Atrás"
      icon={ICONS.ARROW_LEFT}
      color={COLORS.GREY}
      onClick={handleClick}
    />
  );
};

export default GoBack;
