import { COLORS, ICONS, SHORTKEYS } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from 'next/navigation';
import IconedButton from "./Iconed";

const GoBack = () => {
  const router = useRouter();

  const handleClick = () => {
    const prev = document.referrer || "/"; // podés usar un path fijo si lo preferís
    router.push(prev); // Esto será interceptado por nuestro hook si hay cambios
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

export default GoBack;
